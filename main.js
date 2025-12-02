/* --- INITIALIZATION --- */
console.log('%c PALER ECRITE v2.1 [SYSTEM LOCKED] ', 'background: #ff3300; color: #000; font-weight: bold; padding: 4px;');

// Libraries
gsap.registerPlugin(ScrollTrigger);

// 1. LENIS SMOOTH SCROLL
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

/* --- CURSOR LOGIC (PHYSICS RING) --- */

const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');

// Mouse Position Variables
let mouseX = 0;
let mouseY = 0;
let ringX = 0;
let ringY = 0;

// Track Mouse Movement
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Instant update for the Dot (No lag)
    gsap.set(cursorDot, { x: mouseX, y: mouseY });
});

// The Animation Loop (Runs 60fps for smooth drag)
gsap.ticker.add(() => {
    // Linear Interpolation (Lerp) for the Ring
    // 0.15 is the speed. Lower = slower/heavier. Higher = faster.
    const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio()); 
    
    ringX += (mouseX - ringX) * dt;
    ringY += (mouseY - ringY) * dt;
    
    gsap.set(cursorRing, { x: ringX, y: ringY });
});

/* --- HOVER INTERACTIONS --- */

document.querySelectorAll('[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering');
        
        // Pass the text to the CSS ::after pseudo-element
        const text = el.getAttribute('data-cursor');
        cursorRing.setAttribute('data-text', text); 
    });
    
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering');
        cursorRing.setAttribute('data-text', '');
    });
});

// 3. TEXT SCRAMBLE ALGORITHM
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]';
function scrambleText(element, finalString) {
    // If no string provided, use current text
    const originalText = finalString || element.innerText; 
    let iterations = 0;
    
    const interval = setInterval(() => {
        element.innerText = originalText
            .split('')
            .map((letter, index) => {
                if(index < iterations) return originalText[index];
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');
        
        if(iterations >= originalText.length) clearInterval(interval);
        iterations += 1 / 2; // Speed of resolve
    }, 30);
}

// Scramble main headers on load
document.querySelectorAll('.scramble-hover').forEach(el => {
    el.addEventListener('mouseenter', () => scrambleText(el));
});


// 4. GLOBAL ANIMATIONS (Reveal on Scroll)
const revealElements = document.querySelectorAll('.reveal');
revealElements.forEach(el => {
    gsap.fromTo(el, 
        { y: 50, opacity: 0 },
        {
            y: 0, opacity: 1, duration: 1.2, ease: 'power3.out',
            scrollTrigger: { 
                trigger: el, 
                start: 'top 90%' 
            }
        }
    );
});

// Parallax Images
gsap.utils.toArray('img').forEach(img => {
    gsap.to(img, {
        scale: 1.1,
        ease: "none",
        scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

// 5. PAGE TRANSITION
document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if(href && href !== '#' && !href.startsWith('mailto')) {
            e.preventDefault();
            const overlay = document.querySelector('.page-transition');
            
            // Animation: Curtain Up
            gsap.to(overlay, { 
                scaleY: 1, 
                duration: 0.5, 
                ease: 'expo.inOut',
                onComplete: () => window.location = href 
            });
        }
    });
});

// Initial Load Animation
window.addEventListener('load', () => {
    const overlay = document.querySelector('.page-transition');
    // Animation: Curtain Down
    gsap.to(overlay, { scaleY: 0, duration: 0.8, ease: 'expo.inOut', delay: 0.1 });
});