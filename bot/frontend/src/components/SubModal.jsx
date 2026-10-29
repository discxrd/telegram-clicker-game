import { useDispatch, useSelector } from "react-redux";
import { SlEnergy } from "react-icons/sl";
import { IoIosArrowForward } from "react-icons/io";
import WebApp from "@twa-dev/sdk";
import { IoClose } from "react-icons/io5";
import { clientAxios } from "../utils/axiosInstance";
import { updateUserField } from "../app/userSlice";
import { toast } from "sonner";
import { branding, copy } from "../config/branding";

const subscriptionCopy = copy.subscription;

const SubModal = ({ show, setShowSub }) => {
	const user = useSelector((state) => state.user.data);
	const dispatch = useDispatch();
	const currentMaxEnergy = user?.info.energy_max || 0;
	const boostedMaxEnergy = currentMaxEnergy + branding.subscriptionBonusEnergy;

	const handleSubcribe = () => {
		WebApp.HapticFeedback.impactOccurred("light");
		window.location.href = branding.subscriptionUrl;
	};

	const handleCheckSubScribe = async () => {
		WebApp.HapticFeedback.impactOccurred("medium");

		try {
			const response = await clientAxios.post("/check_subscription", {
				telegram_id: user?.info.user_id,
			});
			const data = response.data;

			if (data.subscribed !== true) {
				WebApp.HapticFeedback.impactOccurred("medium");
				return toast.error(subscriptionCopy.missing);
			}

			dispatch((dispatch, getState) => {
				const state = getState();

				const currentMaxEnergy = state.user.data?.info.energy_max || 0;
				const currentModifies = state.user.data?.info.modifies || {};

				const updatedMaxEnergy =
					currentMaxEnergy + branding.subscriptionBonusEnergy;
				const updatedModifies = {
					...currentModifies,
					subscribe_bonus: true,
				};

				dispatch(
					updateUserField({ field: "energy_max", value: updatedMaxEnergy }),
				);
				dispatch(
					updateUserField({ field: "modifies", value: updatedModifies }),
				);
			});

			WebApp.HapticFeedback.impactOccurred("medium");
			toast.success(subscriptionCopy.success);
			setShowSub(false);
		} catch {
			toast.error(subscriptionCopy.error);
		}
	};

	const handleCloseSub = () => {
		WebApp.HapticFeedback.impactOccurred("light");
		setShowSub(false);
	};

	return (
		<div
			className={`fixed h-screen w-screen top-0 left-0 w-full flex items-center justify-center z-20 transition-all ease backdrop-blur-sm px-5 ${show ? "pointer-events-auto opacity-1" : "pointer-events-none opacity-0"}`}
		>
			{user?.info.modifies.subscribe_bonus ? (
				<div
					className={`theme-panel w-full p-5 flex flex-col gap-5 justify-center items-center relative pt-8 rounded-xl backdrop-blur-md`}
				>
					<IoClose
						className="absolute right-3 top-3 text-3xl theme-accent-soft"
						onClick={handleCloseSub}
					/>
					<img
						src={branding.avatarUrl}
						alt=""
						className="max-w-[100px] rounded-md"
					/>
					<h1 className="flex items-center text-center text-[20px] justify-between">
						{subscriptionCopy.completedTitle}
					</h1>
					<p className="text-[16px] text-center">
						{subscriptionCopy.completedText}
					</p>
					<div className="flex items-center w-full gap-2">
						<button
							className="theme-button-primary w-full rounded-md py-4 px-5 text-center transition-transform active:scale-[0.95]"
							onClick={handleSubcribe}
						>
							{subscriptionCopy.subscribeCta}
						</button>
					</div>
				</div>
			) : (
				<div
					className={`theme-panel w-full p-5 flex flex-col gap-5 justify-center items-center relative pt-8 rounded-xl backdrop-blur-md`}
				>
					<IoClose
						className="absolute right-3 top-3 text-3xl theme-accent-soft"
						onClick={handleCloseSub}
					/>
					<img
						src={branding.avatarUrl}
						alt=""
						className="max-w-[100px] rounded-md"
					/>
					<h1 className="flex items-center text-center text-[20px] justify-between">
						{branding.subscriptionTitle}
					</h1>
					<p className="text-[16px] text-center">{subscriptionCopy.text}</p>
					<div className="flex gap-5 items-center justify-center">
						<div className="flex gap-2 border border-[color:var(--accent-border)] py-2 px-4 items-center rounded-md">
							<SlEnergy className="text-xl theme-icon" />
							{currentMaxEnergy}
						</div>
						<IoIosArrowForward className="text-3xl theme-accent-soft" />
						<div className="flex gap-2 border border-[color:var(--accent-border)] py-2 px-4 items-center rounded-md">
							<SlEnergy className="text-xl theme-icon" />
							{boostedMaxEnergy}
						</div>
					</div>
					<div className="flex items-center w-full gap-2 flex-col">
						<button
							className="theme-button-primary w-full rounded-md py-4 px-5 text-center transition-transform active:scale-[0.95]"
							onClick={handleSubcribe}
						>
							{subscriptionCopy.subscribeCta}
						</button>
						<button
							className="theme-button-secondary w-full rounded-md py-4 px-5 text-center transition-transform active:scale-[0.95]"
							onClick={handleCheckSubScribe}
						>
							{subscriptionCopy.confirmCta}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
export default SubModal;
