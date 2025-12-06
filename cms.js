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
        const recent = data.reverse().slice(0, 5); 

        recent.forEach((item) => {
            const html = `
            <div class="group relative border-t border-black py-8 md:py-12 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-white transition-colors duration-300 px-2 md:px-4 reveal cursor-pointer" 
                 onclick="window.location.href='read.html?id=${item.id}'"
                 data-cursor="READ">
                <h4 class="text-3xl md:text-6xl font-black uppercase md:group-hover:translate-x-4 transition-transform duration-300">${item.title}</h4>
                <div class="flex items-center justify-between w-full md:w-auto mt-4 md:mt-0 gap-4 md:gap-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                    <span class="font-mono text-[#ff3300] text-xs">${item.genre}</span>
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
        document.getElementById('meta-author').innerHTML = `
    <a href="profile.html?author=${encodeURIComponent(story.author)}" 
       class="hover:text-black hover: decoration-2 transition-colors cursor-pointer"
       data-cursor="DOSSIER">
       ${story.author}
    </a>
`;
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

// 4. AUTHORS PAGE (Fixed "Last Seen" Logic)
async function loadAuthors() {
    const grid = document.getElementById('authors-grid');
    if (!grid) return;

    try {
        const data = await fetchCloudData();
        grid.innerHTML = ''; 

        const authorsMap = {};
        
        // Loop through data (Oldest -> Newest)
        data.forEach(post => {
            const name = post.author.trim(); 
            const key = name.toUpperCase();
            
            if (authorsMap[key]) {
                // Author already exists: Update stats
                authorsMap[key].count++;
                authorsMap[key].lastActive = post.date; // <--- THE FIX: Always update to the latest date found
                authorsMap[key].genre = post.genre;     // Update genre to their latest obsession
            } else {
                // First time seeing author
                authorsMap[key] = {
                    displayName: name,
                    count: 1,
                    lastActive: post.date,
                    genre: post.genre 
                };
            }
        });

        const authorsArray = Object.keys(authorsMap).map(key => authorsMap[key]);
        const countDisplay = document.getElementById('agent-count');
        if(countDisplay) countDisplay.innerText = `ACTIVE AGENTS: ${authorsArray.length}`;

        authorsArray.forEach(agent => {
            let rank = "INITIATE";
            if(agent.count > 2) rank = "OPERATIVE";
            if(agent.count > 5) rank = "ARCHITECT";

            const html = `
            <div class="group bg-[#050505] p-8 md:p-12 relative overflow-hidden hover:bg-[#111] transition-colors duration-300 reveal cursor-pointer"
                 onclick="window.location.href='profile.html?author=${encodeURIComponent(agent.displayName)}'"
                 data-cursor="OPEN FILE">
                
                <div class="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] transition-opacity"></div>

                <div class="relative z-10 flex flex-col h-full justify-between gap-12">
                    <div>
                        <div class="flex justify-between items-start mb-4">
                            <span class="font-mono text-[10px] text-[#ff3300] border border-[#ff3300] px-1">CLASS: ${rank}</span>
                            <span class="font-mono text-[10px] text-gray-600">${agent.count} RECORD(S)</span>
                        </div>
                        <h2 class="text-3xl md:text-4xl font-black uppercase text-white leading-tight break-words group-hover:text-[#ff3300] transition-colors">
                            ${agent.displayName}
                        </h2>
                    </div>

                    <div class="border-t border-[#333] pt-4 mt-auto">
                        <div class="grid grid-cols-2 gap-4 text-[10px] font-mono font-bold text-gray-500 uppercase">
                            <div><span class="block text-[#444]">LAST SEEN</span><span>${agent.lastActive}</span></div>
                            <div><span class="block text-[#444]">SPECIALTY</span><span>${agent.genre}</span></div>
                        </div>
                    </div>
                </div>
            </div>
            `;
            grid.innerHTML += html;
        });

        if(window.ScrollTrigger) ScrollTrigger.refresh();
    } catch (e) { console.error(e); }
}

// 5. PROFILE PAGE (Fixed "Active Since" Date)
async function loadProfile() {
    const wrapper = document.getElementById('profile-wrapper');
    if (!wrapper) return;

    const urlParams = new URLSearchParams(window.location.search);
    const authorName = urlParams.get('author');

    if(!authorName) { window.location.href = 'authors.html'; return; }

    try {
        const data = await fetchCloudData();
        
        // Filter for this author
        const authorWork = data.filter(item => item.author.toUpperCase() === authorName.toUpperCase());
        
        if (authorWork.length === 0) {
             document.body.innerHTML = "<div class='flex h-screen items-center justify-center font-black'>SUBJECT UNKNOWN</div>";
             return;
        }

        // --- CALCULATE STATS ---
        
        // FIX: Index 0 is the oldest (First Sighting)
        // FIX: Last Index is the newest (Latest Crime)
        const firstPost = authorWork[0]; 
        const latestPost = authorWork[authorWork.length - 1];
        
        const totalPosts = authorWork.length;
        
        // Rank Logic
        let rank = "INITIATE";
        if(totalPosts > 2) rank = "OPERATIVE";
        if(totalPosts > 5) rank = "ARCHITECT";

        // --- INJECT IDENTITY ---
        document.getElementById('profile-name').innerText = authorName;
        document.getElementById('profile-rank').innerText = rank;
        
        // FIX: Display the oldest date here
        document.getElementById('stat-first').innerText = firstPost.date; 
        
        // Use their latest genre as their "Specialty"
        document.getElementById('stat-genre').innerText = latestPost.genre; 
        document.getElementById('stat-count').innerText = totalPosts;

        // --- GENERATE "BIO" ---
        const bioText = `
            Subject <strong>${authorName.toUpperCase()}</strong> has been active within the network since <strong>${firstPost.date}</strong>. 
            Known for distributing <strong>${totalPosts}</strong> subversive text(s), primarily categorized as <strong>${latestPost.genre.toUpperCase()}</strong>.
            Surveillance suggests high capability in narrative construction. Approach with caution.
        `;
        document.getElementById('generated-bio').innerHTML = bioText;

        // --- RENDER LIST (Newest First) ---
        const listContainer = document.getElementById('profile-list');
        // Reverse authorWork for the list so we see newest uploads at the top
        [...authorWork].reverse().forEach(item => {
            const html = `
            <div class="group border-b border-black py-8 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-white hover:px-4 transition-all duration-300 cursor-pointer"
                 onclick="window.location.href='read.html?id=${item.id}'"
                 data-cursor="READ">
                <h4 class="text-2xl md:text-4xl font-black uppercase text-[#050505]">${item.title}</h4>
                <div class="mt-2 md:mt-0 font-mono text-xs text-[#ff3300]">${item.date}</div>
            </div>
            `;
            listContainer.innerHTML += html;
        });

        // REVEAL
        wrapper.style.opacity = 1;

    } catch (e) { console.error(e); }
}

window.addEventListener('DOMContentLoaded', () => {
    loadHomeGrid();
    loadArchive();
    loadReader();
});