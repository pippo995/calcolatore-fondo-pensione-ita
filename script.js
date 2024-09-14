document.addEventListener('DOMContentLoaded', updateResults);
document.getElementById('input-form').addEventListener('input', updateResults);
document.getElementById("download-csv").addEventListener("click", downloadCsv)

const limiteDeduzioneFp = 5164;
const tassazioneRenditePac = 0.26

let csvContent = "data:text/csv;charset=utf-8,";

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
    const fattoreFrequenza = parseFloat(document.getElementById('frequenzaDiCarico').value);

    let reddito = primoReddito
    let investimento = primoInvestimento
    //let risparmioImposta_1 = 0;

    let fpVersamenti = 0;
    let fpMontante = 0

    let pacVersamenti = 0;
    let pacMontante = 0;

    let fpVersamentiMix1 = 0;
    let fpMontanteMix1 = 0;
    let pacVersamentiMix1 = 0;
    let pacMontanteMix1 = 0;

    let fpVersamentiMix2 = 0;
    let fpMontanteMix2 = 0;
    let pacVersamentiMix2 = 0;
    let pacMontanteMix2 = 0;

    const results = [];

    for (let anno = 0; anno < durata; anno++) {

        const eta = etaInizio + anno;

        if ((anno) % freqAumentoReddito == 0 && anno != 0) {
            if (tipoAumentoReddito) {
                reddito = reddito + reddito * aumentoReddito / 100
            }
            else {
                reddito = reddito + aumentoReddito
            }
        }

        if ((anno + 1) % freqAumentoInvestimento == 0 && anno != 0) {
            if (tipoAumentoInvestimento) {
                investimento = investimento + investimento * aumentoInvestimento / 100
            }
            else {
                investimento = investimento + aumentoInvestimento
            }
        }

        const tassazioneVersamentiFp = calcolaImpostaFp(anno)
        const contribuzioneDatoreFp = reddito * contribuzioneDatoreFpPerc;
        const redditoConContribuzione = reddito + contribuzioneDatoreFp;
        const investimentoConContribuzione = investimento + contribuzioneDatoreFp;
        const imposta = calcolaImposta(redditoConContribuzione);

        const deduzione_0 = Math.min(investimentoConContribuzione, limiteDeduzioneFp)
        const redditoConContribuzioneDedotto_0 = Math.max(redditoConContribuzione - deduzione_0, 0);
        const impostaDedotta_0 = calcolaImposta(redditoConContribuzioneDedotto_0);
        const risparmioImposta_0 = imposta - impostaDedotta_0;

        const deduzioneRic = calcolaDeduzioneRicorsiva(redditoConContribuzione, investimentoConContribuzione);
        const redditoConContribuzioneDedottoRic = Math.max(redditoConContribuzione - deduzioneRic, 0);
        const impostaDedottaRic = calcolaImposta(redditoConContribuzioneDedottoRic);
        const risparmioImpostaRic = imposta - impostaDedottaRic;

        //const deduzione_1 = Math.min(investimentoConContribuzione + risparmioImposta_1, limiteDeduzioneFp)
        //const redditoConContribuzioneDedotto_1 = Math.max(redditoConContribuzione - deduzione_1, 0);
        //const impostaDedotta_1 = calcolaImposta(redditoConContribuzioneDedotto_1);
        //risparmioImposta_1 = imposta - impostaDedotta_1;

        const risparmioImposta = investireDeduzioni ? risparmioImpostaRic : risparmioImposta_0;

        const investimentoFp = investireDeduzioni ? (investimentoConContribuzione + risparmioImposta) : investimentoConContribuzione;
        const investimentoFpEntroDeduzione = Math.min(investimentoFp, limiteDeduzioneFp)
        const investimentoFpOltreDeduzione = investimentoFp - investimentoFpEntroDeduzione

        const investimentoEntroDeduzione = Math.min(investimento, limiteDeduzioneFp)

        //Solo FP
        fpVersamenti = fpVersamenti + investimentoFp;
        fpMontante = fpMontante * (1 + rendimentoAnnualeFpPerc) + investimentoFp * (1 + rendimentoAnnualeFpPerc * fattoreFrequenza);
        const fpExit = fpMontante - fpVersamenti * tassazioneVersamentiFp;

        //Solo PAC
        pacVersamenti = pacVersamenti + investimento;
        pacMontante = pacMontante * (1 + rendimentoAnnualePacPerc) + investimento * (1 + rendimentoAnnualePacPerc * fattoreFrequenza);
        const pacExit = pacMontante - (pacMontante - pacVersamenti) * tassazioneRenditePac;

        //FP fino a limite deduzioni, poi PAC
        fpVersamentiMix1 = fpVersamentiMix1 + investimentoFpEntroDeduzione;
        fpMontanteMix1 = fpMontanteMix1 * (1 + rendimentoAnnualeFpPerc) + investimentoFpEntroDeduzione * (1 + rendimentoAnnualeFpPerc * fattoreFrequenza);
        pacVersamentiMix1 = pacVersamentiMix1 + investimentoFpOltreDeduzione;
        pacMontanteMix1 = pacMontanteMix1 * (1 + rendimentoAnnualePacPerc) + investimentoFpOltreDeduzione * (1 + rendimentoAnnualePacPerc * fattoreFrequenza);
        const fpMix1Exit = fpMontanteMix1 - fpVersamentiMix1 * tassazioneVersamentiFp;
        const pacMix1Exit = pacMontanteMix1 - (pacMontanteMix1 - pacVersamentiMix1) * tassazioneRenditePac
        const fpPacMix1Exit = fpMix1Exit + pacMix1Exit;

        //Rendimento massimo tra FP e PAC
        rendimentoCompostoFPPerc = (1 + rendimentoAnnualeFpPerc) ** (durata - anno - 1);
        rendimentoCompostoPACPerc = (1 + rendimentoAnnualePacPerc) ** (durata - anno - 1);
        console.log(rendimentoCompostoFPPerc)
        console.log(rendimentoCompostoPACPerc)

        avanzo = investimentoEntroDeduzione + contribuzioneDatoreFp + risparmioImposta - investimentoFpEntroDeduzione
        interesseCompostoFPFP = investimentoFpEntroDeduzione * rendimentoCompostoFPPerc + (investimentoFpEntroDeduzione * rendimentoAnnualeFpPerc * fattoreFrequenza) - (investimentoFpEntroDeduzione * calcolaImpostaFp(durata - 1));
        rendimentoCompostoFPPAC = avanzo * rendimentoCompostoPACPerc + (avanzo * rendimentoAnnualePacPerc * fattoreFrequenza);
        interesseCompostoFPPAC = rendimentoCompostoFPPAC - ((rendimentoCompostoFPPAC - avanzo) * tassazioneRenditePac)
        interesseCompostoFP = interesseCompostoFPFP + interesseCompostoFPPAC;

        rendimentoCompostoPAC = investimentoEntroDeduzione * rendimentoCompostoPACPerc + (investimentoEntroDeduzione * rendimentoAnnualePacPerc * fattoreFrequenza);
        interesseCompostoPAC = rendimentoCompostoPAC - ((rendimentoCompostoPAC - investimentoEntroDeduzione) * tassazioneRenditePac)

        if (interesseCompostoPAC > interesseCompostoFP) {
            fpVersamentiMix2 = fpVersamentiMix2 + 1;
            fpMontanteMix2 = fpMontanteMix2 * (1 + rendimentoAnnualeFpPerc) + 1 * (1 + rendimentoAnnualeFpPerc * fattoreFrequenza);
            pacVersamentiMix2 = pacVersamentiMix2 + investimento - 1;
            pacMontanteMix2 = pacMontanteMix2 * (1 + rendimentoAnnualePacPerc) + (investimento - 1) * (1 + rendimentoAnnualePacPerc * fattoreFrequenza);
        }
        else {
            fpVersamentiMix2 = fpVersamentiMix2 + investimentoFpEntroDeduzione;
            fpMontanteMix2 = fpMontanteMix2 * (1 + rendimentoAnnualeFpPerc) + investimentoFpEntroDeduzione * (1 + rendimentoAnnualeFpPerc * fattoreFrequenza);
            pacVersamentiMix2 = pacVersamentiMix2 + investimentoFpOltreDeduzione;
            pacMontanteMix2 = pacMontanteMix2 * (1 + rendimentoAnnualePacPerc) + investimentoFpOltreDeduzione * (1 + rendimentoAnnualePacPerc * fattoreFrequenza);
        }
        const fpPacMix2Exit = (fpMontanteMix2 - fpVersamentiMix2 * calcolaImpostaFp(durata - 1)) + (pacMontanteMix2 - (pacMontanteMix2 - pacVersamentiMix2) * tassazioneRenditePac);

        const result = {
            "Anno": anno + 1,
            "Età": eta + 1,
            "Reddito": Math.round(reddito),
            "Investimento": Math.round(investimento),
            "Risparmio Fiscale": Math.round(risparmioImposta),
            "Contributo Datore": Math.round(contribuzioneDatoreFp),
            "FP": Math.round(fpExit),
            "PAC": Math.round(pacExit),
            "Mix-1": Math.round(fpPacMix1Exit),
            "Mix-2": Math.round(fpPacMix2Exit),
            "intfp": Math.round(interesseCompostoFP),
            "intpac": Math.round(interesseCompostoPAC)
        }
        results.push(result);
    }

    const rows = results.map(result => {
        return Object.entries(result).map(([key, value]) => {
            if (key !== "Anno" && key !== "Età") {
                value = formatMoney(value);
            }
            return [key, value];
        });
    }).map(entryArray => Object.fromEntries(entryArray));

    csvContent = convertToCSV(results);
    //createTable(rows)
    createTable2(rows)
}

let api;
function createTable(rows) {

    if (api) {
        api.setGridOption('rowData', rows)
        return;
    }
    else {
        const outputDiv = document.getElementById('grid-div');
        const gridOptions = {
            rowData: rows,
            columnDefs: [
                { field: "Anno", headerName: "Anno", flex: 1, minWidth: 60 },
                { field: "Età", headerName: "Età", flex: 1, minWidth: 60 },
                { field: "Reddito", headerName: "Reddito", flex: 3, minWidth: 100 },
                { field: "Investimento", headerName: "Investimento", flex: 3, minWidth: 100 },
                { field: "Risparmio Fiscale", headerName: "Risp. Imposta", flex: 3, minWidth: 100 },
                { field: "Conttributo Datore", headerName: "Con. Datore", flex: 3, minWidth: 100 },
                { field: "FP", headerName: "FP Exit", flex: 3, minWidth: 100 },
                { field: "PAC", headerName: "PAC Exit", flex: 3, minWidth: 100 },
                { field: "Mix-1", headerName: "Mix-1 Exit", flex: 3, minWidth: 100 },
                { field: "Mix-2", headerName: "Mix-2 Exit", flex: 3, minWidth: 100 },
                { field: "intfp", headerName: "Interesse Composto FP", flex: 3, minWidth: 100 },
                { field: "intpac", headerName: "Interesse Composto PAC", flex: 3, minWidth: 100 },
            ],
        };
        api = agGrid.createGrid(outputDiv, gridOptions);
    }
    return;
}


function createTable2(rows) {
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

    gridDiv2 = document.getElementById("grid-div2")
    while (gridDiv2.firstChild) {
        gridDiv2.removeChild(gridDiv2.firstChild);
    }
    gridDiv2.appendChild(table);
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

function formatMoney(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
}

function calcolaImposta(reddito) {
    let imposta;
    if (reddito <= 28000) {
        imposta = reddito * 0.23;
    } else if (reddito <= 50000) {
        imposta = 28000 * 0.23 + (reddito - 28000) * 0.35;
    } else {
        imposta = 28000 * 0.23 + 22000 * 0.35 + (reddito - 50000) * 0.43;
    }
    return imposta
}

function calcolaImpostaFp(durata) {
    return Math.max((15 - Math.max(durata + 1 - 15, 0) * 0.3), 9).toFixed(2) / 100
}

function calcolaDeduzioneRicorsiva(reddito, investimento) {
    let deduzione = Math.min(investimento, limiteDeduzioneFp);
    const redditoDedotto = Math.max(reddito - deduzione, 0);
    const imposta = calcolaImposta(reddito);
    const impostaDedotta = calcolaImposta(redditoDedotto);
    const risparmioImposta = Math.round(imposta - impostaDedotta);

    if (risparmioImposta > 0) {
        deduzione += calcolaDeduzioneRicorsiva(redditoDedotto, risparmioImposta);
    }

    return Math.min(deduzione, limiteDeduzioneFp);
}

