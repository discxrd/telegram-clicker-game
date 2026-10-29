import asyncio
import json
import logging
import os
import random

import aiohttp
from aiogram import Bot, Dispatcher
from motor.motor_asyncio import AsyncIOMotorClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
ALLOWED_UPDATES = ["message", "my_chat_member", "chat_member", "chat_join_request"]


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def load_config():
    config = {}
    config_path = os.getenv("CONFIG_JSON_PATH", "config.json")

    try:
        with open(config_path, "r") as config_file:
            config = json.load(config_file)
    except FileNotFoundError:
        logger.info("config.json file not found, using environment variables.")
    except json.JSONDecodeError:
        logger.error("Invalid JSON in config.json file.")

    config["token"] = os.getenv("BOT_TOKEN", config.get("token"))
    config["BASE_URL"] = os.getenv(
        "BASE_URL",
        config.get("BASE_URL") or os.getenv("APP_URL", config.get("url", "")),
    )
    config["webhook_secret"] = os.getenv(
        "WEBHOOK_SECRET", config.get("webhook_secret", "charonchiki")
    )

    if config.get("BASE_URL"):
        config["BASE_URL"] = config["BASE_URL"].rstrip("/")

    return config


config = load_config()
BOT_TOKEN = config.get("token") or ""
BASE_URL = config.get("BASE_URL")
WEBHOOK_SECRET = config.get("webhook_secret", "charonchiki")
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
USE_WEBHOOK = env_bool("BOT_USE_WEBHOOK", False)
INTERNAL_WEBHOOK_URL = os.getenv("INTERNAL_WEBHOOK_URL", "http://backend:3000/webhook")

mongo_client = AsyncIOMotorClient(MONGODB_URI)
db = mongo_client.db
users_collection = db.users
ads_collection = db.ads

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


def avatar_url(user_id: int) -> str:
    return f"{BASE_URL}/get_avatar?telegram_id={user_id}"


async def download_and_save_avatar(user_id: int, file) -> str:
    avatar_path = f"./avatar/{user_id}.png"
    try:
        os.makedirs("./avatar", exist_ok=True)
        file_content = await bot.download_file(file.file_path)
        if file_content is None:
            return avatar_url(11)
        with open(avatar_path, "wb") as avatar_file:
            avatar_file.write(file_content.read())
        return avatar_url(user_id)
    except Exception as exc:
        logger.error("Error downloading avatar for user %s: %s", user_id, exc)
        return avatar_url(11)


async def random_data():
    async with aiohttp.ClientSession() as session:
        async with session.get("https://randomuser.me/api/") as response:
            if response.status == 200:
                data = await response.json()
                if "results" in data and len(data["results"]) > 0:
                    user = data["results"][0]
                    return f"{user['name']['first']} {user['name']['last']}"
    return None


async def check_and_update_avatars():
    while True:
        try:
            async for user in users_collection.find({}):
                if "top_name" not in str(user):
                    await users_collection.update_one(
                        {"user_id": user["user_id"]},
                        {"$set": {"top_name": (await random_data())}},
                    )

                try:
                    user_id = user["user_id"]
                    user_profile_photos = await bot.get_user_profile_photos(
                        user_id, limit=1
                    )

                    if user_profile_photos.photos:
                        file_id = user_profile_photos.photos[0][-1].file_id
                        file_info = await bot.get_file(file_id)
                        new_avatar_url = await download_and_save_avatar(
                            user_id, file_info
                        )

                        if new_avatar_url and user.get("avatar_url") != new_avatar_url:
                            await users_collection.update_one(
                                {"user_id": user_id},
                                {"$set": {"avatar_url": new_avatar_url}},
                            )
                            logger.info("Updated avatar for user %s", user_id)
                    else:
                        await users_collection.update_one(
                            {"user_id": user_id},
                            {"$set": {"avatar_url": avatar_url(11)}},
                        )
                except Exception as exc:
                    logger.error("Error in check_and_update_avatars: %s", exc)

            await asyncio.sleep(random.randint(3600, 7200))
        except Exception as exc:
            logger.error("Error in check_and_update_avatars: %s", exc)
            await asyncio.sleep(300)


async def forward_update(session: aiohttp.ClientSession, update) -> None:
    payload = update.model_dump(
        mode="json", by_alias=True, exclude_none=True, exclude_defaults=True
    )
    async with session.post(
        INTERNAL_WEBHOOK_URL,
        json=payload,
        headers={"X-Telegram-Bot-Api-Secret-Token": WEBHOOK_SECRET},
    ) as response:
        if response.status >= 400:
            response_text = await response.text()
            raise RuntimeError(
                f"backend webhook returned {response.status}: {response_text}"
            )


async def run_polling_bridge() -> None:
    logger.info("Bot is starting in polling mode")
    await bot.delete_webhook(drop_pending_updates=False)

    offset = None
    timeout = aiohttp.ClientTimeout(total=40)

    async with aiohttp.ClientSession(timeout=timeout) as session:
        while True:
            try:
                updates = await bot.get_updates(
                    offset=offset,
                    timeout=30,
                    allowed_updates=ALLOWED_UPDATES,
                )
                for update in updates:
                    await forward_update(session, update)
                    offset = update.update_id + 1
            except Exception as exc:
                logger.error("Polling bridge error: %s", exc)
                await asyncio.sleep(5)


async def run_webhook_mode() -> None:
    if not BASE_URL:
        raise RuntimeError("BASE_URL is required for webhook mode")
    if not BASE_URL.startswith("https://"):
        raise RuntimeError("BASE_URL must use https in webhook mode")

    logger.info("Bot is starting in webhook mode")
    await bot.set_webhook(
        f"{BASE_URL}/webhook",
        secret_token=WEBHOOK_SECRET,
        allowed_updates=ALLOWED_UPDATES,
    )

    try:
        await asyncio.Event().wait()
    finally:
        await bot.delete_webhook()


async def main():
    if not BOT_TOKEN:
        raise RuntimeError("BOT_TOKEN is required")
    if not BASE_URL:
        raise RuntimeError("BASE_URL is required")

    asyncio.create_task(check_and_update_avatars())
    if USE_WEBHOOK:
        await run_webhook_mode()
        return

    await run_polling_bridge()


if __name__ == "__main__":
    asyncio.run(main())
