/**
 * Calcolatore Investimenti Finanziari - Scripts
 * Versione con sidebar riprogettata
 */

document.addEventListener('DOMContentLoaded', function() {
    // Calcola il numero di colonne nella tabella per il corretto dimensionamento
    document.documentElement.style.setProperty('--total-columns', '10');
    
    // Gestione delle sezioni collassabili nella sidebar
    setupCollapsibleSections();
    
    // Gestione della sidebar
    setupSidebar();
    
    // Gestione dei tab
    setupTabs();
    
    // Gestione dello scrolling
    setupScrolling();
    
    // Sincronizzazione dei controlli rapidi
    setupQuickControls();
});

/**
 * Configura il comportamento delle sezioni collassabili nella sidebar
 */
function setupCollapsibleSections() {
    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', function() {
            this.parentElement.classList.toggle('collapsed');
            updateSectionIcon(this);
        });
    });
}

/**
 * Aggiorna l'icona della sezione quando viene espansa o collassata
 */
function updateSectionIcon(header) {
    const icon = header.querySelector('.section-icon');
    if (header.parentElement.classList.contains('collapsed')) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-right');
    } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-down');
    }
}

/**
 * Configura il comportamento della sidebar riprogettata
 */
function setupSidebar() {
    // Apertura sidebar
    document.getElementById('toggle-sidebar').addEventListener('click', function() {
        openSidebar();
    });
    
    // Chiusura sidebar con il pulsante
    document.getElementById('close-sidebar').addEventListener('click', function() {
        closeSidebar();
    });
    
    // Chiusura sidebar cliccando sull'overlay
    document.getElementById('sidebar-overlay').addEventListener('click', function() {
        closeSidebar();
    });

    // Gestione del tap su elementi sidebaar nel mobile (per evitare che il tap chiuda la sidebar)
    document.querySelector('.sidebar').addEventListener('click', function(e) {
        e.stopPropagation(); // Evita che i click nella sidebar arrivino all'overlay
    });
}

/**
 * Apre la sidebar e mostra l'overlay
 */
function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('sidebar-active');
    document.body.style.overflow = 'hidden'; // Blocca lo scrolling del body quando la sidebar è aperta
}

/**
 * Chiude la sidebar e nasconde l'overlay
 */
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('sidebar-active');
    document.body.style.overflow = ''; // Ripristina lo scrolling del body
}

/**
 * Configura i tab per navigare tra le sezioni
 */
function setupTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Rimuovi la classe active da tutti i tab
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            // Aggiungi la classe active al tab cliccato
            this.classList.add('active');
            
            // Nascondi tutti i contenuti
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            // Mostra il contenuto corrispondente
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
}

/**
 * Configura lo scrolling fluido per i link della documentazione e il pulsante "Torna in alto"
 */
function setupScrolling() {
    // Scrolling fluido per i link della documentazione
    document.querySelectorAll('.docs-nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 20,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Pulsante "Torna in alto"
    const goToTopButton = document.getElementById('go-to-top');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            goToTopButton.classList.add('visible');
        } else {
            goToTopButton.classList.remove('visible');
        }
    });
    
    goToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Configura la sincronizzazione tra i controlli rapidi e gli input nel form
 */
function setupQuickControls() {
    // Sincronizzazione dal controllo rapido al form
    document.getElementById('quick-durata').addEventListener('change', function() {
        document.getElementById('durata').value = this.value;
        // Trigger the input event to update the results
        const event = new Event('input', { bubbles: true });
        document.getElementById('durata').dispatchEvent(event);
    });
    
    document.getElementById('quick-inflazione').addEventListener('change', function() {
        document.getElementById('inflazione').value = this.value;
        // Trigger the input event to update the results
        const event = new Event('input', { bubbles: true });
        document.getElementById('inflazione').dispatchEvent(event);
    });
    
    // Sincronizzazione dal form ai controlli rapidi
    document.getElementById('durata').addEventListener('change', function() {
        document.getElementById('quick-durata').value = this.value;
    });
    
    document.getElementById('inflazione').addEventListener('change', function() {
        document.getElementById('quick-inflazione').value = this.value;
    });
}

/**
 * Funzione ausiliaria per creare un evento di download del CSV
 * Nota: questa funzione verrà chiamata dal modulo app.js
 */
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Crea un URL per il Blob
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    
    // Simula il click sul link per avviare il download
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}