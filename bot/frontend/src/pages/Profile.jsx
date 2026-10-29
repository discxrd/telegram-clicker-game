import { useSelector } from "react-redux";
import { BiMoneyWithdraw } from "react-icons/bi";
import WithdrawModal from "../components/WithdrawModal";
import { useState } from "react";
import WebApp from "@twa-dev/sdk";
import { copy } from "../config/branding";

const profileCopy = copy.profile;

const Profile = ({ isFullScreen }) => {
	const [showWithdraw, setShowWithdraw] = useState(false);

	const user = useSelector((state) => state.user.data);

	const handleOpenWithdraw = () => {
		WebApp.HapticFeedback.impactOccurred("medium");
		setShowWithdraw(true);
	};

	return (
		<section className="flex-1 flex flex-col items-center px-4">
			<h1 className="text-[26px] text-center flex flex-col gap-2 items-center mb-3">
				<span>{profileCopy.balanceTitle}</span>
				<span className="text-[16px]">
					<p>{user?.info?.balance} EUR</p>
				</span>
			</h1>

			<div
				className="theme-panel flex items-center gap-5 w-full backdrop-blur-md rounded-xl p-3 transition-transform active:scale-[0.95]"
				onClick={handleOpenWithdraw}
			>
				<span className="theme-chip p-3 text-4xl rounded-full relative theme-icon">
					<BiMoneyWithdraw />
				</span>

				<div className="flex items-center justify-between w-full text-[12px]">
					<div className="flex flex-col items-start gap-2">
						<p className="text-[14px]">{profileCopy.withdrawCardTitle}</p>
						<p className="flex gap-1 items-center text-[10px]">
							<span>{profileCopy.withdrawCardText}</span>
						</p>
					</div>
				</div>
			</div>

			<WithdrawModal
				showWithdraw={showWithdraw}
				setShowWithdraw={setShowWithdraw}
				isFullScreen={isFullScreen}
			/>
		</section>
	);
};
export default Profile;
