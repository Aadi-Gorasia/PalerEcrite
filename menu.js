const cursor = document.getElementById('cursor');
const cursorText = document.getElementById('cursor-text');
const bgLayer = document.getElementById('bg-layer');

// Cursor Movement
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Hover Logic & BG Change
document.querySelectorAll('.hover-trigger').forEach(link => {
    link.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering');
        cursorText.innerText = link.getAttribute('data-cursor');
        
        // Change Background Color
        const newColor = link.getAttribute('data-bg');
        if(newColor) bgLayer.style.backgroundColor = newColor;
    });
    link.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering');
        cursorText.innerText = '';
        bgLayer.style.backgroundColor = '#050505'; // Reset to black
    });
});