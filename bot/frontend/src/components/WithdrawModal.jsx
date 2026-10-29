import { useSelector } from "react-redux";
import WebApp from "@twa-dev/sdk";
import { IoClose } from "react-icons/io5";
import { useState } from "react";
import { toast } from "sonner";
import { copy } from "../config/branding";

const withdrawCopy = copy.withdraw;

const WithdrawModal = ({ showWithdraw, setShowWithdraw, isFullScreen }) => {
	const [amount, setAmount] = useState();

	const user = useSelector((state) => state.user.data);
	const handleCloseSub = () => {
		WebApp.HapticFeedback.impactOccurred("light");
		setShowWithdraw(false);
	};

	const handleChangeAmount = (e) => {
		let value = e.target.value;

		const numericValue = value.replace(/[^0-9.]/g, "");

		const formattedValue =
			numericValue.split(".").length > 2
				? numericValue.slice(0, numericValue.lastIndexOf("."))
				: numericValue;

		setAmount(formattedValue);
	};

	const handleWithdraw = () => {
		if (!amount) return toast.warning(withdrawCopy.missingAmount);
		if (parseFloat(amount) < 500)
			return toast.warning(withdrawCopy.minimumAmount);
		if (parseFloat(amount) > user?.info?.balance)
			return toast.warning(withdrawCopy.insufficientFunds);
		return toast.warning(withdrawCopy.unavailable);
	};

	return (
		<div
			className={`fixed h-screen w-screen top-0 left-0 w-full flex items-start justify-center z-20 transition-all ease backdrop-blur-sm ${showWithdraw ? "pointer-events-auto opacity-1" : "pointer-events-none opacity-0"}`}
		>
			<div
				className={`theme-panel w-full p-5 flex flex-col gap-5 justify-center items-center relative ${isFullScreen ? "pt-28" : "pt-8"} rounded-b-xl backdrop-blur-md transform transition-transform duration-[.45s] ease ${showWithdraw ? "translate-y-[0]" : "-translate-y-[100%]"}`}
			>
				<IoClose
					className={`absolute right-3 text-3xl theme-accent-soft ${isFullScreen ? "top-24" : "top-3"}`}
					onClick={handleCloseSub}
				/>
				<h1 className="flex items-center text-center text-[20px] justify-between">
					{withdrawCopy.title}
				</h1>
				<input
					type="text"
					className="w-full rounded-md transition-colors border outline-none p-4 bg-transparent text-[14px] placeholder:text-[14px] border-[color:var(--accent-border)] focus:border-[color:var(--accent-soft)]"
					value={amount}
					onChange={handleChangeAmount}
					placeholder={withdrawCopy.placeholder}
				/>

				<button
					className="theme-button-primary w-full rounded-md py-4 px-5 text-center transition-transform active:scale-[0.95]"
					onClick={handleWithdraw}
				>
					{withdrawCopy.cta}
				</button>
			</div>
		</div>
	);
};
export default WithdrawModal;
