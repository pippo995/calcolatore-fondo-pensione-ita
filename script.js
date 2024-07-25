const inputForm = document.getElementById('input-form');
const outputDiv = document.getElementById('output-div');

function updateResults() {

    const etaInizio = parseInt(document.getElementById('etaInizio').value);
    const durata = parseInt(document.getElementById('durata').value);
    const primaRal = parseFloat(document.getElementById('primaRal').value);
    const aumentoRal = parseFloat(document.getElementById('aumentoRal').value);
    const primoInvestimentoAnnuale = parseFloat(document.getElementById('primoInvestimentoAnnuale').value);
    const aumentoInvestimentoAnnuale = parseFloat(document.getElementById('aumentoInvestimentoAnnuale').value);
    const contribuzioneDatoreFpPerc = parseFloat(document.getElementById('contribuzioneDatoreFpPerc').value) / 100;
    const rendimentoAnnualeFpPerc = parseFloat(document.getElementById('rendimentoAnnualeFpPerc').value) / 100;
    const rendimentoAnnualePacPerc = parseFloat(document.getElementById('rendimentoAnnualePacPerc').value) / 100;

    const mapFattoreMesiInvestiti = {
        'Mensile': 11/24,
        'Bimensile': 10/24,
        'Trimestrale': 9/24,
        'Quadrimestrale': 8/24,
        'Semestrale': 6/24,
        'Annuale': 0
    };
    console.log(document.getElementById('frequenzaDiCarico').value)
    const fattoreMesiInvestiti = mapFattoreMesiInvestiti[document.getElementById('frequenzaDiCarico').value]

    const limiteDeduzione = 5164;

    let deduzione_1 = 0;
    let fpVersamenti = 0;
    let fpMontante = 0
    let fpVersamentiEd = 0;
    let fpMontanteEd = 0;
    let pacVersamentiOd = 0;
    let pacMontanteOd = 0;
    let pacVersamenti = 0;
    let pacMontante = 0;

    const rows = [];    

    for (let i = 0; i < durata; i++) {
        
        const eta = etaInizio + i;
        const ral = primaRal + aumentoRal * Math.floor((i + 1) / 5);
        const investimentoAnnuale = primoInvestimentoAnnuale + aumentoInvestimentoAnnuale * Math.floor((i + 1) / 5);
        const imposta = calcolaImposta(ral);
        const ralDedotta = Math.max(ral - Math.min(investimentoAnnuale, limiteDeduzione), 0);
        const ralDedotta_1 = Math.max(ral - Math.min(investimentoAnnuale + deduzione_1, limiteDeduzione), 0);
        const impostaRidotta = calcolaImposta(ralDedotta);
        const impostaRidotta_1 = calcolaImposta(ralDedotta_1);
        const deduzione = imposta - impostaRidotta;
        const investimentoEntroDeduzione = Math.min(investimentoAnnuale, limiteDeduzione)
        const investimentoOltreDeduzione = investimentoAnnuale - investimentoEntroDeduzione
        const investimentoAnnuale_1 = investimentoAnnuale + deduzione_1;
        const investimentoEntroDeduzione_1 = Math.min(investimentoAnnuale_1, limiteDeduzione)
        const investimentoOltreDeduzione_1 = investimentoAnnuale_1 - investimentoEntroDeduzione_1
        deduzione_1 = imposta - impostaRidotta_1;
        const contribuzioneDatoreFp = Math.floor(ral * contribuzioneDatoreFpPerc);
        const tassazioneVersamentiFp = Math.max((15 - Math.max(i + 1 - 15, 0) * 0.3), 9).toFixed(2)
        fpVersamenti = fpVersamenti + investimentoAnnuale_1 + contribuzioneDatoreFp;
        fpMontante = fpMontante + Math.floor(fpMontante * rendimentoAnnualeFpPerc) + investimentoAnnuale_1 + contribuzioneDatoreFp + Math.floor((investimentoAnnuale_1 + contribuzioneDatoreFp) * rendimentoAnnualeFpPerc * fattoreMesiInvestiti);
        const fpExit = (fpMontante - Math.floor(fpVersamenti * tassazioneVersamentiFp / 100));
        fpVersamentiEd = fpVersamentiEd + investimentoEntroDeduzione_1 + contribuzioneDatoreFp;
        fpMontanteEd = fpMontanteEd + Math.floor(fpMontanteEd * rendimentoAnnualeFpPerc) + investimentoEntroDeduzione_1 + contribuzioneDatoreFp + Math.floor((investimentoEntroDeduzione_1 + contribuzioneDatoreFp) * rendimentoAnnualeFpPerc * fattoreMesiInvestiti);
        pacVersamentiOd = pacVersamentiOd + investimentoOltreDeduzione_1;
        pacMontanteOd = pacMontanteOd + Math.floor(pacMontanteOd * rendimentoAnnualePacPerc) + investimentoOltreDeduzione_1 + Math.floor(investimentoOltreDeduzione_1 * rendimentoAnnualePacPerc * fattoreMesiInvestiti);
        const fpPacExit = (fpMontanteEd - Math.floor(fpVersamentiEd * tassazioneVersamentiFp / 100)) + (pacMontanteOd - Math.floor((pacMontanteOd - pacVersamentiOd) * 0.26));
        pacVersamenti = pacVersamenti + investimentoAnnuale;
        pacMontante = pacMontante + Math.floor(pacMontante * rendimentoAnnualePacPerc) + investimentoAnnuale + Math.floor(investimentoAnnuale * rendimentoAnnualePacPerc * fattoreMesiInvestiti);
        const pacExit = pacMontante - Math.floor((pacMontante - pacVersamenti) * 0.26);
        
        const row = {
            "Età": eta + 1,
            "Durata": i + 1,
            "Ral": formatNumberWithCommas(ral) + " €",
            "Contrib. Datore Fp": formatNumberWithCommas(contribuzioneDatoreFp) + " €",
            "Tassazione Fp": tassazioneVersamentiFp + " %",
            "Investimento Annuale": formatNumberWithCommas(investimentoAnnuale) + " €",
            "Fp Exit": formatNumberWithCommas(fpExit) + " €",
            "Fp + Pac Exit": formatNumberWithCommas(fpPacExit) + " €",
            "Pac Exit": formatNumberWithCommas(pacExit) + " €"
        }
        rows.push(row);
    }


    const table = document.createElement('table');
    table.id = 'output-table';
    
    // Create thead element
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Create header cells
    for (const key in rows[0]) {
        const headerCell = document.createElement('th');
        headerCell.textContent = key;
        headerRow.appendChild(headerCell);
    }
    
    // Append header row to thead
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create tbody element
    const tbody = document.createElement('tbody');
    
    // Populate table rows
    rows.forEach(row => {
        const newRow = document.createElement('tr');
        for (const key in row) {
            const cell = document.createElement('td');
            cell.textContent = row[key];
            newRow.appendChild(cell);
        }
        tbody.appendChild(newRow);
    });
    
    // Append tbody to table
    table.appendChild(tbody);
    
    // Clear any existing content in outputDiv and append the new table
    while (outputDiv.firstChild) {
        outputDiv.removeChild(outputDiv.firstChild);
    }
    outputDiv.appendChild(table);    
}

document.addEventListener('DOMContentLoaded', updateResults);
inputForm.addEventListener('input', updateResults);

function calcolaImposta(RAL) {
    let imposta;
    if (RAL <= 28000) {
        imposta = RAL * 0.23;
    } else if (RAL <= 50000) {
        imposta = 28000 * 0.23 + (RAL - 28000) * 0.35;
    } else {
        imposta = 28000 * 0.23 + 22000 * 0.35 + (RAL - 50000) * 0.43;
    }
    return Math.floor(imposta)
}

function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}


