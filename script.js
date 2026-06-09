let allData = [];

// Vlotte, menselijke omschrijvingen per categorie
const categoryInfo = {
    'All': {
        title: "Explore All Tools",
        desc: "Browsing the full collection. From accounting platforms to AI-driven design tools, explore every piece of software we've handpicked to scale your business."
    },
    'Financial Operations': {
        title: "Financial Operations",
        desc: "Keep your numbers straight and your cash flowing. Dive into top-tier tools for accounting, automated payroll, tax compliance, and seamless invoicing."
    },
    'Growth & Revenue': {
        title: "Growth & Revenue",
        desc: "The engines that drive your business forward. Discover powerful platforms for marketing automation, sales outreach, CRM, and social media management."
    },
    'Operations & Workflow': {
        title: "Operations & Workflow",
        desc: "Keep the chaos at bay. We've highlighted the best software for project management, team collaboration, document creation, and building solid SOPs."
    },
    'Communication & Voice': {
        title: "Communication & Voice",
        desc: "Connect clearly and professionally. Explore modern solutions for business VoIP, smart call centers, live chat, and autonomous AI voice assistants."
    },
    'IT & Productivity': {
        title: "IT & Productivity",
        desc: "The silent backbone of your daily operations. Equip your team with essential tools for cybersecurity, cloud storage, web hosting, and advanced AI infrastructure."
    }
};

// Fetch the data on page load from the CENTRAL GITHUB REPO
document.addEventListener("DOMContentLoaded", () => {
    fetch('https://raw.githubusercontent.com/NewBegin-gif/affiliate-database/refs/heads/main/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            allData = data;
            filterTools('All'); // Initialize with 'All' filter
        })
        .catch(error => console.error('Error loading central directory data:', error));
});

function filterTools(category) {
    // 1. Update active button styling
    const buttons = document.querySelectorAll('.cat-btn');
    buttons.forEach(btn => {
        if(btn.innerText === category || (category === 'All' && btn.innerText === 'All Tools')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 2. Update the dynamic info card
    const cardElement = document.getElementById('category-info-card');
    const titleElement = document.getElementById('category-title');
    const descElement = document.getElementById('category-desc');
    
    cardElement.style.opacity = 0; // fade out effect
    
    setTimeout(() => {
        const info = categoryInfo[category] || categoryInfo['All'];
        titleElement.innerText = info.title;
        descElement.innerText = info.desc;
        cardElement.style.opacity = 1; // fade in effect
    }, 150);

    // 3. Filter logic
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
                    <span class="text-[10px] uppercase font-mono tracking-widest text-indigo-400 bg-indigo-950/40 px-2.5 py-1 rounded border border-indigo-900/30 text-right max-w-[60%]">
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
