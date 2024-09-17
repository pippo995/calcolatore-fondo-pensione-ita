document.addEventListener('DOMContentLoaded', updateResults);
document.getElementById('input-form').addEventListener('input', updateResults);
document.getElementById("download-csv").addEventListener("click", downloadCsv)
document.getElementById("tipoAumentoRedditoPerc").addEventListener("change", updateTipoReddito);
document.getElementById("tipoAumentoRedditoN").addEventListener("change", updateTipoReddito);
document.getElementById("tipoAumentoInvestimentoPerc").addEventListener("change", updateTipoInvestimento);
document.getElementById("tipoAumentoInvestimentoN").addEventListener("change", updateTipoInvestimento);

const limiteDeduzioneFp = 5164;
const tassazioneRenditePac = 0.26

let csvContent = "data:text/csv;charset=utf-8,";

function updateResults() {

    const etaInizio = parseInt(document.getElementById('etaInizio').value);
    const durata = parseInt(document.getElementById('durata').value);
    const fattoreFrequenza = parseFloat(document.getElementById('frequenzaDiCarico').value);
    const primoReddito = parseFloat(document.getElementById('reddito').value);
    const tipoAumentoReddito = document.querySelector('input[name="tipoAumentoReddito"]:checked').value;
    const freqAumentoReddito = parseFloat(document.getElementById('freqAumentoReddito').value);
    const aumentoReddito = parseFloat(document.getElementById('aumentoReddito').value);
    const primoInvestimento = parseFloat(document.getElementById('investimento').value);
    const tipoAumentoInvestimento = document.querySelector('input[name="tipoAumentoInvestimento"]:checked').value;
    const freqAumentoInvestimento = parseFloat(document.getElementById('freqAumentoInvestimento').value);
    const aumentoInvestimento = parseFloat(document.getElementById('aumentoInvestimento').value);
    const contribuzioneDatoreFpPerc = parseFloat(document.getElementById('contribuzioneDatoreFpPerc').value) / 100;
    const investireRisparmioFisc = document.getElementById('investireRisparmioFisc').value;
    const sceltaTfr = document.getElementById('tfr').value;
    const inflazioneAnnualePerc = parseFloat(document.getElementById('inflazione').value) / 100;
    const rendimentoAnnualeFpPerc = parseFloat(document.getElementById('rendimentoAnnualeFpPerc').value) / 100;
    const rendimentoAnnualePacPerc = parseFloat(document.getElementById('rendimentoAnnualePacPerc').value) / 100;

    let reddito = primoReddito;
    let investimento = primoInvestimento;

    let tfrAziendaVersamenti = 0;
    let tfrAziendaMontante = 0;

    let tfrFpVersamenti = 0;
    let tfrFpMontante = 0;

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
            if (tipoAumentoReddito == "%") {
                reddito = reddito + reddito * aumentoReddito / 100
            }
            else {
                reddito = reddito + aumentoReddito
            }
        }

        if ((anno + 1) % freqAumentoInvestimento == 0 && anno != 0) {
            if (tipoAumentoInvestimento == "%") {
                investimento = investimento + investimento * aumentoInvestimento / 100
            }
            else {
                investimento = investimento + aumentoInvestimento
            }
        }

        const contribuzioneDatoreFp = reddito * contribuzioneDatoreFpPerc;
        const redditoConContribuzione = reddito + contribuzioneDatoreFp;
        const investimentoConContribuzione = investimento + contribuzioneDatoreFp;
        const imposta = calcolaImposta(redditoConContribuzione);

        let tfr = reddito / 13.5 - reddito / 13.5 * 0.005;
        let tfrInAzienda = 0;
        let tfrInFp = 0;
        switch (sceltaTfr) {
            case "Azienda":
                tfrInAzienda = tfr;
                tfrInFp = 0;
                break;
            case "Fondo Pensione":
                tfrInAzienda = 0;
                tfrInFp = tfr;
                break;
            default:
                tfrInAzienda = 0;
                tfrInFp = 0;
                tfr = 0;
        }

        //TFR in Azienda
        tfrAziendaVersamenti = tfrAziendaVersamenti + tfrInAzienda;
        tfrAziendaMontante = tfrAziendaMontante * (1 + inflazioneAnnualePerc * 0.75 + 0.015) + tfrInAzienda;
        const tfrAziendaExit = tfrAziendaMontante - tfrAziendaMontante * calcolaTassazioneTfr(tfrAziendaVersamenti, anno);

        //TFR in FP
        tfrFpVersamenti = tfrFpVersamenti + tfrInFp;
        tfrFpMontante = tfrFpMontante * (1 + rendimentoAnnualeFpPerc) + tfrInFp * (1 + rendimentoAnnualeFpPerc * 0.375);
        const tfrFpExit = tfrFpMontante - tfrFpVersamenti * calcolaTassazioneFp(anno);
        console.log(tfrFpVersamenti);
        console.log(tfrFpMontante);
        console.log(tfrFpExit)

        const tfrExit = tfrAziendaExit + tfrFpExit;

        const deduzione_0 = Math.min(investimentoConContribuzione, limiteDeduzioneFp)
        const redditoConContribuzioneDedotto_0 = Math.max(redditoConContribuzione - deduzione_0, 0);
        const impostaDedotta_0 = calcolaImposta(redditoConContribuzioneDedotto_0);
        const risparmioImposta_0 = imposta - impostaDedotta_0;

        const deduzioneRic = calcolaDeduzioneRicorsiva(redditoConContribuzione, investimentoConContribuzione);
        const redditoConContribuzioneDedottoRic = Math.max(redditoConContribuzione - deduzioneRic, 0);
        const impostaDedottaRic = calcolaImposta(redditoConContribuzioneDedottoRic);
        const risparmioImpostaRic = imposta - impostaDedottaRic;

        let risparmioImposta_1 = 0;
        const deduzione_1 = Math.min(investimentoConContribuzione + risparmioImposta_1, limiteDeduzioneFp)
        const redditoConContribuzioneDedotto_1 = Math.max(redditoConContribuzione - deduzione_1, 0);
        const impostaDedotta_1 = calcolaImposta(redditoConContribuzioneDedotto_1);
        risparmioImposta_1 = imposta - impostaDedotta_1;

        let risparmioImposta;
        switch (investireRisparmioFisc) {
            case "Anno corrente":
                risparmioImposta = risparmioImpostaRic;
                break;
            case "Anno successivo":
                risparmioImposta = risparmioImposta_1;
                break;
            default:
                risparmioImposta = 0;
        }

        const investimentoEntroDeduzione = Math.min(investimento, limiteDeduzioneFp)
        const investimentoOltreDeduzione = investimento - investimentoEntroDeduzione;

        const investimentoFp = investimentoConContribuzione + risparmioImposta;
        const investimentoFpEntroDeduzione = Math.min(investimentoFp, limiteDeduzioneFp)
        const investimentoFpOltreDeduzione = investimentoFp - investimentoFpEntroDeduzione

        //Strategia FP
        fpVersamenti = fpVersamenti + investimentoFp;
        fpMontante = fpMontante * (1 + rendimentoAnnualeFpPerc) + investimentoFp * (1 + rendimentoAnnualeFpPerc * fattoreFrequenza);
        const fpExit = fpMontante - fpVersamenti * calcolaTassazioneFp(anno) + tfrExit;

        //Strategia PAC
        pacVersamenti = pacVersamenti + investimento;
        pacMontante = pacMontante * (1 + rendimentoAnnualePacPerc) + investimento * (1 + rendimentoAnnualePacPerc * fattoreFrequenza);
        const pacExit = pacMontante - (pacMontante - pacVersamenti) * tassazioneRenditePac + tfrExit;

        //Strategia FP fino a limite deduzioni, poi PAC
        fpVersamentiMix1 = fpVersamentiMix1 + investimentoFpEntroDeduzione;
        fpMontanteMix1 = fpMontanteMix1 * (1 + rendimentoAnnualeFpPerc) + investimentoFpEntroDeduzione * (1 + rendimentoAnnualeFpPerc * fattoreFrequenza);
        pacVersamentiMix1 = pacVersamentiMix1 + investimentoFpOltreDeduzione;
        pacMontanteMix1 = pacMontanteMix1 * (1 + rendimentoAnnualePacPerc) + investimentoFpOltreDeduzione * (1 + rendimentoAnnualePacPerc * fattoreFrequenza);
        const fpMix1Exit = fpMontanteMix1 - fpVersamentiMix1 * calcolaTassazioneFp(anno);
        const pacMix1Exit = pacMontanteMix1 - (pacMontanteMix1 - pacVersamentiMix1) * tassazioneRenditePac
        const fpPacMix1Exit = fpMix1Exit + pacMix1Exit + tfrExit;

        //Strategia rendimento massimo tra FP e PAC
        rendimentoCompostoFPPerc = (1 + rendimentoAnnualeFpPerc) ** (durata - anno - 1);
        rendimentoCompostoPACPerc = (1 + rendimentoAnnualePacPerc) ** (durata - anno - 1);

        const investimentoAvanzo = investimentoEntroDeduzione + contribuzioneDatoreFp + risparmioImposta - investimentoFpEntroDeduzione
        interesseCompostoFPFPEntro = investimentoFpEntroDeduzione * rendimentoCompostoFPPerc + (investimentoFpEntroDeduzione * rendimentoAnnualeFpPerc * fattoreFrequenza) - (investimentoFpEntroDeduzione * calcolaTassazioneFp(durata - 1));
        rendimentoCompostoFPPACEntro = investimentoAvanzo * rendimentoCompostoPACPerc + (investimentoAvanzo * rendimentoAnnualePacPerc * fattoreFrequenza);
        interesseCompostoFPPACEntro = rendimentoCompostoFPPACEntro - ((rendimentoCompostoFPPACEntro - investimentoAvanzo) * tassazioneRenditePac)
        interesseCompostoFPEntro = interesseCompostoFPFPEntro + interesseCompostoFPPACEntro;

        rendimentoCompostoPACEntro = investimentoEntroDeduzione * rendimentoCompostoPACPerc + (investimentoEntroDeduzione * rendimentoAnnualePacPerc * fattoreFrequenza);
        interesseCompostoPACEntro = rendimentoCompostoPACEntro - ((rendimentoCompostoPACEntro - investimentoEntroDeduzione) * tassazioneRenditePac)

        interesseCompostoFPOltre = investimentoFpOltreDeduzione * rendimentoCompostoFPPerc + (investimentoFpOltreDeduzione * rendimentoAnnualeFpPerc * fattoreFrequenza) - (investimentoFpOltreDeduzione * calcolaTassazioneFp(durata - 1));

        rendimentoCompostoPACOltre = investimentoOltreDeduzione * rendimentoCompostoPACPerc + (investimentoOltreDeduzione * rendimentoAnnualePacPerc * fattoreFrequenza);
        interesseCompostoPACOltre = rendimentoCompostoPACOltre - ((rendimentoCompostoPACOltre - investimentoOltreDeduzione) * tassazioneRenditePac)

        if (interesseCompostoPACEntro > interesseCompostoFPEntro) {
            fpVersamentiMix2 = fpVersamentiMix2 + 1;
            fpMontanteMix2 = fpMontanteMix2 * (1 + rendimentoAnnualeFpPerc) + 1 * (1 + rendimentoAnnualeFpPerc * fattoreFrequenza);
            pacVersamentiMix2 = pacVersamentiMix2 + investimento - 1;
            pacMontanteMix2 = pacMontanteMix2 * (1 + rendimentoAnnualePacPerc) + (investimento - 1) * (1 + rendimentoAnnualePacPerc * fattoreFrequenza);
        }
        else {
            if (interesseCompostoPACOltre > interesseCompostoFPOltre) {
                fpVersamentiMix2 = fpVersamentiMix2 + investimentoFpEntroDeduzione;
                fpMontanteMix2 = fpMontanteMix2 * (1 + rendimentoAnnualeFpPerc) + investimentoFpEntroDeduzione * (1 + rendimentoAnnualeFpPerc * fattoreFrequenza);
                pacVersamentiMix2 = pacVersamentiMix2 + investimentoFpOltreDeduzione;
                pacMontanteMix2 = pacMontanteMix2 * (1 + rendimentoAnnualePacPerc) + investimentoFpOltreDeduzione * (1 + rendimentoAnnualePacPerc * fattoreFrequenza);
            }
            else {
                fpVersamentiMix2 = fpVersamentiMix2 + investimentoFp;
                fpMontanteMix2 = fpMontanteMix2 * (1 + rendimentoAnnualeFpPerc) + investimentoFp * (1 + rendimentoAnnualeFpPerc * fattoreFrequenza);
                pacVersamentiMix2 = pacVersamentiMix2;
                pacMontanteMix2 = pacMontanteMix2 * (1 + rendimentoAnnualePacPerc);
            }
        }
        const fpPacMix2Exit = (fpMontanteMix2 - fpVersamentiMix2 * calcolaTassazioneFp(durata - 1)) + (pacMontanteMix2 - (pacMontanteMix2 - pacVersamentiMix2) * tassazioneRenditePac) + tfrExit;

        const result = {
            "Anno": anno + 1,
            "Età": eta + 1,
            "Reddito": Math.round(reddito),
            "Investimento": Math.round(investimento),
            "TFR": Math.round(tfr),
            "Ris. Fiscale": Math.round(risparmioImposta),
            "Con. Datore": Math.round(contribuzioneDatoreFp),
            "Strategia FP": Math.round(fpExit),
            "Strategia PAC": Math.round(pacExit),
            "Strategia Mix1": Math.round(fpPacMix1Exit),
            "Strategia Mix2": Math.round(fpPacMix2Exit),
        }
        results.push(result);

        const resultFP = {
            "Anno": anno + 1,
            "Età": eta + 1,
            "Reddito": Math.round(reddito),
            "Investimento": Math.round(investimento),
            "TFR": Math.round(tfr),
            "Ris. Fiscale": Math.round(risparmioImposta),
            "Con. Datore": Math.round(contribuzioneDatoreFp),
            "Strategia FP": Math.round(fpExit),
        }
    }



    csvContent = convertToCSV(results);
    createTable(results);
}

function createTable(results) {

    const rows = results.map(result => {
        return Object.entries(result).map(([key, value]) => {
            if (key !== "Anno" && key !== "Età") {
                value = formatMoney(value);
            }
            return [key, value];
        });
    }).map(entryArray => Object.fromEntries(entryArray));

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

    griddiv = document.getElementById("grid-div")
    while (griddiv.firstChild) {
        griddiv.removeChild(griddiv.firstChild);
    }
    griddiv.appendChild(table);
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

function updateTipoReddito() {
    const aumentoRedditoInput = document.getElementById('aumentoReddito');
    const tipoAumentoReddito = document.querySelector('input[name="tipoAumentoReddito"]:checked').value;
    if (tipoAumentoReddito == "%") {
        aumentoRedditoInput.step = "0.1";
        aumentoRedditoInput.value = "10";
    } else if (tipoAumentoReddito == "€") {
        aumentoRedditoInput.step = "100";
        aumentoRedditoInput.value = "5000";
    }
    updateResults()
}

function updateTipoInvestimento() {
    const aumentoInvestimentoInput = document.getElementById('aumentoInvestimento');
    const tipoAumentoInvestimento = document.querySelector('input[name="tipoAumentoInvestimento"]:checked').value;
    if (tipoAumentoInvestimento == "%") {
        aumentoInvestimentoInput.step = "0.1";
        aumentoInvestimentoInput.value = "10";
    } else if (tipoAumentoInvestimento == "€") {
        aumentoInvestimentoInput.step = "100";
        aumentoInvestimentoInput.value = "500";
    }
    updateResults()
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

function calcolaTassazioneFp(durata) {
    tassazioneFp = Math.max((15 - Math.max(durata + 1 - 15, 0) * 0.3), 9).toFixed(2) / 100;
    return tassazioneFp;
}

function calcolaTassazioneTfr(tfrVersamenti, anno) {
    if (tfrVersamenti > 0 && anno > 0) {
        tfrRiferimento = tfrVersamenti * 12 / anno;
        tfrRiferimentoImposta = calcolaImposta(tfrRiferimento);
        tassazioneTfr = tfrRiferimentoImposta / tfrRiferimento;
    }
    else {
        tassazioneTfr = 0;
    }
    return tassazioneTfr;
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

