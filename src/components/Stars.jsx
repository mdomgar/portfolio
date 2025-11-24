import React, { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const Stars = () => {
    const particlesInit = useCallback(async (engine) => {
        await loadSlim(engine);
    }, []);

    const particlesLoaded = useCallback(async (container) => {
    }, []);

    const starConfig = {
        background: {
            color: {
                value: "#0f0f0f",
            },
        },
        fpsLimit: 60,
        interactivity: {
            events: {
                onClick: {
                    enable: false,
                    mode: "push",
                },
                onHover: {
                    enable: false,
                    mode: "repulse",
                },
                resize: true,
            },
        },
        particles: {
            number: {
                value: 150,
                density: {
                    enable: true,
                    value_area: 800,
                },
            },
            color: {
                value: "#ffffff",
            },
            shape: {
                type: "circle",
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false,
                },
            },
            size: {
                value: 1,
                random: true,
            },
            links: {
                enable: false,
            },
            move: {
                enable: true,
                speed: 0.1,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
            },
        },
        detectRetina: true,
    };

    return (
        <Particles
            id="tsparticles"
            init={particlesInit}
            loaded={particlesLoaded}
            options={starConfig}
            style={{
                position: "fixed", 
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: -1,
                pointerEvents: "none",
            }}
        />
    );
};

export default Stars;