// De toolkaarten staan statisch in index.html (gegenereerd door build_cards.py
// vanuit data.json — gesynchroniseerd met de centrale affiliate-database via
// GitHub Actions). Dit script filtert alleen nog de bestaande DOM: geen
// runtime-fetch meer nodig, dus de site werkt ook zonder JavaScript en is
// volledig indexeerbaar.

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

// Zoek × categorie: substring-match op naam (h3) + beschrijving (p) + categorie.
let _cat = 'All', _q = '', _bundle = null;
const BUNDLES = {
 solo:{label:'Solopreneur Toolkit',desc:'Everything a one-person business needs to run lean — CRM, tasks, email and decks.',tools:['folk','Todoist','Fastmail','Gamma']},
 finance:{label:'Finance Stack',desc:'Get paid, pay vendors, run payroll and control spend.',tools:['Payoneer','Melio','Gusto','Navan']},
 devai:{label:'Dev & AI Stack',desc:'Build, host and automate with AI as your co-pilot.',tools:['Replit','Dify','RunPod','Browse.ai']}
};
// 25 sep 2026 (R25-04, gemeten): innerText forceert een layout; in de lus met
// style.display-writes gaf dat 145 ms per toetsaanslag op MSS. textContent + cache.
function _cardName(card){if(card._naam===undefined)card._naam=((card.querySelector('h3')||{}).textContent||'').trim();return card._naam;}
function _cardMatch(card) {
    const base = _bundle ? (BUNDLES[_bundle].tools.indexOf(_cardName(card)) >= 0)
                         : (_cat === 'All' || card.dataset.category === _cat);
    if (!base) return false;
    if (!_q) return true;
    if (card._zoek === undefined)
        card._zoek = (_cardName(card) + ' ' + ((card.querySelector('p') || {}).textContent || '') + ' ' +
                      (card.dataset.category || '')).toLowerCase().replace(/\s+/g, ' ');
    return _q.split(/\s+/).every(w => card._zoek.indexOf(w) >= 0);
}
function selectBundle(key){
    _bundle = (_bundle === key) ? null : key;
    if (_bundle) _cat = 'All';
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.toggle('active', !_bundle && b.innerText === 'All Tools'));
    document.querySelectorAll('.bundle-btn').forEach(b => {
        const on = !!_bundle && b.dataset.bundle === _bundle;
        b.classList.toggle('bg-indigo-600', on); b.classList.toggle('text-white', on); b.classList.toggle('border-indigo-500', on);
    });
    const info = _bundle ? BUNDLES[_bundle] : categoryInfo['All'];
    const t = document.getElementById('category-title'), d = document.getElementById('category-desc');
    if (t) t.innerText = info.label || info.title;
    if (d) d.innerText = info.desc;
    applyGrid();
    if (typeof gtag === 'function') gtag('event', 'bundle_select', { bundle: _bundle || 'cleared' });
}
function applyGrid() {
    const grid = document.getElementById('marketplace-grid');
    if (!grid) return;
    let total = 0;
    const kaarten = grid.querySelectorAll('.tool-card');
    const uit = Array.prototype.map.call(kaarten, _cardMatch);   // eerst alles lezen ...
    kaarten.forEach((card, i) => {                                // ... dan alles schrijven
        const d = uit[i] ? '' : 'none';
        if (card.style.display !== d) card.style.display = d;
        if (uit[i]) total++;
    });
    let nr = document.getElementById('osm-no-results');
    if (!nr) {
        nr = document.createElement('div');
        nr.id = 'osm-no-results';
        nr.className = 'col-span-full text-center text-slate-500 py-8';
        nr.textContent = 'No tools match your search.';
        grid.appendChild(nr);
    }
    nr.style.display = total ? 'none' : '';
}
function searchTools(q) { _q = (q || '').trim().toLowerCase(); applyGrid(); }

document.addEventListener("DOMContentLoaded", () => {
    // Alleen op de directorypagina: op een review, hub of tool bestaan de
    // kaartengrid en de no-results-melding niet, en dan gooit filterTools
    // vier keer 'null.style'.
    if (!document.querySelector('article.tool-card, .tool-card')) return;
    // Diepe link zoals /#Growth%20%26%20Revenue direct openen
    const fromHash = decodeURIComponent(window.location.hash.slice(1));
    filterTools(categoryInfo[fromHash] ? fromHash : 'All', false);
});

function filterTools(category, updateHash = true) {
    _bundle = null;
    document.querySelectorAll('.bundle-btn').forEach(b => b.classList.remove('bg-indigo-600','text-white','border-indigo-500'));
    // 1. Actieve knop bijwerken
    document.querySelectorAll('.cat-btn').forEach(btn => {
        if (btn.innerText === category || (category === 'All' && btn.innerText === 'All Tools')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 2. Dynamische infokaart bijwerken
    const cardElement = document.getElementById('category-info-card');
    const titleElement = document.getElementById('category-title');
    const descElement = document.getElementById('category-desc');

    cardElement.style.opacity = 0;
    setTimeout(() => {
        const info = categoryInfo[category] || categoryInfo['All'];
        if (titleElement) titleElement.innerText = info.title;
        if (descElement) descElement.innerText = info.desc;
        cardElement.style.opacity = 1;
    }, 150);

    // 3. Categorie-state + grid toepassen (zoekterm × categorie)
    _cat = category;
    applyGrid();

    // 4. Categorie deelbaar maken via de URL-hash
    if (updateHash) {
        history.replaceState(null, '', category === 'All' ? '#' : '#' + encodeURIComponent(category));
    }
}

// --- infokaart: alleen tonen als er iets gekozen is (4 sep 2026) ---
// In de openingsstand ('All', geen stack) zei de kaart 'Browsing the full
// collection' -- een doos van 128px die niets toevoegt boven de resultaten.
// En zonder eigen regel viel een categorie terug op de All-tekst, dus
// 'Security' las als 'Explore All Tools'. Beide zijn hier dichtgezet.
const _extraInfo = {
    "Business Operations": { title: "Business Operations", desc: "The back office nobody budgets for: contracts, compliance, procurement and the admin that only gets attention once it breaks." },
    "Finance": { title: "Finance", desc: "Money tools, plainly priced. What the entry tier actually covers, and where the meter starts running once you grow." },
    "Finance & Accounting": { title: "Finance & Accounting", desc: "Bookkeeping, invoicing and filing. We check what the base plan includes before the per-transaction fees get added on top." },
    "Financial Operations": { title: "Financial Operations", desc: "Keep the numbers straight and the cash moving: accounting, payroll, spend control and invoicing, with the real cost per seat spelled out." },
    "HR & People": { title: "HR & People", desc: "Hiring, onboarding, payroll and time tracking. Priced per employee almost everywhere, so we show what a team of ten actually pays." },
    "IT & Productivity": { title: "IT & Productivity", desc: "The silent backbone: security, cloud storage, hosting, password management and the AI infrastructure sitting underneath it all." },
    "Operations & Workflow": { title: "Operations & Workflow", desc: "Keep the chaos at bay: project management, collaboration, documents and the SOPs that stop the work living in one person's head." },
    "Productivity": { title: "Productivity", desc: "Small tools that take the friction out of a working day, and are honest about which features sit behind the next tier up." },
    "Project Management": { title: "Project Management", desc: "Plans, boards and deadlines. Watch the seat count here: this is the category where the bill grows fastest as the team does." },
    "Security": { title: "Security", desc: "Endpoint protection, background checks and access control. Priced per seat or per device, and we note which, because it changes the sum." }
};
Object.keys(_extraInfo).forEach(k => { if (!categoryInfo[k]) categoryInfo[k] = _extraInfo[k]; });

function _toonInfokaart(category) {
    const wrap = document.getElementById('category-info-wrap');
    if (!wrap) return;
    const leeg = !_bundle && (!category || category === 'All');
    wrap.style.display = leeg ? 'none' : '';
}

const _filterTools = filterTools, _selectBundle = selectBundle;
window.filterTools = function (category, updateHash = true) {
    _filterTools(category, updateHash);
    _toonInfokaart(category);
};
window.selectBundle = function (key) {
    _selectBundle(key);
    _toonInfokaart(_cat);
};
document.addEventListener('DOMContentLoaded', () => _toonInfokaart(_cat));
