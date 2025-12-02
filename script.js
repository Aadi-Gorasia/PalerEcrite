// 1. CURSOR LOGIC
const cursor = document.getElementById('cursor');
const cursorText = document.getElementById('cursor-text');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

const triggers = document.querySelectorAll('.hover-trigger');
triggers.forEach(trigger => {
    trigger.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering');
        const text = trigger.getAttribute('data-cursor') || '';
        cursorText.innerText = text;
    });
    trigger.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering');
        cursorText.innerText = '';
    });
});

// 2. SMOOTH SCROLL (LENIS)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});

// The Animation Loop (Required for scroll to work)
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 3. GSAP ANIMATIONS
gsap.registerPlugin(ScrollTrigger);

// Hero Reveal
const tl = gsap.timeline();

// Using .from() ensures that if JS fails, text is visible by default
tl.from(".reveal-text", {
    y: "100%", 
    duration: 1.5,
    ease: "power4.out",
    stagger: 0.1,
    delay: 0.2
})
.from(".reveal-opacity", {
    opacity: 0,
    duration: 1,
}, "-=1"); 

// Image Parallax
gsap.utils.toArray('.grid-cols-2 img').forEach(img => {
    gsap.to(img, {
        y: -30,
        ease: "none",
        scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});