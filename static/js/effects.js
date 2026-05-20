document.addEventListener("DOMContentLoaded", function () {
    // 1. 动效初始化
    setTimeout(() => {
        const title = document.getElementById("coverTitle");
        if (title) title.classList.remove("opacity-0", "translate-y-4");
    }, 300);

    const twElement = document.getElementById("typewriterText");
    if (twElement) {
        const rawText = twElement.getAttribute("data-text") || "";
        let charIndex = 0;
        function startTypewriter() {
            if (charIndex < rawText.length) {
                twElement.innerHTML += rawText.charAt(charIndex);
                charIndex++;
                setTimeout(startTypewriter, 120);
            } else { twElement.classList.remove("cursor-blink"); }
        }
        setTimeout(startTypewriter, 1300);
    }

    // 2. 智能声学调音引擎
    const audio = document.getElementById("bgmAudio");
    const musicControl = document.getElementById("musicControl");
    const musicIcon = document.getElementById("musicIcon");
    let audioStarted = false;

    function initAudio() {
        if (audioStarted || !audio) return;
        audio.volume = window.BGM_CONFIG.initialVolume;
        audio.play().then(() => {
            audioStarted = true;
            if (musicIcon) musicIcon.style.animationPlayState = "running";
        }).catch(err => console.log("等待交互解锁音频"));
    }
    document.addEventListener("click", initAudio, { once: true });
    document.addEventListener("scroll", initAudio, { once: true });

    if (musicControl) {
        musicControl.addEventListener("click", function (e) {
            e.stopPropagation();
            if (!audioStarted) { initAudio(); return; }
            if (audio.paused) {
                audio.play();
                if (musicIcon) musicIcon.style.animationPlayState = "running";
            } else {
                audio.pause();
                if (musicIcon) musicIcon.style.animationPlayState = "paused";
            }
        });
    }

    // 3. 视口感知交叉调节
    const sections = {
        cover: document.getElementById("section-cover"),
        timeline: document.getElementById("section-timeline"),
        letter: document.getElementById("section-letter"),
        footer: document.getElementById("section-footer")
    };
    const timelineNodes = document.querySelectorAll(".timeline-node");
    const letterRows = document.querySelectorAll(".letter-row");

    function smoothFadeVolume(targetVolume) {
        if (!audio || !audioStarted) return;
        let currentVol = audio.volume;
        const step = (targetVolume - currentVol) / 20;
        let count = 0;
        const interval = setInterval(() => {
            currentVol += step;
            if (currentVol < 0) currentVol = 0;
            if (currentVol > 1) currentVol = 1;
            audio.volume = currentVol;
            count++;
            if (count >= 20) { audio.volume = targetVolume; clearInterval(interval); }
        }, window.BGM_CONFIG.fadeDuration / 20);
    }

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.id === "section-cover") smoothFadeVolume(window.BGM_CONFIG.initialVolume);
                else if (entry.target.id === "section-timeline") smoothFadeVolume(window.BGM_CONFIG.timelineVolume);
                else if (entry.target.id === "section-letter") smoothFadeVolume(window.BGM_CONFIG.letterVolume);
                else if (entry.target.id === "section-footer") smoothFadeVolume(0.05);

                if (entry.target.classList.contains("timeline-node")) entry.target.classList.remove("opacity-0");
                if (entry.target.classList.contains("letter-row")) entry.target.classList.remove("opacity-0");
            }
        });
    }, { threshold: 0.15 });

    Object.values(sections).forEach(s => { if (s) scrollObserver.observe(s); });
    timelineNodes.forEach(node => scrollObserver.observe(node));
    letterRows.forEach(row => scrollObserver.observe(row));

    // 4. 爱心轻柔漂落引擎
    const canvas = document.getElementById("heartCanvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let hearts = [];
        function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        class Heart {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height - canvas.height;
                this.size = Math.random() * 8 + 6;
                this.speedY = Math.random() * 1 + 0.5;
                this.opacity = Math.random() * 0.4 + 0.2;
                this.swingSpeed = Math.random() * 0.02;
            }
            draw() {
                ctx.save(); ctx.globalAlpha = this.opacity; ctx.fillStyle = "#f472b6"; ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.bezierCurveTo(this.x - this.size / 2, this.y - this.size / 2, this.x - this.size, this.y + this.size / 3, this.x, this.y + this.size * 0.9);
                ctx.bezierCurveTo(this.x + this.size, this.y + this.size / 3, this.x + this.size / 2, this.y - this.size / 2, this.x, this.y);
                ctx.fill(); ctx.restore();
            }
            update() {
                this.y += this.speedY; this.x += Math.sin(this.y * this.swingSpeed) * 0.4;
                if (this.y > canvas.height) { this.y = -20; this.x = Math.random() * canvas.width; }
            }
        }
        for (let i = 0; i < 30; i++) { hearts.push(new Heart()); }
        function animateHearts() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hearts.forEach(heart => { heart.update(); heart.draw(); });
            requestAnimationFrame(animateHearts);
        }
        animateHearts();
    }

    // 5. 原生相册灯箱
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxClose = document.getElementById("lightboxClose");
    document.querySelectorAll(".gallery-img").forEach(img => {
        img.addEventListener("click", () => {
            if (lightboxImg && lightbox) {
                lightboxImg.src = img.src; lightbox.classList.remove("hidden");
                setTimeout(() => lightbox.classList.add("opacity-100"), 10);
            }
        });
    });
    function closeLightbox() {
        if (lightbox) { lightbox.classList.remove("opacity-100"); setTimeout(() => lightbox.classList.add("hidden"), 300); }
    }
    if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
    if (lightbox) lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

    // 6. 彩蛋解锁机制
    let clickCounter = 0;
    const trigger = document.getElementById("secretTrigger");
    const eggModal = document.getElementById("eggModal");
    const eggClose = document.getElementById("eggClose");
    if (trigger) {
        trigger.addEventListener("click", () => {
            clickCounter++;
            if (clickCounter === 3) { if (eggModal) eggModal.classList.remove("hidden"); clickCounter = 0; }
        });
    }
    if (eggClose) eggClose.addEventListener("click", () => { if (eggModal) eggModal.classList.add("hidden"); });
});
