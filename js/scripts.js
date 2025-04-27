/**
 * Calcolatore Fondo Pensione - Scripts
 * Versione moderna e reattiva
 */

document.addEventListener('DOMContentLoaded', function() {
    // Imposta il numero di colonne per il corretto dimensionamento
    document.documentElement.style.setProperty('--total-columns', '10');
    
    // Inizializza tutti i componenti dell'interfaccia
    initCollapsibleSections();
    initSidebar();
    initTabs();
    initScrolling();
    initQuickControls();
    
    // Aggiungi animazioni al caricamento della pagina
    animatePageLoad();
});

/**
 * Configura il comportamento delle sezioni collassabili nella sidebar
 */
function initCollapsibleSections() {
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
 * Configura il comportamento della sidebar
 */
function initSidebar() {
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

    // Prevenire che i click nella sidebar chiudano il menu
    document.querySelector('.sidebar').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Gestione tasto escape per chiudere la sidebar
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.querySelector('.sidebar').classList.contains('active')) {
            closeSidebar();
        }
    });
}

/**
 * Apre la sidebar e mostra l'overlay con animazione
 */
function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    // Attiva l'overlay per primo (migliora l'esperienza visiva)
    overlay.classList.add('active');
    
    // Piccolo ritardo per migliorare l'animazione
    setTimeout(() => {
        sidebar.classList.add('active');
        document.body.classList.add('sidebar-active');
        document.body.style.overflow = 'hidden'; // Blocca lo scrolling del body
    }, 50);
}

/**
 * Chiude la sidebar e nasconde l'overlay con animazione
 */
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    sidebar.classList.remove('active');
    
    // Piccolo ritardo prima di rimuovere l'overlay (migliora l'esperienza visiva)
    setTimeout(() => {
        overlay.classList.remove('active');
        document.body.classList.remove('sidebar-active');
        document.body.style.overflow = ''; // Ripristina lo scrolling del body
    }, 300); // Corrisponde alla durata dell'animazione della sidebar
}

/**
 * Configura i tab per navigare tra le sezioni
 */
function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Rimuovi la classe active da tutti i tab
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            // Aggiungi la classe active al tab cliccato
            this.classList.add('active');
            
            // Nascondi tutti i contenuti
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            // Mostra il contenuto corrispondente con animazione
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(`${tabId}-content`);
            
            // Trigger reflow for animation
            void tabContent.offsetWidth;
            
            tabContent.classList.add('active');
        });
    });
}

/**
 * Configura lo scrolling fluido per i link della documentazione e il pulsante "Torna in alto"
 */
function initScrolling() {
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
                
                // Evidenzia visivamente la sezione cliccata
                document.querySelectorAll('.docs-nav a').forEach(a => a.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Pulsante "Torna in alto" con controllo visibilità
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
function initQuickControls() {
    // Sincronizzazione dai controlli rapidi al form
    document.getElementById('quick-durata').addEventListener('input', function() {
        document.getElementById('durata').value = this.value;
        
        // Trigger the input event to update the results
        const event = new Event('input', { bubbles: true });
        document.getElementById('durata').dispatchEvent(event);
    });
    
    document.getElementById('quick-inflazione').addEventListener('input', function() {
        document.getElementById('inflazione').value = this.value;
        
        // Trigger the input event to update the results
        const event = new Event('input', { bubbles: true });
        document.getElementById('inflazione').dispatchEvent(event);
    });
    
    // Sincronizzazione dal form ai controlli rapidi
    document.getElementById('durata').addEventListener('input', function() {
        document.getElementById('quick-durata').value = this.value;
    });
    
    document.getElementById('inflazione').addEventListener('input', function() {
        document.getElementById('quick-inflazione').value = this.value;
    });
}

/**
 * Aggiunge animazioni di ingresso agli elementi al caricamento della pagina
 */
function animatePageLoad() {
    // Aggiungi una classe per animare gli elementi principali
    document.querySelectorAll('.card, .tabs, .button-container').forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('animated');
        }, 100 * index);
    });
}

/**
 * Funzione ausiliaria per creare un evento di download del CSV
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