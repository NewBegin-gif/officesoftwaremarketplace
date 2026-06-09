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

    grid.innerHTML = data.map(item => `
        <div class="group bg-slate-900/30 p-6 rounded-xl border border-slate-800 hover:border-indigo-500 hover:bg-slate-900/60 transition-all duration-300 flex flex-col h-full">
            <span class="text-[10px] uppercase font-mono tracking-widest text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/20 self-start mb-4">
                ${item.category}
            </span>
            <h3 class="font-bold text-xl text-white group-hover:text-indigo-400 transition-colors mb-2">${item.name}</h3>
            <p class="text-sm text-slate-400 leading-relaxed mb-6 flex-grow">${item.desc}</p>
            <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-slate-300 hover:text-white flex items-center gap-1 mt-auto border-t border-slate-800 pt-4">
                Visit Provider <span>&rarr;</span>
            </a>
        </div>
    `).join('');
}
