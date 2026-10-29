import { useSelector } from "react-redux";
import { GiWantedReward } from "react-icons/gi";
import { TbMilitaryAward } from "react-icons/tb";
import WebApp from "@twa-dev/sdk";
import { IoCopyOutline } from "react-icons/io5";
import { toast } from "sonner";
import { branding, copy } from "../config/branding";

const referralCopy = copy.referral;

const Referal = () => {
	const user = useSelector((state) => state.user.data);
	const totalReferralBonus =
		(user?.info?.referrals || 0) * referralCopy.bonusAmount;

	const handleLinkCopy = () => {
		WebApp.HapticFeedback.impactOccurred("medium");
		toast.success(referralCopy.copied);
		window.navigator.clipboard.writeText(
			`${branding.referralBotUrl}?start=${user?.info?.referral_code}`,
		);
	};
	const handleInvite = () => {
		WebApp.HapticFeedback.impactOccurred("medium");
		const message = `${branding.referralBotUrl}?start=${user?.info?.referral_code}\n${referralCopy.shareText}`;
		WebApp.openTelegramLink(
			`https://t.me/share/url?url=${encodeURIComponent(message)}`,
		);
	};

	return (
		<section className="flex-1 flex flex-col items-center px-4">
			<div className="flex flex-col item-center gap-4 w-full justify-center mb-12">
				<div className="perspective-container pt-[30px] flex justify-center">
					<GiWantedReward className="text-[80px] theme-accent levitating color-shifting" />
				</div>
				<div className="flex flex-col justify-center gap-2">
					<h2 className="text-[20px] text-center">{referralCopy.friends}</h2>
					<p className="theme-panel-solid w-full py-4 text-center award rounded-md">
						+{totalReferralBonus} EUR
					</p>
				</div>
			</div>

			<div className="w-full flex flex-col gap-4">
				<h2 className="text-[17px] text-start flex items-center w-full justify-between">
					<span className="theme-accent-soft">{referralCopy.inviteTitle}</span>
					<TbMilitaryAward className="text-[35px] theme-accent-soft" />
				</h2>
				<div className="theme-panel-solid w-full py-4 text-center award__reverse text-[12px] rounded-md">
					<div>{referralCopy.bonusText}</div>
				</div>
				<div className="flex gap-5 w-full text-[12px]">
					<button
						className="theme-button-secondary flex-1 py-4 px-3 rounded-md"
						onClick={handleInvite}
					>
						{referralCopy.inviteButton}
					</button>
					<button
						className="theme-button-secondary py-4 px-3 rounded-md active:scale-[0.95] transition-transform"
						onClick={handleLinkCopy}
					>
						<IoCopyOutline className="text-[20px]" />
					</button>
				</div>
			</div>
		</section>
	);
};
export default Referal;
