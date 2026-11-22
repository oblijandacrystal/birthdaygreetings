/* ===== POPUPS ===== */
function openPopup(id) {
    document.getElementById(id).style.display = "flex";
    if (id === "cake") resetCake();
    if (id === "flowers") resetFlowers();
}

function closePopup(id) {
    document.getElementById(id).style.display = "none";
    if (id === "flowers") clearButterflies();
    if (id === "cake") clearBalloons();
}

// click the dark background to close
document.querySelectorAll(".popup").forEach(p => {
    p.addEventListener("click", e => {
        if (e.target === p) closePopup(p.id);
    });
});

/* ===== FLOWERS ===== */
function resetFlowers() {
    clearButterflies();
    document.getElementById("flowerStart").style.display = "block";
    document.getElementById("flowerReveal").style.display = "none";
    document.getElementById("bouquets").innerHTML = "";
}

function showBouquets() {
    buildBouquets();
    releaseButterflies();
    document.getElementById("flowerStart").style.display = "none";
    document.getElementById("flowerReveal").style.display = "block"; // restarts the CSS animations
}

/* ===== CAKE ===== */
function resetCake() {
    clearBalloons();
    document.getElementById("flame").style.display = "block";
    document.getElementById("status").innerText = "Make a wish";
}

function blowCandle() {
    document.getElementById("flame").style.display = "none";
    document.getElementById("status").innerText = "Happy Birthday! I love you, twiiin!";
    launchBalloons();
}


/* ===== BALLOONS: 50 smooth SVG balloons float up from the bottom ===== */
let balloonTimers = [];

function balloonSVG(color) {
    return '<svg viewBox="0 0 60 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M30 2C46 2 57 15 57 32C57 50 42 61 30 62C18 61 3 50 3 32C3 15 14 2 30 2Z" fill="' + color + '"/>' +
        '<path d="M30 62C42 61 57 50 57 32C57 44 46 58 30 58C14 58 3 44 3 32C3 50 18 61 30 62Z" fill="#000" opacity=".12"/>' +
        '<ellipse cx="19" cy="20" rx="6" ry="10" transform="rotate(25 19 20)" fill="#fff" opacity=".4"/>' +
        '<path d="M30 61L25 69H35Z" fill="' + color + '"/>' +
        '<g class="b-string"><path d="M30 69C24 78 36 88 30 98" stroke="#8A8A8A" stroke-width="1.3" fill="none" stroke-linecap="round"/></g>' +
        '</svg>';
}

function clearBalloons() {
    balloonTimers.forEach(clearTimeout);
    balloonTimers = [];
    document.querySelectorAll(".balloon").forEach(el => el.remove());
}

function launchBalloons() {
    clearBalloons();

    const colors = ["#F2A7B5", "#A1C8CB", "#E8D18F", "#BEAD9D", "#C9B6E4", "#9FD8B0", "#F9C4B0", "#E8789F"];
    const w = window.innerWidth;
    const h = window.innerHeight;
    const STEPS = 36; // many keyframes = a smooth, curved path

    for (let i = 0; i < 50; i++) {
        const scale = 0.7 + Math.random() * 0.7;       // different sizes
        const bw = 54 * scale;
        const bh = 90 * scale;

        const b = document.createElement("div");
        b.className = "balloon";
        b.style.width = bw + "px";
        b.style.height = bh + "px";
        b.style.setProperty("--ph", "-" + (Math.random() * 2).toFixed(2) + "s");
        b.style.zIndex = 20 + Math.floor(Math.random() * 3);
        b.style.visibility = "hidden";
        b.innerHTML = balloonSVG(colors[Math.floor(Math.random() * colors.length)]);
        document.body.appendChild(b);

        const x0 = Math.random() * Math.max(10, w - bw);
        const startY = h + 30;
        const rise = h + bh + 80;
        const dur = 7000 + Math.random() * 4000;       // slow and calm
        const amp = 18 + Math.random() * 28;           // side-to-side sway
        const cycles = 1.2 + Math.random() * 1.3;
        const phase = Math.random() * Math.PI * 2;

        const frames = [];
        for (let k = 0; k <= STEPS; k++) {
            const t = k / STEPS;
            const lift = 0.3 * t + 0.7 * t * t;        // starts gently, speeds up
            const swing = Math.sin(t * Math.PI * 2 * cycles + phase);
            const tilt = Math.cos(t * Math.PI * 2 * cycles + phase) * 6;
            frames.push({
                transform: "translate(" + (x0 + swing * amp) + "px, " + (startY - rise * lift) +
                           "px) rotate(" + tilt + "deg)"
            });
        }

        const delay = Math.random() * 3000;
        b.animate(frames, { duration: dur, delay: delay, easing: "linear", fill: "both" });
        balloonTimers.push(setTimeout(() => { b.style.visibility = "visible"; }, 0));
        balloonTimers.push(setTimeout(() => b.remove(), dur + delay + 500));
    }
}

/* ===== MUSIC: Happy Birthday tune made in the browser (no mp3 needed) ===== */
let audioCtx = null;
let loopTimer = null;

// [frequency in Hz, length in beats]
const TUNE = [
    [392, .75], [392, .25], [440, 1], [392, 1], [523.25, 1], [493.88, 2],
    [392, .75], [392, .25], [440, 1], [392, 1], [587.33, 1], [523.25, 2],
    [392, .75], [392, .25], [783.99, 1], [659.25, 1], [523.25, 1], [493.88, 1], [440, 1],
    [698.46, .75], [698.46, .25], [659.25, 1], [523.25, 1], [587.33, 1], [523.25, 2]
];

function startMusic() {
    stopMusic();
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audioCtx = new AC();

    const beat = 0.5; // seconds per beat; raise for a slower tune
    let t = audioCtx.currentTime + 0.1;

    TUNE.forEach(([freq, beats]) => {
        const dur = beats * beat;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.95);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + dur);
        t += dur;
    });

    // play it again after a short pause, until the popup is closed
    const total = (t - audioCtx.currentTime + 1.5) * 1000;
    loopTimer = setTimeout(startMusic, total);
}

function stopMusic() {
    clearTimeout(loopTimer);
    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
    }
}

/* ===== BOUQUETS: 3 bouquets x 19 chrysanthemums (rows of 3-4-5-4-3) ===== */
const BQ_ROWS = [3, 4, 5, 4, 3]; // = 19 flowers
const BQ_STYLES = [
    // [petal light, petal dark, centre, wrapping paper] - all pink chrysanthemums
    ["#F9CFDF", "#E8789F", "#F2D06B", "#A1C8CB"],
    ["#F9CFDF", "#E8789F", "#F2D06B", "#BEAD9D"],
    ["#F9CFDF", "#E8789F", "#F2D06B", "#E8D18F"]
];

function buildBouquets() {
    const box = document.getElementById("bouquets");
    box.innerHTML = "";

    BQ_STYLES.forEach((col, b) => {
        const bq = document.createElement("div");
        bq.className = "bq";
        bq.style.setProperty("--c1", col[0]);
        bq.style.setProperty("--c2", col[1]);
        bq.style.setProperty("--c3", col[2]);
        bq.style.setProperty("--w", col[3]);
        bq.style.setProperty("--d", b * 0.5 + "s");

        const blooms = document.createElement("div");
        blooms.className = "blooms";

        let k = 0;
        BQ_ROWS.forEach((n, r) => {
            for (let i = 0; i < n; i++) {
                const m = document.createElement("div");
                m.className = "mum";
                m.style.left = 50 + (i - (n - 1) / 2) * 20 + "px";
                m.style.top = 16 + r * 19 + "px";
                m.style.animationDelay = b * 0.5 + 0.3 + k * 0.04 + "s";
                blooms.appendChild(m);
                k++;
            }
        });

        bq.innerHTML = '<div class="wrap"></div><div class="bow">🎀</div>';
        bq.appendChild(blooms);
        box.appendChild(bq);
    });
}

/* ===== HOMEPAGE MUSIC BUTTON ===== */
let musicOn = false;
let musicTouched = false;

function setMusic(on) {
    musicOn = on;
    if (on) startMusic(); else stopMusic();
    const btn = document.getElementById("musicBtn");
    btn.innerText = on ? "🎵 Pause music" : "🎵 Play music";
    btn.classList.toggle("on", on);
}

function toggleMusic() {
    musicTouched = true;
    setMusic(!musicOn);
}

// music starts on the first tap anywhere on the page (browsers block it before that)
document.addEventListener("click", () => {
    if (!musicTouched) {
        musicTouched = true;
        setMusic(true);
    }
});

/* ===== PICTURES: friendly fallback if a photo is missing ===== */
const PHOTO_FALLBACK = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150"><rect width="150" height="150" rx="14" fill="#F3D9E1"/><text x="75" y="88" font-size="48" text-anchor="middle">💖</text></svg>'
);

document.querySelectorAll(".gallery img").forEach(img => {
    img.onerror = () => { img.onerror = null; img.src = PHOTO_FALLBACK; };
});

/* ===== BUTTERFLIES: 19 smooth, big butterflies fly in and land on 19 flowers ===== */
let flyers = [];
let flyRaf = null;

// [upper wing, lower wing]
const BF_COLORS = [
    ["#F7B6CD", "#E8789F"],
    ["#CDBBEA", "#9A7BC9"],
    ["#FBDD8E", "#F0A94D"],
    ["#B5DADD", "#6FA3A8"],
    ["#F9C4B0", "#EE8D72"]
];

function butterflySVG(c) {
    const wing =
        '<path d="M52 38C58 8 96 2 94 28C93 42 72 47 52 41Z" fill="' + c[0] + '"/>' +
        '<path d="M52 43C72 46 90 52 80 68C73 78 56 68 52 47Z" fill="' + c[1] + '"/>' +
        '<circle cx="78" cy="24" r="5" fill="#fff" opacity=".6"/>' +
        '<circle cx="72" cy="62" r="3.5" fill="#fff" opacity=".6"/>';
    return '<svg viewBox="0 0 100 80" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">' +
        '<g class="wing wl"><g transform="translate(100 0) scale(-1 1)">' + wing + '</g></g>' +
        '<g class="wing wr">' + wing + '</g>' +
        '<ellipse cx="50" cy="42" rx="2.6" ry="15" fill="#5B4A52"/>' +
        '<path d="M49 28C46 18 42 14 40 12M51 28C54 18 58 14 60 12" stroke="#5B4A52" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
        '</svg>';
}

function clearButterflies() {
    cancelAnimationFrame(flyRaf);
    flyers.forEach(f => f.el.remove());
    flyers = [];
    document.querySelectorAll(".bf-landed").forEach(el => el.remove());
}

function releaseButterflies() {
    clearButterflies();

    const mums = Array.from(document.querySelectorAll("#bouquets .mum"));
    mums.sort(() => Math.random() - 0.5);
    const targets = mums.slice(0, 19);

    const w = window.innerWidth;
    const h = window.innerHeight;
    const t0 = performance.now();

    targets.forEach((mum, k) => {
        const size = 44 + Math.random() * 16; // big
        const colors = BF_COLORS[k % BF_COLORS.length];
        const phase = "-" + (Math.random() * 0.3).toFixed(2) + "s";

        const el = document.createElement("div");
        el.className = "bf-fly";
        el.style.width = size + "px";
        el.style.height = size * 0.8 + "px";
        el.style.setProperty("--ph", phase);
        el.style.visibility = "hidden";
        el.innerHTML = butterflySVG(colors);
        document.body.appendChild(el);

        const fromLeft = Math.random() < 0.5;
        flyers.push({
            el, mum, size, colors, phase,
            sx: fromLeft ? -80 : w + 80,
            sy: Math.random() * h * 0.6,
            wob: Math.random() * 6,
            start: t0 + 2000 + k * 200,            // fly in after the flowers bloom
            dur: 3400 + Math.random() * 1800,      // slow and smooth
            bend: (Math.random() - 0.5) * 240,
            lift: 70 + Math.random() * 110,
            rot: null, px: null, py: null
        });
    });

    flyRaf = requestAnimationFrame(stepButterflies);
}

function stepButterflies(now) {
    flyers = flyers.filter(f => {
        if (now < f.start) return true;

        const r = f.mum.getBoundingClientRect();         // follow the flower live
        const tx = r.left + r.width / 2;
        const ty = r.top + r.height / 2;

        const p = (now - f.start) / f.dur;
        if (p >= 1) {                                    // landed: rest on the flower
            f.el.remove();
            const l = document.createElement("div");
            l.className = "bf-landed";
            l.style.width = f.size + "px";
            l.style.height = f.size * 0.8 + "px";
            l.style.setProperty("--ph", f.phase);
            l.innerHTML = butterflySVG(f.colors);
            f.mum.appendChild(l);
            return false;
        }

        const e = -(Math.cos(Math.PI * p) - 1) / 2;      // sine ease-in-out (very smooth)
        const cx = (f.sx + tx) / 2 + f.bend;
        const cy = Math.min(f.sy, ty) - f.lift;
        const q = 1 - e;
        let x = q * q * f.sx + 2 * q * e * cx + e * e * tx;
        let y = q * q * f.sy + 2 * q * e * cy + e * e * ty;
        y += Math.sin(p * 6 + f.wob) * 12 * q;           // slow, gentle drift
        x += Math.cos(p * 5 + f.wob) * 10 * q;

        // face the direction of travel, then settle upright when landing
        let goal = f.rot === null ? 0 : f.rot;
        if (f.px !== null) {
            const dx = x - f.px, dy = y - f.py;
            if (Math.hypot(dx, dy) > 0.3) goal = Math.atan2(dy, dx) * 180 / Math.PI + 90;
        }
        if (p > 0.85) goal = 0;
        if (f.rot === null) f.rot = goal;
        const diff = ((goal - f.rot + 540) % 360) - 180;  // shortest turn
        f.rot += diff * 0.08;
        f.px = x; f.py = y;

        f.el.style.visibility = "visible";
        f.el.style.transform =
            "translate(" + x + "px, " + y + "px) translate(-50%, -50%) rotate(" + f.rot + "deg)";
        return true;
    });

    if (flyers.length) flyRaf = requestAnimationFrame(stepButterflies);
}