import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import WebApp from "@twa-dev/sdk";
import { branding, copy } from "../config/branding";

const previewCopy = copy.preview;

const previewTextShadow = {
	textShadow: "0 2px 8px rgba(0, 0, 0, 0.72), 0 0 18px rgba(2, 8, 22, 0.48)",
};

const previewTextLayouts = {
	0: {
		frame:
			"items-start pt-[calc(env(safe-area-inset-top)+clamp(4.75rem,13svh,8.5rem))] md:pt-[clamp(5rem,10svh,7.5rem)]",
		title:
			"mb-4 text-[clamp(2.25rem,10vw,3.75rem)] md:text-[clamp(3rem,5vw,4.5rem)]",
		body: "text-[clamp(0.9rem,3.8vw,1.25rem)] md:text-[clamp(1.15rem,2vw,1.75rem)]",
	},
	1: {
		frame:
			"items-start pt-[calc(env(safe-area-inset-top)+clamp(7.25rem,19svh,14rem))] md:pt-[clamp(7rem,18svh,12rem)]",
		box: "[@media(orientation:portrait)]:-translate-y-[90%]",
		body: "flex flex-col gap-1 text-[clamp(0.95rem,4vw,1.35rem)] leading-[1.55] md:text-[clamp(1.2rem,2.2vw,1.9rem)]",
	},
	2: {
		frame:
			"items-start pt-[calc(env(safe-area-inset-top)+clamp(3.5rem,9svh,7rem))] md:pt-[clamp(4rem,8svh,6.5rem)]",
		title:
			"mb-4 text-[clamp(2.1rem,9vw,3.5rem)] md:text-[clamp(2.75rem,4.5vw,4.25rem)]",
		body: "text-[clamp(0.9rem,3.7vw,1.25rem)] leading-[1.55] md:text-[clamp(1.15rem,2vw,1.7rem)]",
	},
};

const renderCopyLines = (text) =>
	text.split("\n").map((line) => <span key={line}>{line}</span>);

const SlideText = ({ layout, children }) => (
	<div
		className={`absolute inset-x-0 top-0 bottom-[calc(env(safe-area-inset-bottom)+clamp(6.75rem,14svh,9.5rem))] z-10 flex justify-center px-5 text-center pr__wrapper ${layout.frame}`}
	>
		<div
			className={`w-full max-w-[min(90vw,720px)] ${layout.box || ""}`}
			style={previewTextShadow}
		>
			{children}
		</div>
	</div>
);

const Preview = () => {
	const swiperRef = useRef(null);
	const navigate = useNavigate();
	const [isLastSlide, setIsLastSlide] = useState(false);

	const handleNext = () => {
		WebApp.HapticFeedback.impactOccurred("medium");
		const swiper = swiperRef.current.swiper;
		if (swiper.isEnd) {
			navigate("/tap");
		} else {
			swiper.slideNext();
		}
	};

	const handleSlideChange = (swiper) => {
		setIsLastSlide(swiper.isEnd);
	};
	return (
		<section className="w-screen h-screen relative overflow-hidden">
			<Swiper
				ref={swiperRef}
				spaceBetween={0}
				slidesPerView={1}
				modules={[Pagination]}
				allowTouchMove={false}
				touchStartPreventDefault={true}
				className="w-full h-full"
				onSlideChange={handleSlideChange}
			>
				{branding.previewImages.map((img, index) => {
					const layout = previewTextLayouts[index];

					return (
						<SwiperSlide
							key={index}
							className="relative flex items-center justify-center h-screen overflow-hidden"
						>
							{index === 0 ? (
								<SlideText layout={layout}>
									<h1
										className={`relative text-[var(--text-main)] glow-text tracking-wide ${layout.title}`}
									>
										{previewCopy.welcomeTitle}
									</h1>
									<p className={layout.body}>{previewCopy.welcomeText}</p>
								</SlideText>
							) : index === 1 ? (
								<SlideText layout={layout}>
									<p className={layout.body}>
										{renderCopyLines(previewCopy.earnText)}
									</p>
								</SlideText>
							) : index === 2 ? (
								<SlideText layout={layout}>
									<h1
										className={`relative text-[var(--text-main)] glow-text tracking-wide glow__green ${layout.title}`}
									>
										{previewCopy.withdrawTitle}
									</h1>
									<p className={layout.body}>{previewCopy.withdrawText}</p>
								</SlideText>
							) : null}
							<img
								src={img}
								alt={`${previewCopy.imageAlt} ${index + 1}`}
								className="absolute inset-0 z-0 w-full h-full object-cover"
							/>
						</SwiperSlide>
					);
				})}
			</Swiper>

			<button
				onClick={handleNext}
				className="theme-button-primary absolute bottom-[calc(env(safe-area-inset-bottom)+clamp(1.5rem,5svh,2.5rem))] left-1/2 transform -translate-x-1/2 z-10 p-5 rounded-lg w-[95%] mx-auto shadow-[0_18px_35px_rgba(0,0,0,0.35)]"
			>
				{isLastSlide ? previewCopy.start : previewCopy.continue}
			</button>
		</section>
	);
};

export default Preview;
