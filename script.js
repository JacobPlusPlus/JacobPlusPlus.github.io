/* ========================
   script.js — Autumn Leaves + Chess Board
   ======================== */

// ─── FALLING LEAVES ───────────────────────────────────────────────────────────
(function () {
    const canvas = document.getElementById("leavesCanvas");
    const ctx = canvas.getContext("2d");

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    });

    // Leaf shapes drawn with canvas paths
    const LEAF_COLORS = [
        "#c0392b", "#d35400", "#e67e22",
        "#a93226", "#b7770d", "#8b4513",
        "#cd6155", "#e59866", "#f0a500"
    ];

    function randomBetween(a, b) {
        return a + Math.random() * (b - a);
    }

    class Leaf {
        constructor(fromTop) {
            this.reset(fromTop);
        }

        reset(fromTop = false) {
            this.x     = randomBetween(-60, W + 60);
            this.y     = fromTop ? randomBetween(-100, -20) : randomBetween(-100, H);
            this.size  = randomBetween(10, 26);
            this.speedX = randomBetween(-1.2, 1.2);
            this.speedY = randomBetween(0.8, 2.2);
            this.rot   = randomBetween(0, Math.PI * 2);
            this.rotSpeed = randomBetween(-0.03, 0.03);
            this.sway  = randomBetween(0, Math.PI * 2);
            this.swaySpeed = randomBetween(0.008, 0.025);
            this.swayAmp   = randomBetween(30, 80);
            this.originX   = this.x;
            this.color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
            this.alpha = randomBetween(0.5, 0.9);
            this.shape = Math.floor(Math.random() * 3); // 0=maple, 1=oval, 2=round
        }

        drawMaple(ctx, s) {
            ctx.beginPath();
            ctx.moveTo(0, -s);
            for (let i = 0; i < 5; i++) {
                const a1 = (i / 5) * Math.PI * 2 - Math.PI / 2;
                const a2 = ((i + 0.5) / 5) * Math.PI * 2 - Math.PI / 2;
                ctx.lineTo(Math.cos(a1) * s, Math.sin(a1) * s);
                ctx.lineTo(Math.cos(a2) * s * 0.45, Math.sin(a2) * s * 0.45);
            }
            ctx.closePath();
        }

        drawOval(ctx, s) {
            ctx.beginPath();
            ctx.ellipse(0, 0, s * 0.55, s, 0, 0, Math.PI * 2);
        }

        drawRound(ctx, s) {
            ctx.beginPath();
            ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2);
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rot);

            ctx.fillStyle = this.color;
            if      (this.shape === 0) this.drawMaple(ctx, this.size);
            else if (this.shape === 1) this.drawOval(ctx, this.size);
            else                       this.drawRound(ctx, this.size);

            ctx.fill();

            // Simple vein line
            ctx.strokeStyle = "rgba(0,0,0,0.2)";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(0, this.size * 0.8);
            ctx.lineTo(0, -this.size * 0.8);
            ctx.stroke();

            ctx.restore();
        }

        update() {
            this.sway += this.swaySpeed;
            this.x     = this.originX + Math.sin(this.sway) * this.swayAmp;
            this.y    += this.speedY;
            this.rot  += this.rotSpeed;

            if (this.y > H + 60) {
                this.reset(true);
            }
        }
    }

    const LEAF_COUNT = Math.min(55, Math.floor(W / 22));
    const leaves = Array.from({ length: LEAF_COUNT }, () => new Leaf(false));

    function animate() {
        ctx.clearRect(0, 0, W, H);
        leaves.forEach(l => { l.update(); l.draw(); });
        requestAnimationFrame(animate);
    }

    animate();
})();


// ─── MINI CHESS BOARD ─────────────────────────────────────────────────────────
(function () {
    const boardEl = document.getElementById("miniBoard");
    if (!boardEl) return;

    // Starting position (FEN-like simplified, row 0 = rank 8)
    const startPos = [
        ["r","n","b","q","k","b","n","r"],
        ["p","p","p","p","p","p","p","p"],
        [" "," "," "," "," "," "," "," "],
        [" "," "," "," "," "," "," "," "],
        [" "," "," "," ","P"," "," "," "],  // 1.e4
        [" "," "," "," "," "," "," "," "],
        ["P","P","P","P"," ","P","P","P"],
        ["R","N","B","Q","K","B","N","R"],
    ];

    // After 1.e4 e5 2.Nf3
    const position = [
        ["r","n","b","q","k","b"," ","r"],
        ["p","p","p","p"," ","p","p","p"],
        [" "," "," "," "," ","n"," "," "],
        [" "," "," "," ","p"," "," "," "],
        [" "," "," "," ","P"," "," "," "],
        [" "," "," "," "," ","N"," "," "],
        ["P","P","P","P"," ","P","P","P"],
        ["R","N","B","Q","K","B"," ","R"],
    ];

    const unicodePieces = {
        'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
        'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
        ' ': ''
    };

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const sq = document.createElement("div");
            const isLight = (row + col) % 2 === 0;
            sq.style.cssText = `
                width: 38px; height: 38px;
                display: flex; align-items: center; justify-content: center;
                font-size: 1.5rem;
                background: ${isLight ? "#e8d5a3" : "#8b5a2b"};
                cursor: default;
                user-select: none;
                transition: filter 0.3s;
            `;

            const piece = position[row][col];
            sq.textContent = unicodePieces[piece] || '';

            const isWhite = piece >= 'A' && piece <= 'Z' && piece !== ' ';
            const isBlack = piece >= 'a' && piece <= 'z';
            sq.style.color = isWhite ? "#f5ead8" : isBlack ? "#1a0f08" : "transparent";
            sq.style.textShadow = isWhite
                ? "0 1px 3px rgba(0,0,0,0.8)"
                : isBlack ? "0 1px 2px rgba(255,255,255,0.2)" : "none";

            sq.addEventListener("mouseenter", () => {
                sq.style.filter = "brightness(1.2)";
            });
            sq.addEventListener("mouseleave", () => {
                sq.style.filter = "brightness(1)";
            });

            boardEl.appendChild(sq);
        }
    }
})();


// ─── SKILL BAR ANIMATION (IntersectionObserver) ────────────────────────────────
(function () {
    const bars = document.querySelectorAll(".progress");
    if (!bars.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.style.animationPlayState = "running";
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.3 });

    bars.forEach(bar => {
        bar.style.animationPlayState = "paused";
        observer.observe(bar);
    });
})();


// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
(function () {
    const revealEls = document.querySelectorAll(
        ".skill-card, .interest-card, .contact-card, .about-grid > *"
    );

    const style = document.createElement("style");
    style.textContent = `
        .reveal-hidden {
            opacity: 0;
            transform: translateY(32px);
            transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal-visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    revealEls.forEach((el, i) => {
        el.classList.add("reveal-hidden");
        el.style.transitionDelay = `${(i % 4) * 0.1}s`;
    });

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add("reveal-visible");
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach(el => obs.observe(el));
})();


// ─── MOBILE NAV TOGGLE ────────────────────────────────────────────────────────
(function () {
    const toggle = document.querySelector(".nav-toggle");
    const navUl  = document.querySelector("nav ul");
    if (!toggle || !navUl) return;

    toggle.addEventListener("click", () => {
        navUl.classList.toggle("open");
    });

    document.querySelectorAll("nav a").forEach(a => {
        a.addEventListener("click", () => navUl.classList.remove("open"));
    });
})();


// ─── PARALLAX HERO PIECES ─────────────────────────────────────────────────────
(function () {
    const pieces = document.querySelectorAll(".piece");
    if (!pieces.length) return;

    document.addEventListener("mousemove", (e) => {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;

        pieces.forEach((p, i) => {
            const depth = (i + 1) * 4;
            p.style.transform = `translate(${dx * depth}px, ${dy * depth}px)`;
        });
    });
})();