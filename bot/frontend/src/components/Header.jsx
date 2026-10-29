import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { SiOpslevel } from "react-icons/si";
import { BiMoney } from "react-icons/bi";
import { copy } from "../config/branding";

const headerCopy = copy.header;

const Header = ({ isFullScreen }) => {
	const user = useSelector((state) => state.user.data);

	const location = useLocation();
	if (location.pathname === "/") return null;

	return (
		<nav className={`w-full px-4 pb-5 ${isFullScreen ? "pt-24" : "pt-8"}`}>
			<ul className="theme-panel flex backdrop-blur-md w-full rounded-xl select-none overflow-hidden text-[10px] px-4 py-3 justify-between items-center">
				<Link
					className="border p-1 rounded-full transition-transform active:scale-[0.95] border-[color:var(--accent-border)]"
					to="/referal"
					onClick={() => WebApp.HapticFeedback.impactOccurred("light")}
				>
					<img
						src={user?.info.avatar_url}
						alt={headerCopy.avatarAlt}
						className="max-w-[40px] rounded-full"
					/>
				</Link>

				<div className="flex flex-col gap-2 items-end text-[10px]">
					<div className="flex items-center gap-2">
						<SiOpslevel className="text-lg theme-accent-soft" />
						<span>
							{user?.info.modifies.toques_lvl} {headerCopy.levelSuffix}
						</span>
					</div>
					<div className="flex items-center gap-2">
						<BiMoney className="text-lg theme-accent-soft" />
						<span>{user?.info?.balance} EUR</span>
					</div>
				</div>
			</ul>
		</nav>
	);
};

export default Header;
