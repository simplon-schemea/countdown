declare var Expo: typeof gsap.Expo;

(function () {
    let overlay: HTMLDivElement;
    const footer        = document.body.querySelector("footer");
    const lightning_box = document.createElement("div");

    const lightning_images = [ new Image(), new Image() ];

    for (let i = 0; i < lightning_images.length; i++) {
        lightning_images[i].src = `images/lightning-${ i + 1 }.png`;
    }

    const audio = {
        thunder: [ new Audio("audio/thunder-1.mp3"), new Audio("audio/thunder-2.mp3") ],
        light: new Audio("audio/light.ogg"),
    }

    function create_overlay() {
        let overlay = document.body.appendChild(document.createElement("div"));
        overlay.classList.add("overlay");
        overlay.style.backgroundColor = "black";
        return overlay;
    }

    function blink(on_alpha: number, off_alpha: number) {
        const timeline = new TimelineLite();
        let on = false;

        // Switch the black overlay's opacity between on_alpha & off_alpha
        // Play a sound each time opacity is switched to on_alpha
        // Simulate a light bulb disfunctioning
        const toggle = (delay: number = 0) => {
            const opacity = (on = !on) ? on_alpha : off_alpha;
            timeline.set(overlay, {
                backgroundColor: `rgba(0, 0, 0, ${opacity})`
            }, `+=${delay / 1000}`);
            if (on) {
                timeline.call(() => {
                    audio.light.currentTime = 0;
                    audio.light.play().catch(console.error);
                })
            }
        }

        // Call toggle() for each value
        [0, 200, 100, 300, 100, 300, 100, 500, 100].forEach(delay => toggle(delay));
        return timeline;
    }

    function lightning() {
        const timeline = new TimelineLite();
        timeline.set(overlay, { backgroundColor: "rgba(0, 0, 0, 0.93)" });
        timeline.call(() => overlay.appendChild(lightning_box));
        function trigger(i: number, delay: number = 0) {
            // Set lightning box's background to the specified lightning image
            // Play a thunder sound
            timeline.call(() => {
                lightning_box.style.backgroundImage = `url(${ lightning_images[i].src })`
                audio.thunder[i].currentTime        = 0;
                audio.thunder[i].play().catch(console.error);
            }, null, null, `+=${Math.max(0, delay / 1000 - 1)}`);
            timeline.fromTo(lightning_box, 1, {
                opacity: 1,
                ease: Expo.easeOut
            }, {
                    opacity: 0
                });
            timeline.fromTo(overlay, 0.8, {
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                ease: Expo.easeOut
            }, {
                    backgroundColor: "rgba(0, 0, 0, 0.97)"
                }, "-=1")
        }
        trigger(0);
        trigger(1, 250);
        timeline.call(() => lightning_box.remove());
        return timeline;
    }

    function create_timeline()
    {
        const timeline = new TimelineLite({
            paused: true
        });
        timeline.set(overlay, {
            display: "block",
            backgroundColor: "rgba(0, 0, 0, 0.93)"
        })

        timeline.add(blink(0.93, 0.25));
        timeline.to(overlay, 0.8, {
            backgroundColor: "black",
            ease: Expo.easeOut
        })
        timeline.add(lightning());

        timeline.add(blink(0, 0.95), "+=1.5");
        timeline.set(overlay, { display: "none" });
        timeline.to(footer, 0.5, {
            text: "Is that what we were waiting for? Should we wait more?"
        })
        return timeline;
    }

    overlay = create_overlay();
    overlay.style.display = "none";

    const timeline = create_timeline();
    countdown.onend.add(() => {
        timeline.play(0);
    });
    countdown.onstatechanged.add((state)=>{
        if(timeline.isActive() && state === "runing")
            timeline.render(timeline.endTime());
    })

    const once = () => {
        countdown.onreset.add(() => TweenLite.to(footer, 0.5, { text: "Let's wait a little more..." }));
        countdown.onend.remove(once);
    };

    countdown.onend.add(once);
})();
