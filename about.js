// Cursor
const cursor = document.getElementById('cursor');
const cursorText = document.getElementById('cursor-text');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('.hover-trigger').forEach(t => {
    t.addEventListener('mouseenter', () => { document.body.classList.add('hovering'); cursorText.innerText = t.dataset.cursor; });
    t.addEventListener('mouseleave', () => { document.body.classList.remove('hovering'); });
});

// Scroll
const lenis = new Lenis({ duration: 1.2, smooth: true });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// GSAP Animations
gsap.registerPlugin(ScrollTrigger);

gsap.utils.toArray('.trigger-block').forEach(block => {
    gsap.from(block.children, {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
            trigger: block,
            start: "top 80%",
            toggleActions: "play none none reverse"
        }
    });
});