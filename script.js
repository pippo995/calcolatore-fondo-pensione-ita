const inputForm = document.getElementById('input-form');
const outputDiv = document.getElementById('output-div');

let csvContent = "data:text/csv;charset=utf-8,";

function updateResults() {

    const etaInizio = parseInt(document.getElementById('etaInizio').value);
    const durata = parseInt(document.getElementById('durata').value);
    const investireDeduzioni = (document.querySelector('input[name="investireDeduzioni"]:checked').value === "Si")
    const primaRal = parseFloat(document.getElementById('primaRal').value);
    const tipoAumentoRal = (document.querySelector('input[name="tipoAumentoRal"]:checked').value === "%")
    const freqAumentoRal = parseFloat(document.getElementById('freqAumentoRal').value);
    const aumentoRal = parseFloat(document.getElementById('aumentoRal').value);
    const primoInvestimento = parseFloat(document.getElementById('primoInvestimento').value);
    const tipoAumentoInvestimento = (document.querySelector('input[name="tipoAumentoInvestimento"]:checked').value === "%")
    const freqAumentoInvestimento = parseFloat(document.getElementById('freqAumentoInvestimento').value);
    const aumentoInvestimento = parseFloat(document.getElementById('aumentoInvestimento').value);
    const contribuzioneDatoreFpPerc = parseFloat(document.getElementById('contribuzioneDatoreFpPerc').value) / 100;
    const rendimentoAnnualeFpPerc = parseFloat(document.getElementById('rendimentoAnnualeFpPerc').value) / 100;
    const rendimentoAnnualePacPerc = parseFloat(document.getElementById('rendimentoAnnualePacPerc').value) / 100;
    const limiteDeduzioneFp = 5164;

    const mapFattoreMesiInvestiti = {
        'Mensile': 11/24,
        'Bimestrale': 10/24,
        'Trimestrale': 9/24,
        'Quadrimestrale': 8/24,
        'Semestrale': 6/24,
        'Annuale': 0
    };

    const fattoreMesiInvestiti = mapFattoreMesiInvestiti[document.getElementById('frequenzaDiCarico').value]

    let ral = primaRal
    let investimentoAnnuale = primoInvestimento
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

        if ((i + 1) % freqAumentoRal == 0 && i != 0) {
            if (tipoAumentoRal) {
                ral = ral + Math.floor(ral * aumentoRal / 100)
            } 
            else{
                ral = ral + aumentoRal
            }
        }

        const contribuzioneDatoreFp = Math.floor(ral * contribuzioneDatoreFpPerc);
        const ralConContribuzione = ral + contribuzioneDatoreFp;
        const tassazioneVersamentiFp = Math.max((15 - Math.max(i + 1 - 15, 0) * 0.3), 9).toFixed(2)

        if ((i + 1) % freqAumentoInvestimento == 0 && i != 0) {
            if (tipoAumentoInvestimento) {
                investimentoAnnuale = investimentoAnnuale + Math.floor(investimentoAnnuale * aumentoInvestimento / 100)
            } 
            else{
                investimentoAnnuale = investimentoAnnuale + aumentoInvestimento
            }
        }

        const investimentoAnnualeConDed = investimentoAnnuale + deduzione_1;
        const investimentoAnnualeConContribuzione = investimentoAnnuale + contribuzioneDatoreFp;
        const imposta = calcolaImposta(ralConContribuzione);
        const ralConContribuzioneDedotta = Math.max(ralConContribuzione - Math.min(investimentoAnnualeConContribuzione, limiteDeduzioneFp), 0);
        const ralConContribuzioneDedotta_1 = Math.max(ralConContribuzione - Math.min(investimentoAnnualeConContribuzione + deduzione_1, limiteDeduzioneFp), 0);
        const impostaRidotta = calcolaImposta(ralConContribuzioneDedotta);
        const impostaRidotta_1 = calcolaImposta(ralConContribuzioneDedotta_1);
        const investimentoAnnuale_1 = investireDeduzioni ? (investimentoAnnualeConContribuzione + deduzione_1) : investimentoAnnualeConContribuzione;
        const investimentoEntroDeduzione_1 = Math.min(investimentoAnnuale_1, limiteDeduzioneFp)
        const investimentoOltreDeduzione_1 = investimentoAnnuale_1 - investimentoEntroDeduzione_1
        const deduzione = deduzione_1;
        deduzione_1 = investireDeduzioni ? imposta - impostaRidotta_1 : imposta - impostaRidotta;
        fpVersamenti = fpVersamenti + investimentoAnnuale_1;
        fpMontante = fpMontante + Math.floor(fpMontante * rendimentoAnnualeFpPerc) + investimentoAnnuale_1 + Math.floor((investimentoAnnuale_1) * rendimentoAnnualeFpPerc * fattoreMesiInvestiti);
        const fpExit = (fpMontante - Math.floor(fpVersamenti * tassazioneVersamentiFp / 100));
        fpVersamentiEd = fpVersamentiEd + investimentoEntroDeduzione_1;
        fpMontanteEd = fpMontanteEd + Math.floor(fpMontanteEd * rendimentoAnnualeFpPerc) + investimentoEntroDeduzione_1 + Math.floor((investimentoEntroDeduzione_1) * rendimentoAnnualeFpPerc * fattoreMesiInvestiti);
        pacVersamentiOd = pacVersamentiOd + investimentoOltreDeduzione_1;
        pacMontanteOd = pacMontanteOd + Math.floor(pacMontanteOd * rendimentoAnnualePacPerc) + investimentoOltreDeduzione_1 + Math.floor(investimentoOltreDeduzione_1 * rendimentoAnnualePacPerc * fattoreMesiInvestiti);
        const fpPacExit = (fpMontanteEd - Math.floor(fpVersamentiEd * tassazioneVersamentiFp / 100)) + (pacMontanteOd - Math.floor((pacMontanteOd - pacVersamentiOd) * 0.26));
        
        pacVersamenti = pacVersamenti + investimentoAnnuale;
        pacMontante = pacMontante + Math.floor(pacMontante * rendimentoAnnualePacPerc) + investimentoAnnuale + Math.floor(investimentoAnnuale * rendimentoAnnualePacPerc * fattoreMesiInvestiti);
        const pacExit = pacMontante - Math.floor((pacMontante - pacVersamenti) * 0.26);
        
        const row = {
            "Età": eta + 1,
            "Durata": i + 1,
            "Reddito Ded.": formatNumberWithCommas(ral),
            "Investimento": formatNumberWithCommas(investimentoAnnuale),
            "Deduzione" :formatNumberWithCommas(deduzione),
            "FP: Exit": formatNumberWithCommas(fpExit),
            "FP Mix PAC: Exit": formatNumberWithCommas(fpPacExit),
            "PAC: Exit": formatNumberWithCommas(pacExit)
        }
        rows.push(row);   
    }

    csvContent = convertToCSV(rows);

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

function downloadCsv() {
    // Create a Blob from the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a download link and trigger it
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "data.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


document.addEventListener('DOMContentLoaded', updateResults);
inputForm.addEventListener('input', updateResults);
document.getElementById("downloadCsv").addEventListener("click", downloadCsv)

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
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
}

function convertToCSV(rows) {
    let str = '';

    // Add CSV headers
    let headers = Object.keys(rows[0]).join(',');
    str += headers + '\r\n';

    // Add CSV rows
    for (let i = 0; i < rows.length; i++) {
        let line = '';
        for (let index in rows[i]) {
            if (line !== '') line += ',';
            line += rows[i][index];
        }
        str += line + '\r\n';
    }
    return str;
}


