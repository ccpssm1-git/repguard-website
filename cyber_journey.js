// ================================================================
// RepGuard – Full Parallax Experience
// GSAP + ScrollTrigger + Lenis | Desktop & Mobile Responsive
// ================================================================
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {

    // ── Device Detection ─────────────────────────────────────────
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Smooth Scroll (Lenis) – Desktop only ──────────────────────
    let lenis;
    if (!isMobile && !prefersReduced) {
        lenis = new Lenis({
            duration: 1.8,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 0.8,
            smoothTouch: true,
            infinite: false,
        });

        lenis.on("scroll", ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }

    // ── matchMedia Switcher ───────────────────────────────────────
    const mm = gsap.matchMedia();

    // ================================================================
    //  SHARED: Navbar hide/show on scroll
    // ================================================================
    const navbar = document.querySelector(".navbar");
    let lastScrollY = window.scrollY;
    window.addEventListener("scroll", () => {
        const current = window.scrollY;
        if (current > lastScrollY && current > 80) {
            navbar?.classList.add("nav-hidden");
        } else {
            navbar?.classList.remove("nav-hidden");
        }
        lastScrollY = current;
    }, { passive: true });

    // ================================================================
    //  SHARED: Word-reveal entrance (runs on all devices)
    // ================================================================
    if (!prefersReduced) {
        gsap.from(".word-reveal", {
            y: 100,
            opacity: 0,
            rotateX: -80,
            scale: 0.5,
            z: -200,
            stagger: 0.15,
            duration: 2.2,
            ease: "elastic.out(1, 0.7)",
            delay: 0.2,
        });
    }

    // ================================================================
    //  DESKTOP ANIMATIONS (≥ 769px)
    // ================================================================
    mm.add("(min-width: 769px)", () => {

        // ── SCENE 1: Hero – pinned multi-layer parallax ──────────
        const introTl = gsap.timeline({
            scrollTrigger: {
                trigger: "#scene-intro",
                start: "top top",
                end: "+=1400",
                pin: true,
                scrub: 1,
                anticipatePin: 1
            }
        });



        // Scroll-driven: extreme warp backward simulating entering the screen
        introTl
            .fromTo(".back-layer", 
                { z: 0, scale: 1.15, x: 0, y: 0, opacity: 0.85, filter: "blur(0px) brightness(0.5)" },
                { z: -600, scale: 1.6, x: -60, y: -30, opacity: 0.05, filter: "blur(6px) brightness(0.3)" }, 0)
            .fromTo(".marquee-track", 
                { xPercent: 0, z: 0, rotateX: 0 },
                { xPercent: -150, z: -500, rotateX: 20, ease: "none" }, 0)
            .fromTo(".word-reveal", 
                { opacity: 1, scale: 1, z: 0, y: 0, rotateX: 0 },
                { opacity: 0, scale: 0.8, z: -300, stagger: 0.08, y: -250, rotateX: -20 }, 0);

        // ── Narrative Transition ─────────────────────────────────
        // Parallax on the narrative background video
        gsap.to(".narrative-bg-video", {
            y: -80, scale: 1.1,
            scrollTrigger: {
                trigger: ".narrative-transition--short",
                start: "top bottom", end: "bottom top",
                scrub: 1.5,
            }
        });

        // Entrance: comes from the left initially and pins
        const narrativeTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".narrative-transition--short",
                start: "center center",
                end: "+=800", // Tighter scroll distance to eliminate "blank" space after
                pin: true,
                scrub: 1,
                anticipatePin: 1
            }
        });

        narrativeTl.fromTo(".narrative-accent-line",
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1, duration: 0.5 }
        )
        .fromTo(".scroll-narrative-text",
            { x: -200, opacity: 0 },
            { x: 0, opacity: 1, duration: 1 }, 0.2
        )
        .fromTo(".narrative-sub",
            { x: -200, opacity: 0 },
            { x: 0, opacity: 1, duration: 1 }, 0.4
        )
        .to({}, { duration: 1 }) // Short pause to let them read it
        .to(".narrative-text-block", {
            x: 200, opacity: 0, scale: 1.05, duration: 1
        });

        // ── SCENE 2: Threats (Native 3D Parallax Scroll) ──────────
        gsap.set(".floating-threats", { perspective: 2000, transformStyle: "preserve-3d" });

        gsap.fromTo("#scene-threats .headline-large",
            { y: 150, opacity: 0, rotateX: -20 },
            { 
                y: 0, opacity: 1, rotateX: 0, 
                scrollTrigger: {
                    trigger: "#scene-threats",
                    start: "top bottom", // Start immediately as it enters
                    end: "top 20%",
                    scrub: 1
                }
            }
        );

        // Cards fly in one by one natively as you scroll past them
        gsap.utils.toArray(".threat-card").forEach((card, i) => {
            // Enter animation
            gsap.fromTo(card,
                { z: -1600, y: 300, opacity: 0, rotateX: (i % 2 === 0) ? -45 : 45, rotateY: (i % 2 === 0) ? -35 : 35 },
                {
                    z: 0, y: 0, opacity: 1, rotateX: 0, rotateY: (i % 2 === 0) ? -2 : 2, 
                    scrollTrigger: {
                        trigger: card,
                        start: "top bottom", // Fire immediately when entering
                        end: "top 40%",      // Finish earlier for snappier entry
                        scrub: 1,
                    }
                }
            );

            // Exit/Parallax fade out
            gsap.to(card, {
                y: -150, z: 300, opacity: 0,
                scrollTrigger: {
                    trigger: card,
                    start: "top 25%", // Fire when the card natively hits top quarter
                    end: "bottom top", 
                    scrub: 1,
                }
            });
        });

        // Ambient background move
        gsap.to(".threat-bg", {
            y: -150, scale: 1.05,
            scrollTrigger: {
                trigger: "#scene-threats",
                start: "top bottom", end: "bottom top",
                scrub: true,
            }
        });

        // ── SCENE 2.5: Digital Risk Check ─────────────────────────
        const riskContainer = document.querySelector('.risk-check-container');
        if (riskContainer) {
            const riskTl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#scene-risk-check",
                    start: "top bottom", // Start animating immediately
                    end: "center center", // Finish animation as it centers
                    scrub: 1          
                }
            });

            // Container floats up and fades in
            riskTl.to(riskContainer, {
                y: 0, 
                opacity: 1, 
                duration: 1,
                ease: "power2.out"
            });

            // Features stagger in slightly after the container
            riskTl.fromTo(".risk-features span", 
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
                "-=0.5"
            );

            // 3D Interactive Mouse Tilt
            riskContainer.addEventListener("mousemove", (e) => {
                const rect = riskContainer.getBoundingClientRect();
                const x = e.clientX - rect.left; 
                const y = e.clientY - rect.top; 
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Calculate tilt based on mouse position relative to center
                const tiltX = ((y - centerY) / centerY) * -5; // Subtle 5 deg max tilt
                const tiltY = ((x - centerX) / centerX) * 5;

                gsap.to(riskContainer, {
                    rotateX: tiltX,
                    rotateY: tiltY,
                    ease: "power2.out",
                    duration: 0.5,
                    overwrite: "auto"
                });
            });

            // Reset tilt when mouse leaves
            riskContainer.addEventListener("mouseleave", () => {
                gsap.to(riskContainer, {
                    rotateX: 0,
                    rotateY: 0,
                    ease: "power2.out",
                    duration: 0.8,
                    overwrite: "auto"
                });
            });
        }

        // ── SCENE 3: Solution ────────────────────────────────────
        gsap.fromTo([".solution-left", ".solution-right-header"],
            { y: 80, opacity: 0 },
            {
                y: 0, opacity: 1, stagger: 0.15,
                scrollTrigger: {
                    trigger: "#scene-solution",
                    start: "top 75%", end: "top 35%", scrub: 1,
                }
            }
        );

        const featureList = document.querySelector(".feature-list-horizontal");
        if (featureList) {
            gsap.to(featureList, {
                x: () => {
                    return -featureList.scrollWidth;
                },
                ease: "none",
                scrollTrigger: {
                    trigger: "#scene-solution",
                    start: "top top",
                    end: () => "+=" + (featureList.scrollWidth - window.innerWidth + 100), // Perfect 1:1 scroll ratio, no blank waiting time
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true,
                    anticipatePin: 1
                }
            });
        }

        const solutionBoxes = gsap.utils.toArray(".feature-box, .question-list li");
        
        solutionBoxes.forEach((box, i) => {
            // Creative 3D Mouse Tracking Aura & Tilt
            box.addEventListener("mousemove", (e) => {
                const rect = box.getBoundingClientRect();
                const x = e.clientX - rect.left; 
                const y = e.clientY - rect.top; 
                
                box.style.setProperty('--mouse-x', `${x}px`);
                box.style.setProperty('--mouse-y', `${y}px`);

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const tiltX = ((y - centerY) / centerY) * -10; 
                const tiltY = ((x - centerX) / centerX) * 10;

                gsap.to(box, {
                    rotateX: tiltX,
                    rotateY: tiltY,
                    translateZ: 30,
                    scale: 1.02,
                    duration: 0.3,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });

            box.addEventListener("mouseleave", () => {
                gsap.to(box, {
                    rotateX: 0,
                    rotateY: 0,
                    translateZ: 0,
                    scale: 1,
                    duration: 0.5,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            });
        });

        // ── SCENE 4: Timeline ────────────────────────────────────
        gsap.to(".timeline-line", {
            scaleY: 1,
            scrollTrigger: {
                trigger: ".timeline-container",
                start: "top center", end: "bottom center",
                scrub: true,
            }
        });

        gsap.utils.toArray(".timeline-item").forEach((item, i) => {
            gsap.fromTo(item,
                { x: -60, opacity: 0 },
                {
                    x: 0, opacity: 1,
                    duration: 0.8, ease: "power2.out",
                    scrollTrigger: {
                        trigger: item,
                        start: "top 85%",
                        end: "top 45%",
                        scrub: 1.5,
                    }
                }
            );
        });

        // Parallax floating icons
        gsap.to(".i1", { y: -220, x: -40, scrollTrigger: { trigger: "#scene-timeline", start: "top bottom", end: "bottom top", scrub: 1 } });
        gsap.to(".i2", { y: -360, x: 80, scrollTrigger: { trigger: "#scene-timeline", start: "top bottom", end: "bottom top", scrub: 2 } });
        gsap.to(".i3", { y: -180, x: -20, scrollTrigger: { trigger: "#scene-timeline", start: "top bottom", end: "bottom top", scrub: 1.5 } });

        // ── SOC Carousel reveal ───────────────────────────────────
        // SOC Carousel restored
        gsap.fromTo("#scene-soc-slider .headline-medium, #scene-soc-slider .soc-slider-desc",
            { y: 50, opacity: 0 },
            {
                y: 0, opacity: 1, stagger: 0.2,
                scrollTrigger: {
                    trigger: "#scene-soc-slider",
                    start: "top 80%", end: "top 50%", scrub: 1,
                }
            }
        );
        gsap.fromTo(".soc-carousel-container",
            { opacity: 0, scale: 0.9, rotateX: 20 },
            {
                opacity: 1, scale: 1, rotateX: 0, duration: 1,
                scrollTrigger: {
                    trigger: "#scene-soc-slider",
                    start: "top 60%", end: "center center", scrub: 1
                }
            }
        );

        // Simple Next/Prev logic
        const slides = document.querySelectorAll('.soc-slide');
        let currentSlide = 0;

        document.querySelector('.next-btn')?.addEventListener('click', () => {
            if(!slides.length) return;
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
        });

        document.querySelector('.prev-btn')?.addEventListener('click', () => {
            if(!slides.length) return;
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
        });

        // ── SCENE 4.6: Horizontal Scroll ─────────────────────────
        const horizontalContainer = document.querySelector(".horizontal-content");
        const horizontalSections = gsap.utils.toArray(".h-panel");

        if (horizontalContainer && horizontalSections.length) {
            const scrollWidth = horizontalContainer.scrollWidth - document.documentElement.clientWidth;

            const horizontalTl = gsap.timeline({
                scrollTrigger: {
                    trigger: "#scene-horizontal-actors",
                    start: "top top",
                    end: () => `+=${scrollWidth}`,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                }
            });

            const scrollTween = horizontalTl.to(".horizontal-content", {
                x: () => -(horizontalContainer.scrollWidth - document.documentElement.clientWidth),
                ease: "none",
            });

            // 3D orbit effect per card
            gsap.utils.toArray(".actor-card").forEach((card) => {
                gsap.to(card, {
                    scrollTrigger: {
                        trigger: card,
                        containerAnimation: scrollTween, // using the specific tween
                        start: "left center+=20%",
                        end: "right center-=20%",
                        scrub: true,
                        onUpdate(self) {
                            const p = self.progress;
                            gsap.set(card, {
                                rotateY: (p - 0.5) * -60, // Deeper rotation
                                scale: 1 - Math.abs(p - 0.5) * 0.25, // More dramatic scaling
                                z: Math.abs(p - 0.5) * -300, // Deeper Z push
                                opacity: 1 - Math.abs(p - 0.5), // Fade when passing center
                            });
                        }
                    }
                });
            });
        }

        // ── SCENE 5: Audience cards ───────────────────────────────
        gsap.utils.toArray(".a-card").forEach((card, i) => {
            const visual = card.querySelector(".a-card-visual");
            const text = card.querySelector(".a-card-text");
            const fromX = i % 2 === 0 ? -90 : 90;

            gsap.fromTo(card,
                { opacity: 0, x: fromX },
                {
                    opacity: 1, x: 0,
                    scrollTrigger: {
                        trigger: card,
                        start: "top 90%",
                        end: "top 50%",
                        scrub: 1.5
                    }
                }
            );

            if (visual) {
                gsap.fromTo(visual,
                    { rotateY: i % 2 === 0 ? 65 : -65, scale: 0.85 },
                    {
                        rotateY: 0, scale: 1,
                        scrollTrigger: {
                            trigger: card,
                            start: "top 90%",
                            end: "top 50%",
                            scrub: 1.5
                        }
                    }
                );
            }

            if (text) {
                gsap.fromTo(text,
                    { opacity: 0, x: i % 2 === 0 ? 30 : -30 },
                    {
                        opacity: 1, x: 0,
                        scrollTrigger: {
                            trigger: card,
                            start: "top 85%",
                            end: "top 45%",
                            scrub: 2
                        }
                    }
                );
            }
        });

        // Legacy Ring & Matrix removed

        // ── SCENE 6: Outro ───────────────────────────────────────
        gsap.set(".massive-text", { transformPerspective: 1000, transformStyle: "preserve-3d" });
        
        gsap.fromTo(".massive-text",
            { y: 100, opacity: 0 },
            {
                y: 0, opacity: 1,
                stagger: 0.15,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "#scene-outro",
                    start: "top 80%", end: "top 30%", scrub: 1,
                }
            }
        );
        
        gsap.fromTo(".btn-glow",
            { opacity: 0, y: 50 },
            {
                opacity: 1, y: 0,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: "#scene-outro",
                    start: "top 60%", end: "top 40%", scrub: 1,
                }
            }
        );

        // ── Client logos stagger ─────────────────────────────────
        gsap.from(".client-logo", {
            y: 80, opacity: 0, stagger: 0.1, 
            scale: 0.8, rotateX: 20,
            scrollTrigger: {
                trigger: "#scene-clients",
                start: "top 95%",
                end: "top 50%",
                scrub: 1.5,
            }
        });

        // ── Ambient Particle layer parallax ──────────────────────
        const particleContainer = document.createElement("div");
        particleContainer.className = "parallax-particles";
        document.body.appendChild(particleContainer);
        for (let i = 0; i < 30; i++) {
            const p = document.createElement("div");
            p.className = "parallax-particle";
            p.style.cssText = `left:${Math.random() * 100}vw;top:${Math.random() * 100}vh;width:${Math.random() * 3 + 1}px;height:${Math.random() * 3 + 1}px`;
            particleContainer.appendChild(p);
        }
        gsap.to(".parallax-particles", {
            y: -260, x: -100, ease: "none",
            scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 2 }
        });

    }); // end desktop mm

    // ================================================================
    //  MOBILE ANIMATIONS (≤ 768px) – lighter, CSS-transition safe
    // ================================================================
    mm.add("(max-width: 768px)", () => {

        // Simple fade + slide-up for every main section element
        const fadeEls = gsap.utils.toArray([
            ".headline-large", ".headline-medium", ".solution-headline",
            ".solution-left", ".solution-right",
            ".threat-card", ".timeline-item",
            ".a-card", ".soc-carousel-container",
            ".massive-text", ".scroll-narrative-text", ".matrix-headline",
            ".h-panel", ".outro-content",
        ]);

        if (!prefersReduced) {
            fadeEls.forEach((el, i) => {
                gsap.fromTo(el,
                    { y: 40, opacity: 0 },
                    {
                        y: 0, opacity: 1,
                        scrollTrigger: {
                            trigger: el,
                            start: "top 95%",
                            end: "top 60%",
                            scrub: 1.5,
                        }
                    }
                );
            });
        }

        // Timeline line on mobile
        gsap.to(".timeline-line", {
            scaleY: 1,
            scrollTrigger: {
                trigger: ".timeline-container",
                start: "top center", end: "bottom center",
                scrub: true,
            }
        });

        // Word reveal on mobile (simpler)
        gsap.from(".word-reveal", {
            y: 30, opacity: 0, stagger: 0.06, duration: 1, ease: "power2.out", delay: 0.2,
        });

    }); // end mobile mm

    // ================================================================
    //  SOC Carousel (shared – works on all)
    // ================================================================
    const slides = document.querySelectorAll(".soc-slide");
    const nextBtn = document.querySelector(".next-btn");
    const prevBtn = document.querySelector(".prev-btn");
    let currentSlide = 0;

    function updateCarousel() {
        slides.forEach((slide, idx) => {
            slide.classList.remove("active", "prev", "next");
            if (idx === currentSlide) slide.classList.add("active");
            else if (idx === (currentSlide - 1 + slides.length) % slides.length) slide.classList.add("prev");
            else if (idx === (currentSlide + 1) % slides.length) slide.classList.add("next");
        });
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener("click", () => { currentSlide = (currentSlide + 1) % slides.length; updateCarousel(); });
        prevBtn.addEventListener("click", () => { currentSlide = (currentSlide - 1 + slides.length) % slides.length; updateCarousel(); });
        setInterval(() => { currentSlide = (currentSlide + 1) % slides.length; updateCarousel(); }, 5000);
    }

    // ================================================================
    //  Mouse-reactive glow & continuous parallax
    // ================================================================
    if (!isMobile) {
        window.addEventListener("mousemove", (e) => {
            const xPct = (e.clientX / window.innerWidth - 0.5) * 2;
            const yPct = (e.clientY / window.innerHeight - 0.5) * 2;

            // Headline glow intensity
            gsap.to(".text-glow", {
                textShadow: `0 0 ${20 + Math.abs(xPct) * 40}px rgba(0,240,255,0.7), 0 0 ${30 + Math.abs(xPct) * 60}px rgba(0,240,255,0.4)`,
                duration: 0.45,
                overwrite: "auto",
            });

            // subtle spatial shift for everything
            gsap.to(".story-center-panel", {
                x: xPct * -30,
                y: yPct * -30,
                rotateY: xPct * 5,
                rotateX: yPct * -5,
                duration: 1,
                ease: "power2.out",
                overwrite: "auto"
            });

            gsap.to(".back-layer", {
                x: xPct * 55,
                y: yPct * 55,
                rotateY: xPct * 2,
                rotateX: yPct * -2,
                duration: 1.8,
                ease: "power2.out"
            });

            // subtle 3D tilt for threat cards
            gsap.to(".threat-card", {
                rotateY: xPct * 15,
                rotateX: yPct * -15,
                duration: 1.2,
                ease: "power2.out",
                overwrite: "auto"
            });
            // Brand logo 3D tilt
            gsap.to(".logo-area", {
                rotateY: xPct * 10,
                rotateX: yPct * -10,
                duration: 0.8,
                ease: "power2.out",
                overwrite: "auto"
            });
        }, { passive: true });
    }

    // --- 3D Hover & Magnetic Logic for Buttons ---
    const threeDButtons = document.querySelectorAll(".three-d-hover");
    threeDButtons.forEach(btn => {
        btn.addEventListener("mousemove", (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Magnetic effect: button center slightly follows mouse
            const moveX = (x - centerX) * 0.4;
            const moveY = (y - centerY) * 0.4;
            
            // Tilt relative to magnetic center
            const tiltX = (y - centerY) / 3;
            const tiltY = (centerX - x) / 3;
            
            gsap.to(btn, {
                x: moveX,
                y: moveY,
                rotateX: tiltX,
                rotateY: tiltY,
                scale: 1.05,
                translateZ: 30,
                duration: 0.1,
                ease: "power2.out",
                overwrite: "auto"
            });
            
            // Set CSS mouse variables for aura effect
            btn.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
            btn.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        });

        btn.addEventListener("mouseleave", () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                translateZ: 0,
                scale: 1,
                duration: 0.6,
                ease: "elastic.out(1, 0.4)",
                overwrite: "auto"
            });
        });
    });

    // --- Hero 3D Grid Background ---
    const gridContainer = document.createElement("div");
    gridContainer.className = "hero-3d-grid";
    document.querySelector("#scene-intro")?.prepend(gridContainer);
    
    // Ambient scroll parallax for grid
    gsap.to(".hero-3d-grid", {
        y: 200,
        rotateX: 60,
        opacity: 0,
        scrollTrigger: {
            trigger: "#scene-intro",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

});
