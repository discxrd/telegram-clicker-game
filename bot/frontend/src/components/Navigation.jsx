import { Link, useLocation } from "react-router-dom";
import { TbUserHexagon } from "react-icons/tb";
import { PiUsersThree } from "react-icons/pi";
import { GiMinerals } from "react-icons/gi";
import { GiUpgrade } from "react-icons/gi";
import WebApp from "@twa-dev/sdk";
import { copy } from "../config/branding";

const navigationCopy = copy.navigation;

const Navigation = () => {
	const location = useLocation();
	if (location.pathname === "/") return null;

	return (
		<nav className="w-full px-4 pb-5 mt-5">
			<ul className="theme-panel flex backdrop-blur-md w-full rounded-full select-none overflow-hidden text-[10px]">
				<Link
					className="flex flex-col items-center gap-1 py-3 px-2 flex-1 active:bg-[var(--accent-ghost)] transition-colors active:duration-[0s]"
					to="/me"
					onClick={() => WebApp.HapticFeedback.impactOccurred("light")}
				>
					<TbUserHexagon className="theme-icon text-2xl" />
					{navigationCopy.profile}
				</Link>
				<Link
					className="flex flex-col items-center gap-1 py-3 px-2 flex-1 active:bg-[var(--accent-ghost)] transition-colors active:duration-[0s]"
					to="/referal"
					onClick={() => WebApp.HapticFeedback.impactOccurred("light")}
				>
					<PiUsersThree className="theme-icon text-2xl" />
					{navigationCopy.friends}
				</Link>
				<Link
					className="flex flex-col items-center gap-1 py-3 px-2 flex-1 active:bg-[var(--accent-ghost)] transition-colors active:duration-[0s]"
					to="/tap"
					onClick={() => WebApp.HapticFeedback.impactOccurred("light")}
				>
					<GiMinerals className="theme-icon text-2xl" />
					{navigationCopy.earnings}
				</Link>
				<Link
					className="flex flex-col items-center gap-1 py-3 px-2 flex-1 active:bg-[var(--accent-ghost)] transition-colors active:duration-[0s]"
					to="/boost"
					onClick={() => WebApp.HapticFeedback.impactOccurred("light")}
				>
					<GiUpgrade className="theme-icon text-2xl" />
					{navigationCopy.upgrades}
				</Link>
			</ul>
		</nav>
	);
};

export default Navigation;
