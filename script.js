let allData = [];

// Fetch the data on page load
document.addEventListener("DOMContentLoaded", () => {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            allData = data;
            render(data);
        })
        .catch(error => console.error('Error loading directory data:', error));
});

function filterTools(category) {
    // Update active button styling
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach(btn => {
        if(btn.innerText === category || (category === 'All' && btn.innerText === 'All Tools')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Filter logic
    if (category === 'All') {
        render(allData);
    } else {
        const filteredData = allData.filter(item => item.category === category);
        render(filteredData);
    }
}

function render(data) {
    const grid = document.getElementById('marketplace-grid');
    
    // Sort alphabetically by name
    data.sort((a, b) => a.name.localeCompare(b.name));

    grid.innerHTML = data.map(item => {
        // Construct the logo URL using Google's favicon service
        const logoUrl = item.domain 
            ? `https://www.google.com/s2/favicons?domain=${item.domain}&sz=128` 
            : 'https://www.google.com/s2/favicons?domain=example.com&sz=128'; // Fallback

        return `
            <div class="group bg-slate-900/40 p-6 rounded-xl border border-slate-800 hover:border-indigo-500 hover:bg-slate-900/70 transition-all duration-300 flex flex-col h-full shadow-lg shadow-black/20">
                
                <div class="flex items-start justify-between mb-5">
                    <div class="w-12 h-12 rounded-lg bg-white p-1.5 border border-slate-700 shadow-sm flex items-center justify-center overflow-hidden">
                        <img src="${logoUrl}" alt="${item.name} logo" class="w-full h-full object-contain" loading="lazy">
                    </div>
                    <span class="text-[10px] uppercase font-mono tracking-widest text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded border border-indigo-900/30">
                        ${item.category}
                    </span>
                </div>

                <h3 class="font-bold text-xl text-white group-hover:text-indigo-400 transition-colors mb-3">${item.name}</h3>
                <p class="text-sm text-slate-400 leading-relaxed mb-6 flex-grow">${item.desc}</p>
                
                <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-slate-300 hover:text-white flex items-center justify-between w-full mt-auto border-t border-slate-800/60 pt-4 group/link">
                    <span>View Software</span>
                    <span class="text-indigo-500 group-hover/link:translate-x-1 transition-transform">&rarr;</span>
                </a>
            </div>
        `;
    }).join('');
}
