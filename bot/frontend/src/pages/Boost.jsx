import { SiTapas } from "react-icons/si";
import { PiHandTapLight } from "react-icons/pi";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowForward } from "react-icons/io";
import { toast } from "sonner";
import { clientAxios } from "../utils/axiosInstance";
import WebApp from "@twa-dev/sdk";
import { SlEnergy } from "react-icons/sl";
import { fetchUserInfo } from "../app/userSlice";
import { useState } from "react";
import SubModal from "../components/SubModal";
import { copy } from "../config/branding";

const boostCopy = copy.boost;

const Boost = () => {
	const [showSub, setShowSub] = useState(false);
	const user = useSelector((state) => state.user.data);
	const dispatch = useDispatch();

	const handleUpgradeClick = async () => {
		WebApp.HapticFeedback.impactOccurred("medium");
		try {
			const response = await clientAxios.post("/buy_toques", {
				telegram_id: user?.info?.user_id,
			});
			if (response.data.error) return toast.error(boostCopy.insufficientFunds);
			toast.success(boostCopy.upgraded);
			dispatch(fetchUserInfo(user?.info?.user_id));
			console.log(response.data);
		} catch {
			toast.error(boostCopy.upgradeError);
		}
	};

	const handleShowSub = () => {
		WebApp.HapticFeedback.impactOccurred("medium");
		setShowSub(true);
	};

	function calculate_price(level) {
		const basePrice = 1000;
		const multiplier = 2.5;

		return basePrice * Math.pow(multiplier, level - 1);
	}

	return (
		<section className="flex-1 flex flex-col items-center select-none px-4">
			<div className="mb-4 flex flex-col items-center justify-center">
				<SiTapas className="text-[48px] theme-accent-soft" />
				<h1>{boostCopy.title}</h1>
			</div>
			<ul className="w-full flex flex-col gap-8">
				<li
					className="theme-panel flex items-center gap-5 w-full backdrop-blur-md rounded-xl p-3 transition-transform active:scale-[0.95]"
					onClick={handleShowSub}
				>
					<span className="theme-chip p-3 text-4xl rounded-full relative theme-icon">
						<SlEnergy />
					</span>

					<div className="flex items-center justify-between w-full text-[12px]">
						<div className="flex flex-col items-start gap-2">
							<p className="text-[14px]">{boostCopy.energyTitle}</p>
							<p className="flex gap-1 items-center text-[10px]">
								<span>{boostCopy.energyText}</span>
							</p>
						</div>

						<div>
							<IoIosArrowForward className="text-3xl" />
						</div>
					</div>
				</li>

				<div>
					<h1 className="text-center mb-2 text-[15px]">
						{boostCopy.tapsTitle}
					</h1>
					<li
						className="theme-panel flex items-center gap-5 w-full backdrop-blur-md rounded-xl p-3 transition-transform active:scale-[0.95]"
						onClick={handleUpgradeClick}
					>
						<span className="theme-chip p-3 text-xl rounded-full relative">
							<PiHandTapLight />
							<div className="absolute top-0 left-0 rounded-full bg-[var(--accent)] text-[var(--text-main)] p-2 w-[20px] h-[20px] z-10 text-[9px] flex items-center justify-center">
								{user?.info?.modifies?.toques_lvl}
							</div>
						</span>

						<div className="flex items-center justify-between w-full text-[12px]">
							<div className="flex flex-col items-start gap-2">
								<p className="text-[10px]">{boostCopy.tapsItem}</p>
								<p className="flex gap-1 items-center text-[8px]">
									<span>
										{calculate_price(user?.info?.modifies.toques_lvl)}
									</span>
									<span className="text-gray-400">
										• {boostCopy.nextLevel}{" "}
										{user?.info?.modifies?.toques_lvl + 1}
									</span>
								</p>
							</div>

							<div>
								<IoIosArrowForward className="text-3xl theme-accent-soft" />
							</div>
						</div>
					</li>
				</div>
			</ul>

			<SubModal show={showSub} setShowSub={setShowSub} />
		</section>
	);
};
export default Boost;
