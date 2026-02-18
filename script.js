// =====================================================
// CV-FLIX - Interactive JavaScript
// =====================================================

const BG_VIDEOS = [
    'AYxO1yYquJM',  // Steamboat Willie (1928)
    '1JWCAXzNO00',  // Plane Crazy (1928)
    '3F_4uM7RxDI',  // Superman: The Mad Scientist (1941)
    'V-d50cR8Ejo',  // Superman: Mechanical Monsters (1941)
    'BM8uUd857k8',  // Betty Boop: Minnie the Moocher (1932)
    'tBKAG0ut9Ds',  // Betty Boop: Barnacle Bill (1930)
];

let currentBgIndex = Math.floor(Math.random() * BG_VIDEOS.length);
let heroPlayer;
let isMuted = true;

function getNextVideo() {
    currentBgIndex = (currentBgIndex + 1) % BG_VIDEOS.length;
    return BG_VIDEOS[currentBgIndex];
}

// =====================================================
// Splash Screen with "Ta-dum" Sound
// =====================================================
function playTudum() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const now = ctx.currentTime;

        const notes = [
            { freq: 220, start: 0, dur: 0.3 },
            { freq: 330, start: 0.35, dur: 0.6 },
        ];

        notes.forEach(n => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(n.freq, now + n.start);
            gain.gain.setValueAtTime(0, now + n.start);
            gain.gain.linearRampToValueAtTime(0.3, now + n.start + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + n.start);
            osc.stop(now + n.start + n.dur);
        });

        const sub = ctx.createOscillator();
        const subGain = ctx.createGain();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(55, now + 0.35);
        subGain.gain.setValueAtTime(0, now + 0.35);
        subGain.gain.linearRampToValueAtTime(0.15, now + 0.4);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        sub.connect(subGain);
        subGain.connect(ctx.destination);
        sub.start(now + 0.35);
        sub.stop(now + 1.3);
    } catch (e) { /* audio not supported */ }
}

function initSplash() {
    const splash = document.getElementById('splashScreen');
    if (!splash) return;

    document.body.style.overflow = 'hidden';

    setTimeout(() => playTudum(), 500);

    setTimeout(() => {
        splash.classList.add('fade-out');
        document.body.style.overflow = '';
    }, 2800);

    setTimeout(() => {
        splash.remove();
    }, 3500);
}

window.addEventListener('DOMContentLoaded', initSplash);

// =====================================================
// YouTube IFrame API for Hero Background
// =====================================================
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
    heroPlayer = new YT.Player('heroYTPlayer', {
        videoId: BG_VIDEOS[currentBgIndex],
        playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            modestbranding: 1,
            showinfo: 0,
            rel: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            playsinline: 1,
            start: 10
        },
        events: {
            onReady: (e) => e.target.playVideo(),
            onStateChange: (e) => {
                if (e.data === YT.PlayerState.ENDED) {
                    const next = getNextVideo();
                    e.target.loadVideoById({ videoId: next, startSeconds: 10 });
                }
            }
        }
    });
}

// =====================================================
// Sound Toggle
// =====================================================
function toggleSound() {
    if (!heroPlayer) return;
    const btn = document.getElementById('soundToggle');
    if (isMuted) {
        heroPlayer.unMute();
        heroPlayer.setVolume(40);
        btn.classList.add('unmuted');
    } else {
        heroPlayer.mute();
        btn.classList.remove('unmuted');
    }
    isMuted = !isMuted;
}

// =====================================================
// Video Modal (generic, works for all videos)
// =====================================================
function openVideoModal(videoId, title, year, genre, duration, director, description) {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('modalVideo');
    const modalTitle = document.getElementById('modalTitle');
    const modalMeta = document.getElementById('modalMeta');
    const modalDesc = document.getElementById('modalDesc');

    modalTitle.textContent = title;
    modalMeta.innerHTML = [year, genre, duration, director]
        .map(t => `<span class="meta-tag">${t}</span>`)
        .join('');
    modalDesc.textContent = description;

    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('modalVideo');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    iframe.src = '';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideoModal();
});

// =====================================================
// Theme Switcher
// =====================================================
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.toggle('active-theme', btn.dataset.theme === theme);
    });
    localStorage.setItem('cvflix-theme', theme);
}

(function loadTheme() {
    const saved = localStorage.getItem('cvflix-theme');
    if (saved) setTheme(saved);
})();

// =====================================================
// Navbar
// =====================================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Active nav link highlight
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// =====================================================
// Carousel
// =====================================================
function scrollCarousel(carouselId, direction) {
    const carousel = document.getElementById(carouselId);
    const scrollAmount = 340;
    carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    });
});

// Keyboard navigation for carousels
document.querySelectorAll('.carousel').forEach(carousel => {
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') carousel.scrollBy({ left: -340, behavior: 'smooth' });
        else if (e.key === 'ArrowRight') carousel.scrollBy({ left: 340, behavior: 'smooth' });
    });
});

// =====================================================
// Scroll Animations (IntersectionObserver)
// =====================================================
const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.section, .card, .skill-item, .timeline-item, .education-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

const animStyle = document.createElement('style');
animStyle.textContent = `.animate-in { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(animStyle);

// Hero intro animation
window.addEventListener('load', () => {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(50px)';
        setTimeout(() => {
            heroContent.style.transition = 'all 1s ease-out';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 200);
    }

    document.querySelectorAll('.tag').forEach((tag, i) => {
        tag.style.opacity = '0';
        tag.style.transform = 'translateY(20px)';
        setTimeout(() => {
            tag.style.transition = 'all 0.5s ease-out';
            tag.style.opacity = '1';
            tag.style.transform = 'translateY(0)';
        }, 800 + (i * 150));
    });
});

// Parallax hero
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrolled = window.pageYOffset;
    if (hero && scrolled < window.innerHeight) {
        hero.style.backgroundPositionY = `${scrolled * 0.3}px`;
    }
});

// =====================================================
// Easter Egg: Konami Code
// =====================================================
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiSequence[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiSequence.length) {
            activateKonami();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateKonami() {
    document.body.classList.add('konami-active');
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        z-index: 100000; font-family: 'Bebas Neue', sans-serif; font-size: 4rem;
        color: #fff; text-shadow: 0 0 20px var(--accent); pointer-events: none;
        animation: splashFadeIn 0.5s ease forwards;
    `;
    msg.textContent = '🎮 KONAMI CODE ACTIVATED!';
    document.body.appendChild(msg);

    setTimeout(() => {
        document.body.classList.remove('konami-active');
        msg.remove();
    }, 3000);
}

// =====================================================
// Easter Egg: "Are you still watching?" Idle Popup
// =====================================================
let idleTimer;
const IDLE_TIMEOUT = 60000;

function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(showIdlePopup, IDLE_TIMEOUT);
}

function showIdlePopup() {
    document.getElementById('idlePopup').classList.add('active');
}

function dismissIdle() {
    document.getElementById('idlePopup').classList.remove('active');
    resetIdleTimer();
}

['mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach(evt => {
    document.addEventListener(evt, resetIdleTimer, { passive: true });
});

resetIdleTimer();

// =====================================================
// Console Easter Egg
// =====================================================
console.log('%c🎬 CV-FLIX', 'font-size: 40px; font-weight: bold; color: #E50914;');
console.log('%cWelcome to Aarush Saxena\'s Portfolio!', 'font-size: 16px; color: #fff;');
console.log('%cTry the Konami Code: ↑↑↓↓←→←→BA', 'font-size: 12px; color: #808080;');
