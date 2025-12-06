/* 
    PALER ECRITE // CLOUD UPLINK (JSONBIN)
*/

// --- CONFIGURATION ---
const BIN_ID = '6933f55743b1c97be9db5c65 ';
const API_KEY = '$2a$10$69IbQEJwSHx/6v52kYQ//OHyqt0UzBNAeBwgWwibdgasZgdYGsaEa';
const DB_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// --- HELPER: FETCH DATA ---
async function fetchCloudData() {
    const response = await fetch(DB_URL, {
        headers: {
            'X-Master-Key': API_KEY
        }
    });
    const json = await response.json();
    return json.record; // JSONBin stores data inside a 'record' wrapper
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// 1. HOMEPAGE GRID
async function loadHomeGrid() {
    const gridContainer = document.getElementById('works-grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = '<div class="text-center font-mono text-xs animate-pulse text-[#ff3300]">ESTABLISHING SATELLITE LINK...</div>';

    try {
        const data = await fetchCloudData();
        gridContainer.innerHTML = '';

        // Reverse to show newest first, take 5
        const recent = data.reverse().slice(0, 3); 

        recent.forEach((item) => {
            const html = `
            <div class="group relative border-t border-black py-8 md:py-12 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-white transition-colors duration-300 px-2 md:px-4 reveal cursor-pointer" 
                 onclick="window.location.href='read.html?id=${item.id}'"
                 data-cursor="READ">
                <h4 class="text-3xl md:text-6xl font-black uppercase md:group-hover:translate-x-4 transition-transform duration-300">${item.title}</h4>
                <div class="flex items-center justify-between w-full md:w-auto mt-4 md:mt-0 gap-4 md:gap-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                    <span class="font-mono text-[#ff3300] text-xs">${item.genre}</span>
                    <span class="font-mono text-xs">${item.author}</span>
                </div>
            </div>
            `;
            gridContainer.innerHTML += html;
        });
        if(window.ScrollTrigger) ScrollTrigger.refresh();

    } catch (error) { console.error(error); }
}

// 2. ARCHIVE LIST
async function loadArchive() {
    const listContainer = document.getElementById('archive-list');
    if (!listContainer) return;

    try {
        const data = await fetchCloudData();
        listContainer.innerHTML = '';
        document.getElementById('total-count').innerText = `COUNT: ${data.length}`;

        data.reverse().forEach((item, index) => {
            const num = (data.length - index).toString().padStart(2, '0');
            const html = `
            <div class="group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 py-6 border-b border-[#ccc] hover:border-[#ff3300] hover:bg-white transition-all cursor-pointer items-center px-2 reveal"
                 onclick="window.location.href='read.html?id=${item.id}'"
                 data-cursor="OPEN">
                <div class="col-span-1 font-mono text-[#ff3300] text-xs font-bold">#${num}</div>
                <div class="col-span-1 md:col-span-6 text-2xl md:text-4xl font-black uppercase group-hover:translate-x-2 transition-transform">${item.title}</div>
                <div class="col-span-2 font-mono text-xs hidden md:block">${item.genre}</div>
                <div class="col-span-2 font-mono text-xs hidden md:block">${item.author}</div>
                <div class="col-span-1 font-mono text-xs text-right hidden md:block">${item.date}</div>
            </div>
            `;
            listContainer.innerHTML += html;
        });
        if(window.ScrollTrigger) ScrollTrigger.refresh();
    } catch (e) { listContainer.innerHTML = "ERROR LOADING ARCHIVE."; }
}


// 3. READER PAGE
async function loadReader() {
    const articleBody = document.getElementById('article-body');
    if (!articleBody) return;
    
    const id = getQueryParam('id');
    const loader = document.getElementById('loader');
    const content = document.getElementById('content-wrapper');

    if (!id) { loader.innerHTML = "<div class='font-bold text-red-600'>ERROR: NO ID</div>"; return; }

    try {
        const data = await fetchCloudData();
        const story = data.find(item => item.id === id);

        if (!story) { loader.innerHTML = "<div class='font-bold text-red-600'>404: NOT FOUND</div>"; return; }

        // INJECT DATA
        document.getElementById('meta-genre').innerText = `// ${story.genre}`;
        document.getElementById('meta-date').innerText = story.date;
        document.getElementById('meta-author').innerHTML = story.author;
        document.getElementById('article-title').innerHTML = story.title;
        document.getElementById('article-body').innerHTML = story.body;
        document.title = `PALER ECRITE | ${story.title}`;

        // --- POETRY DETECTION LOGIC ---
        // Checks if "POETRY" is anywhere in the genre text
        if (story.genre.toLowerCase().includes('poetry')) {
            articleBody.classList.add('poetry-mode');
        } else {
            articleBody.classList.remove('poetry-mode');
        }
        // ------------------------------

        // REVEAL PAGE
        loader.style.display = 'none';
        content.style.opacity = 1;
        if(window.ScrollTrigger) ScrollTrigger.refresh();

    } catch (error) { 
        console.error(error);
        loader.innerHTML = "<div class='font-bold text-red-600'>CONNECTION FAILED</div>";
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadHomeGrid();
    loadArchive();
    loadReader();
});