
let csvContent = "data:text/csv;charset=utf-8,";
let myChart;

document.addEventListener('DOMContentLoaded', updateResults);
document.getElementById('input-form').addEventListener('input', updateResults);
document.getElementById("downloadCsv").addEventListener("click", downloadCsv)

const limiteDeduzioneFp = 5164;
const mapFattoreMesiInvestiti = {
    'Mensile': 11 / 24,
    'Bimestrale': 10 / 24,
    'Trimestrale': 9 / 24,
    'Quadrimestrale': 8 / 24,
    'Semestrale': 6 / 24,
    'Annuale': 0
};

function updateResults() {

    const etaInizio = parseInt(document.getElementById('etaInizio').value);
    const durata = parseInt(document.getElementById('durata').value);
    const investireDeduzioni = (document.querySelector('input[name="investireDeduzioni"]:checked').value === "Si")
    const primoReddito = parseFloat(document.getElementById('reddito').value);
    const tipoAumentoReddito = (document.querySelector('input[name="tipoAumentoReddito"]:checked').value === "%")
    const freqAumentoReddito = parseFloat(document.getElementById('freqAumentoReddito').value);
    const aumentoReddito = parseFloat(document.getElementById('aumentoReddito').value);
    const primoInvestimento = parseFloat(document.getElementById('investimento').value);
    const tipoAumentoInvestimento = (document.querySelector('input[name="tipoAumentoInvestimento"]:checked').value === "%")
    const freqAumentoInvestimento = parseFloat(document.getElementById('freqAumentoInvestimento').value);
    const aumentoInvestimento = parseFloat(document.getElementById('aumentoInvestimento').value);
    const contribuzioneDatoreFpPerc = parseFloat(document.getElementById('contribuzioneDatoreFpPerc').value) / 100;
    const rendimentoAnnualeFpPerc = parseFloat(document.getElementById('rendimentoAnnualeFpPerc').value) / 100;
    const rendimentoAnnualePacPerc = parseFloat(document.getElementById('rendimentoAnnualePacPerc').value) / 100;
    const fattoreMesiInvestiti = mapFattoreMesiInvestiti[document.getElementById('frequenzaDiCarico').value]

    let reddito = primoReddito
    let investimento = primoInvestimento
    let deduzione = 0;
    let deduzione_1 = 0;

    let fpVersamenti = 0;
    let fpMontante = 0
    
    let pacVersamenti = 0;
    let pacMontante = 0;

    let fpVersamentiDed = 0;
    let fpMontanteDed = 0;
    let pacVersamentiDed = 0;
    let pacMontanteDed = 0;

    let fpVersamentiMax = 0;
    let fpMontanteMax = 0;
    let pacVersamentiMax = 0;
    let pacMontanteMax = 0;
    
    const results = [];
    const rows = [];

    for (let i = 0; i < durata; i++) {

        const eta = etaInizio + i;

        if ((i) % freqAumentoReddito == 0 && i != 0) {
            if (tipoAumentoReddito) {
                reddito = reddito + Math.floor(reddito * aumentoReddito / 100)
            }
            else {
                reddito = reddito + aumentoReddito
            }
        }

        if ((i + 1) % freqAumentoInvestimento == 0 && i != 0) {
            if (tipoAumentoInvestimento) {
                investimento = investimento + Math.floor(investimento * aumentoInvestimento / 100)
            }
            else {
                investimento = investimento + aumentoInvestimento
            }
        }
        
        const tassazioneVersamentiFp = Math.max((15 - Math.max(i + 1 - 15, 0) * 0.3), 9).toFixed(2)
        const contribuzioneDatoreFp = Math.floor(reddito * contribuzioneDatoreFpPerc);
        const redditoConContribuzione = reddito + contribuzioneDatoreFp;
        const investimentoConContribuzione = investimento + contribuzioneDatoreFp;
        const imposta = calcolaImposta(redditoConContribuzione);

        const redditoConContribuzioneDedotta = Math.max(redditoConContribuzione - Math.min(investimentoConContribuzione, limiteDeduzioneFp), 0);
        const impostaRidotta = calcolaImposta(redditoConContribuzioneDedotta);
        deduzione = imposta - impostaRidotta;

        const redditoConContribuzioneDedotta_1 = Math.max(redditoConContribuzione - Math.min(investimentoConContribuzione + deduzione_1, limiteDeduzioneFp), 0);
        const impostaRidotta_1 = calcolaImposta(redditoConContribuzioneDedotta_1);
        deduzione_1 = investireDeduzioni ? imposta - impostaRidotta_1 : deduzione;       
        
        const investimentoDed = investireDeduzioni ? (investimentoConContribuzione + deduzione_1) : investimentoConContribuzione;
        const investimentoEntroDeduzione = Math.min(investimentoDed, limiteDeduzioneFp)
        const investimentoOltreDeduzione = investimentoDed - investimentoEntroDeduzione

        //Solo FP
        fpVersamenti = fpVersamenti + investimentoDed;
        fpMontante = fpMontante + Math.floor(fpMontante * rendimentoAnnualeFpPerc) + investimentoDed + Math.floor((investimentoDed) * rendimentoAnnualeFpPerc * fattoreMesiInvestiti);
        const fpExit = (fpMontante - Math.floor(fpVersamenti * tassazioneVersamentiFp / 100));

        //Solo PAC
        pacVersamenti = pacVersamenti + investimento;
        pacMontante = pacMontante + Math.floor(pacMontante * rendimentoAnnualePacPerc) + investimento + Math.floor(investimento * rendimentoAnnualePacPerc * fattoreMesiInvestiti);
        const pacExit = pacMontante - Math.floor((pacMontante - pacVersamenti) * 0.26);

        //FP fino a limite deduzioni, poi PAC
        fpVersamentiDed = fpVersamentiDed + investimentoEntroDeduzione;
        fpMontanteDed = fpMontanteDed + Math.floor(fpMontanteDed * rendimentoAnnualeFpPerc) + investimentoEntroDeduzione + Math.floor(investimentoEntroDeduzione * rendimentoAnnualeFpPerc * fattoreMesiInvestiti);
        pacVersamentiDed = pacVersamentiDed + investimentoOltreDeduzione;
        pacMontanteDed = pacMontanteDed + Math.floor(pacMontanteDed * rendimentoAnnualePacPerc) + investimentoOltreDeduzione + Math.floor(investimentoOltreDeduzione * rendimentoAnnualePacPerc * fattoreMesiInvestiti);
        const fpPacExit = (fpMontanteDed - Math.floor(fpVersamentiDed * tassazioneVersamentiFp / 100)) + (pacMontanteDed - Math.floor((pacMontanteDed - pacVersamentiDed) * 0.26));

        //Rendimento massimo tra FP e PAC
        interesseCompostoFP = Math.floor(investimentoDed * ((1 + rendimentoAnnualeFpPerc) ** (durata - i)));
        interesseCompostoPAC = Math.floor(investimento * ((1 + rendimentoAnnualePacPerc) ** (durata - i)));
        if (interesseCompostoPAC > interesseCompostoFP) {
            fpVersamentiMax = fpVersamentiMax + 1;
            fpMontanteMax = fpMontanteMax + Math.floor(fpMontanteMax * rendimentoAnnualeFpPerc) + 1 + Math.floor(1 * rendimentoAnnualeFpPerc * fattoreMesiInvestiti);
            pacVersamentiMax = pacVersamentiMax + investimento - 1;
            pacMontanteMax = pacMontanteMax + Math.floor(pacMontanteMax * rendimentoAnnualePacPerc) + investimento - 1 + Math.floor(investimento * rendimentoAnnualePacPerc * fattoreMesiInvestiti);
        } 
        else {
            fpVersamentiMax = fpVersamentiMax + investimentoEntroDeduzione;
            fpMontanteMax = fpMontanteMax + Math.floor(fpMontanteMax * rendimentoAnnualeFpPerc) + investimentoEntroDeduzione + Math.floor(investimentoEntroDeduzione * rendimentoAnnualeFpPerc * fattoreMesiInvestiti);
            pacVersamentiMax = pacVersamentiMax + investimentoOltreDeduzione;
            pacMontanteMax = pacMontanteMax + Math.floor(pacMontanteMax * rendimentoAnnualePacPerc) + investimentoOltreDeduzione + Math.floor(investimentoOltreDeduzione * rendimentoAnnualePacPerc * fattoreMesiInvestiti);
        }
        const fpPacMaxExit = (fpMontanteMax - Math.floor(fpVersamentiMax * tassazioneVersamentiFp / 100)) + (pacMontanteMax - Math.floor((pacMontanteMax - pacVersamentiMax) * 0.26));

        const result = {
            "Durata": i + 1,
            "Età": eta + 1,
            "Reddito": reddito,
            "Investimento": investimento,
            "Deduzione": deduzione_1,
            "FP": fpExit,
            "PAC": pacExit,
            "Mix 1": fpPacExit,
            "Mix 2": fpPacMaxExit
        }
        results.push(result);

        const row = {
            "Durata": i + 1,
            "Età": eta + 1,
            "Reddito": formatNumberWithCommas(reddito),
            "Investimento": formatNumberWithCommas(investimento),
            "Deduzione": formatNumberWithCommas(deduzione_1),
            "FP": formatNumberWithCommas(fpExit),
            "PAC": formatNumberWithCommas(pacExit),
            "Mix 1": formatNumberWithCommas(fpPacExit),
            "Mix 2": formatNumberWithCommas(fpPacMaxExit)
        }
        rows.push(row);
    }

    csvContent = convertToCSV(results);
    createTable(rows)
    createChart(results);
}

function createTable(rows) {
    const table = document.createElement('table');
    table.id = 'output-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    for (const key in rows[0]) {
        const headerCell = document.createElement('th');
        headerCell.textContent = key;
        headerRow.appendChild(headerCell);
    }

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    rows.forEach(row => {
        const newRow = document.createElement('tr');
        for (const key in row) {
            const cell = document.createElement('td');
            cell.textContent = row[key];
            newRow.appendChild(cell);
        }
        tbody.appendChild(newRow);
    });

    table.appendChild(tbody);

    outputDiv = document.getElementById('output-div');
    while (outputDiv.firstChild) {
        outputDiv.removeChild(outputDiv.firstChild);
    }
    outputDiv.appendChild(table);
}

function createChart(rows) {

    const durata = rows.map(row => row["Durata"]);
    const fpExit = rows.map(row => row["FP: Exit"]);
    const fpMixPacExit = rows.map(row => row["FP Mix PAC: Exit"]);
    const pacExit = rows.map(row => row["PAC: Exit"]);

    const ctx = document.getElementById('myChart').getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: durata,
            datasets: [
                {
                    label: 'FP: Exit',
                    data: fpExit,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: false,
                },
                {
                    label: 'FP Mix PAC: Exit',
                    data: fpMixPacExit,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: false,
                },
                {
                    label: 'PAC: Exit',
                    data: pacExit,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: false,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Durata'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '€€€'
                    },
                    beginAtZero: true
                }
            }
        }
    });

}

function downloadCsv() {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "data.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function convertToCSV(rows) {
    let str = '';

    let headers = Object.keys(rows[0]).join(',');
    str += headers + '\r\n';

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

function calcolaImposta(Reddito) {
    let imposta;
    if (Reddito <= 28000) {
        imposta = Reddito * 0.23;
    } else if (Reddito <= 50000) {
        imposta = 28000 * 0.23 + (Reddito - 28000) * 0.35;
    } else {
        imposta = 28000 * 0.23 + 22000 * 0.35 + (Reddito - 50000) * 0.43;
    }
    return Math.floor(imposta)
}

function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
}

function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
}


