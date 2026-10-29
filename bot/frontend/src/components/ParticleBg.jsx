import Particles, { initParticlesEngine } from "@tsparticles/react";
import { useEffect, useMemo, useState } from "react";

import { loadSlim } from "@tsparticles/slim";
const ParticlesBg = (props) => {
	const [init, setInit] = useState(false);
	useEffect(() => {
		initParticlesEngine(async (engine) => {
			await loadSlim(engine);
		}).then(() => {
			setInit(true);
		});
	}, []);

	const particlesLoaded = (container) => {
		console.log(container);
	};

	const options = useMemo(
		() => ({
			background: {
				color: {
					value: "#050505",
				},
				image:
					"radial-gradient(circle, rgba(142, 139, 117, 0.4), rgba(5, 5, 5, 0.92))",
			},
			fpsLimit: 190,
			interactivity: {
				modes: {
					push: {
						distance: 200,
						duration: 15,
					},
					grab: {
						distance: 150,
					},
				},
			},
			particles: {
				color: {
					value: "#8e8b75",
				},
				move: {
					direction: "none",
					enable: true,
					outModes: {
						default: "bounce",
					},
					random: true,
					speed: 5,
					straight: false,
				},
				number: {
					density: {
						enable: true,
					},
					value: 180,
				},
				opacity: {
					value: 0.5,
				},
				shape: {
					type: "circle",
				},
				size: {
					value: { min: 1.5, max: 3 },
				},
			},
			detectRetina: true,
		}),
		[],
	);

	if (!init) return null;

	return <Particles id={props.id} init={particlesLoaded} options={options} />;
};

export default ParticlesBg;
