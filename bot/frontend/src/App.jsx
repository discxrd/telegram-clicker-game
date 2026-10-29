import { Route, Routes } from "react-router-dom";
import Preview from "./pages/Preview";
import WebApp from "@twa-dev/sdk";
import { useDispatch } from "react-redux";
import { fetchUserInfo } from "./app/userSlice";
import { useEffect, useState } from "react";
import ParticlesBg from "./components/ParticleBg";
import { toast, Toaster } from "sonner";
import Tap from "./pages/Tap";
import Profile from "./pages/Profile";
import Referal from "./pages/Referal";
import Boost from "./pages/Boost";
import Navigation from "./components/Navigation";
import Header from "./components/Header";
import { branding, copy } from "./config/branding";

function App() {
	const [isFullScreen, setIsFullScreen] = useState(WebApp.isFullscreen);
	const dispatch = useDispatch();

	useEffect(() => {
		document.documentElement.lang = branding.lang;
		document.title = branding.title;
	}, []);

	useEffect(() => {
		let intervalId;

		if (typeof WebApp !== "undefined" && WebApp.initDataUnsafe) {
			WebApp.ready();
			WebApp.expand();
			if (WebApp.isVersionAtLeast?.("8.0")) {
				WebApp.requestFullscreen();
			}
			WebApp.enableClosingConfirmation();

			const { user } = WebApp.initDataUnsafe;
			if (user && user?.id) {
				dispatch(fetchUserInfo(user?.id));
				toast.promise();
				intervalId = setInterval(() => {
					dispatch(fetchUserInfo(user?.id));
				}, 15000);
			}
		} else {
			console.log(copy.app.webAppUnavailable);
		}

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [dispatch]);

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullScreen(WebApp.isFullscreen);
		};

		window.Telegram.WebApp.onEvent("fullscreenChanged", handleFullscreenChange);

		return () => {
			window.Telegram.WebApp.offEvent(
				"fullscreenChanged",
				handleFullscreenChange,
			);
		};
	}, []);

	return (
		<>
			<ParticlesBg id="particles" />
			<Toaster position={isFullScreen ? "bottom-center" : "top-center"} />
			<Header isFullScreen={isFullScreen} />
			<Routes>
				<Route path="/" element={<Preview isFullScreen={isFullScreen} />} />
				<Route path="/me" element={<Profile isFullScreen={isFullScreen} />} />
				<Route path="/referal" element={<Referal />} />
				<Route path="/tap" element={<Tap />} />
				<Route path="/boost" element={<Boost />} />
			</Routes>
			<Navigation />
		</>
	);
}

export default App;
