import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import WebApp from "@twa-dev/sdk";
import { clientAxios } from "../utils/axiosInstance";
import { toast } from "sonner";
import { updateUserField } from "../app/userSlice";
import { SlEnergy } from "react-icons/sl";
import SubModal from "../components/SubModal";
import { copy } from "../config/branding";

const baseClickReward = 0.25;
const tapCopy = copy.tap;

const Tap = () => {
	const user = useSelector((state) => state.user.data);
	const dispatch = useDispatch();

	const [showSub, setShowSub] = useState(false);

	const [multiplier, setMultiplier] = useState(1);
	const [size, setSize] = useState(50);
	const [isResetting, setIsResetting] = useState(false);
	const [clicks, setClicks] = useState([]);
	const [isTouchDevice, setIsTouchDevice] = useState(false);

	useEffect(() => {
		setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
	}, []);

	const handleTap = async (e) => {
		WebApp.HapticFeedback.impactOccurred("light");
		const rect = e.target.getBoundingClientRect();
		const increment = e.type.startsWith("touch") ? e.touches.length : 1;
		let clickX = 0,
			clickY = 0;

		try {
			await clientAxios.post("/clicker", {
				telegram_id: user?.info?.user_id,
				click_count: increment,
				x: multiplier,
			});
			dispatch((dispatch, getState) => {
				const state = getState();
				const currentEnergy = state.user.data?.info.energy || 0;
				const currentBalance = state.user.data?.info.balance || 0;
				const currentLvl = state.user.data?.info.modifies.toques_lvl || 1;

				if (increment <= currentEnergy) {
					const updatedEnergy = currentEnergy - increment;
					const updateBalance = parseFloat(
						(
							currentBalance +
							increment * currentLvl * baseClickReward * multiplier
						).toFixed(2),
					);
					if (e.type.startsWith("touch")) {
						const touch = e.touches[0];
						clickX = touch.clientX - rect.left;
						clickY = touch.clientY - rect.top;
					} else {
						clickX = e.clientX - rect.left;
						clickY = e.clientY - rect.top;
					}

					setClicks((prev) => [
						...prev,
						{
							id: Date.now(),
							x: clickX,
							y: clickY,
							value: `+${(multiplier * baseClickReward * currentLvl).toFixed(2)}`,
						},
					]);

					setSize((prev) => {
						return Math.min(prev + increment, 200);
					});

					dispatch(updateUserField({ field: "energy", value: updatedEnergy }));
					dispatch(updateUserField({ field: "balance", value: updateBalance }));
				} else {
					setShowSub(true);
				}
			});
		} catch (err) {
			toast.error(tapCopy.error);
			console.log(err);
		}

		e.preventDefault();
	};

	const handleOpenSub = () => {
		WebApp.HapticFeedback.impactOccurred("medium");
		setShowSub(true);
	};

	useEffect(() => {
		if (size >= 180) setMultiplier(4);
		else if (size >= 150) setMultiplier(3);
		else if (size >= 100) setMultiplier(2);
		else setMultiplier(1);

		let interval;
		if (size > 50 && size < 200) {
			interval = setInterval(() => {
				setSize((prev) => Math.max(prev - 1, 50));
			}, 200);
		}

		if (size >= 200 && !isResetting) {
			setIsResetting(true);
			setTimeout(() => {
				setSize(50);
				setTimeout(() => setIsResetting(false), 300);
			}, 300);
		}

		return () => clearInterval(interval);
	}, [size, isResetting]);

	useEffect(() => {
		const timer = setInterval(() => {
			setClicks((prev) => prev.filter((click) => Date.now() - click.id < 1000));
		}, 100);
		return () => clearInterval(timer);
	}, []);

	return (
		<section className="flex-1 flex flex-col items-center select-none px-4">
			<div>
				<h1 className="text-[40px] text-center">{user?.info?.balance}</h1>
				<h2 className="level relative px-[12px] text-xs text-center mt-3 w-max mx-auto">
					{tapCopy.level} {user?.info?.modifies.toques_lvl}
				</h2>
			</div>

			<div
				className="w-[300px] aspect-square mx-auto relative tap__wrapper select-none"
				onTouchStart={isTouchDevice ? handleTap : null}
				onMouseDown={!isTouchDevice ? handleTap : null}
			>
				{[100, 150, 180, 200].map((size) => (
					<div
						key={size}
						className="absolute rounded-full aspect-square border border-[color:var(--accent-border)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
						style={{ width: `${size}px` }}
					></div>
				))}

				<div
					className="absolute rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flashing"
					style={{
						width: `${size}px`,
						height: `${size}px`,
						transition: isResetting ? "all 0.3s ease-in-out" : "all .1s ease",
					}}
				>
					<span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-[10px] flex items-center justify-center z-10 w-[50px] aspect-square">
						x{multiplier}
					</span>
				</div>

				{clicks.map((click) => (
					<span
						key={click.id}
						className="absolute font-bold text-[18px] opacity-100 animate-fly-up"
						style={{
							top: `${click.y}px`,
							left: `${click.x}px`,
						}}
					>
						{click.value}
					</span>
				))}
			</div>

			<div className="w-full text-[14px] mt-auto">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="theme-accent">
							<SlEnergy className="text-xl" />
						</span>
						<div>
							{user?.info.energy} /{" "}
							<span className="text-gray-400">{user?.info.energy_max}</span>
						</div>
					</div>
					<div className="theme-accent-soft" onClick={handleOpenSub}>
						{tapCopy.upgrades}
					</div>
				</div>
				<div className="h-[10px] mt-2 bg-[var(--surface)] rounded-full overflow-hidden border border-[color:var(--accent-border)]">
					<div
						className={`theme-progress h-full transition-all duration-300 ease-out`}
						style={{
							width: `${(user?.info.energy / user?.info.energy_max) * 100}%`,
						}}
					></div>
				</div>
			</div>

			<SubModal show={showSub} setShowSub={setShowSub} />
		</section>
	);
};

export default Tap;
