document.addEventListener('DOMContentLoaded', updateResults);
document.getElementById('input-form').addEventListener('input', updateResults);
document.getElementById("download-csv").addEventListener("click", downloadCsv)
document.getElementById("tipoAumentoRedditoPerc").addEventListener("change", updateTipoReddito);
document.getElementById("tipoAumentoRedditoN").addEventListener("change", updateTipoReddito);
document.getElementById("tipoAumentoInvestimentoPerc").addEventListener("change", updateTipoInvestimento);
document.getElementById("tipoAumentoInvestimentoN").addEventListener("change", updateTipoInvestimento);

const limiteDeduzioneFp = 5164;
const tassazioneInps = 0.0919;
const tassazioneRenditePac = 0.26

let csvContent = "data:text/csv;charset=utf-8,";

function updateResults() {

    const durata = parseInt(document.getElementById('durata').value);

    // Reddito
    const primoReddito = parseFloat(document.getElementById('reddito').value);
    const tipoAumentoReddito = document.querySelector('input[name="tipoAumentoReddito"]:checked').value;
    const freqAumentoReddito = parseFloat(document.getElementById('freqAumentoReddito').value);
    const aumentoReddito = parseFloat(document.getElementById('aumentoReddito').value);

    // Investimento
    const primoInvestimento = parseFloat(document.getElementById('investimento').value);
    const tipoAumentoInvestimento = document.querySelector('input[name="tipoAumentoInvestimento"]:checked').value;
    const freqAumentoInvestimento = parseFloat(document.getElementById('freqAumentoInvestimento').value);
    const aumentoInvestimento = parseFloat(document.getElementById('aumentoInvestimento').value);

    // Varie
    const sceltaTfr = document.getElementById('tfr').value;
    const quotaDatoreFpPerc = parseFloat(document.getElementById('contribuzioneDatoreFpPerc').value) / 100;
    const quotaMinAderentePerc = parseFloat(document.getElementById('quotaMinAderentePerc').value) / 100;
    const quotaEccedente = document.getElementById('quotaEccedente').value;
    const investireRisparmioFisc = document.getElementById('investireRisparmioFisc').value;
    const frequenzaDiCarico = parseFloat(document.getElementById('frequenzaDiCarico').value);

    // Rendimenti
    const inflazioneAnnualePerc = parseFloat(document.getElementById('inflazione').value) / 100;
    const rendimentoAnnualeFpPerc = parseFloat(document.getElementById('rendimentoAnnualeFpPerc').value) / 100;
    const rendimentoAnnualePacPerc = parseFloat(document.getElementById('rendimentoAnnualePacPerc').value) / 100;

    let reddito = primoReddito;
    let investimento = primoInvestimento;

    let risparmioImposta_1 = 0;

    // TFR
    let tfrAziendaVersamenti = 0;
    let tfrAziendaMontante = 0;
    let tfrFpVersamenti = 0;
    let tfrFpMontante = 0;

    // FP
    let fpVersamenti = 0;
    let fpMontante = 0

    // PAC
    let pacVersamenti = 0;
    let pacMontante = 0;

    // Mix-1
    let fpVersamentiMix1 = 0;
    let fpMontanteMix1 = 0;
    let pacVersamentiMix1 = 0;
    let pacMontanteMix1 = 0;

    // Mix-2
    let fpVersamentiMix2 = 0;
    let fpMontanteMix2 = 0;
    let pacVersamentiMix2 = 0;
    let pacMontanteMix2 = 0;

    const results = [];
    const entroDeduzioneFP = [];
    const oltreDeduzioneFP = [];
    const entroDeduzionePAC = [];
    const oltreDeduzionePAC = [];

    for (let anno = 0; anno < durata; anno++) {

        if ((anno) % freqAumentoReddito == 0 && anno != 0) {
            if (tipoAumentoReddito == "%") {
                reddito = reddito + reddito * aumentoReddito / 100
            }
            else {
                reddito = reddito + aumentoReddito
            }
        }

        if ((anno) % freqAumentoInvestimento == 0 && anno != 0) {
            if (tipoAumentoInvestimento == "%") {
                investimento = investimento + investimento * aumentoInvestimento / 100
            }
            else {
                investimento = investimento + aumentoInvestimento
            }
        }

        // Gestione TFR
        let tfr = reddito * 0.06907;
        switch (sceltaTfr) {
            case "Azienda":
                tfrAziendaVersamenti = tfrAziendaVersamenti + tfr;
                tfrAziendaMontante = tfrAziendaMontante * (1 + (inflazioneAnnualePerc * 0.75 + 0.015) * 0.83) + tfr;
                break;
            case "Fondo Pensione":
                tfrFpVersamenti = tfrFpVersamenti + tfr;
                tfrFpMontante = tfrFpMontante * (1 + rendimentoAnnualeFpPerc) + tfr * (1 + rendimentoAnnualeFpPerc * 0.375);
                break;
            default:
                tfr = 0;
                break
        }

        const tfrAziendaExit = tfrAziendaMontante - tfrAziendaMontante * calcolaTassazioneTfr(tfrAziendaVersamenti, anno);
        const tfrFpExit = tfrFpMontante - tfrFpVersamenti * calcolaTassazioneFp(anno);
        const tfrExit = tfrAziendaExit + tfrFpExit;


        // Gestione Risparmio Fiscale  
        const quotaDatoreFp = reddito * quotaDatoreFpPerc;
        const quotaDatoreFpEccedente = Math.max(quotaDatoreFp - limiteDeduzioneFp, 0);
        const limiteDeduzioneFpEffettivo = Math.max(limiteDeduzioneFp - quotaDatoreFp, 0);

        const redditoImponibile = reddito * (1 - tassazioneInps);

        const detrazioneDipendente = calcolaDetrazioniDipendente(redditoImponibile);
        const impostaLorda = calcolaImposta(redditoImponibile);
        const impostaNetta = Math.max(impostaLorda - detrazioneDipendente, 0);

        // Risparmio fiscale non reinvestito
        const deduzione_0 = Math.min(investimento, limiteDeduzioneFpEffettivo)
        const redditoDedotto_0 = Math.max(redditoImponibile - deduzione_0, 0);
        const impostaLordaDedotta_0 = calcolaImposta(redditoDedotto_0);
        const impostaNettaDedotta_0 = Math.max(impostaLordaDedotta_0 - detrazioneDipendente, 0);
        const risparmioImposta_0 = impostaNetta - impostaNettaDedotta_0;

        // Risparmio fiscale reinvestito
        if (anno == 0) {
            risparmioImposta_1 = risparmioImposta_0;
        }
        let redditoImponibile_1;
        switch (quotaEccedente) {
            case "Bonifico":
                redditoImponibile_1 = redditoImponibile;
                break;
            case "Busta Paga":
                redditoImponibile_1 = Math.max(redditoImponibile - investimento - risparmioImposta_1, 0);
                break;
            default:
                break;
        }

        const detrazioneDipendente_1 = calcolaDetrazioniDipendente(redditoImponibile_1);
        const deduzione_1 = Math.min(investimento + risparmioImposta_1, limiteDeduzioneFpEffettivo);
        const redditoDedotto_1 = Math.max(redditoImponibile - deduzione_1, 0);
        const impostaLordaDedotta_1 = calcolaImposta(redditoDedotto_1);
        const impostaNettaDedotta_1 = impostaLordaDedotta_1 - detrazioneDipendente_1;
        risparmioImposta_1 = impostaNetta - impostaNettaDedotta_1;

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
                break;
        }

        // Gestione Investimento
        const investimentoEntroDeduzione = Math.min(investimento, limiteDeduzioneFpEffettivo)
        const investimentoOltreDeduzione = investimento - investimentoEntroDeduzione;

        const investimentoFp = investimento + risparmioImposta + quotaDatoreFp;
        const investimentoFpEntroDeduzione = Math.min(investimentoFp, limiteDeduzioneFpEffettivo)
        const investimentoFpOltreDeduzione = investimentoFp - investimentoFpEntroDeduzione

        // Strategia FP
        fpVersamenti = fpVersamenti + investimentoFp;
        fpMontante = fpMontante * (1 + rendimentoAnnualeFpPerc) + investimentoFp * (1 + rendimentoAnnualeFpPerc * frequenzaDiCarico);
        const fpExit = fpMontante - fpVersamenti * calcolaTassazioneFp(anno) + tfrExit;

        // Strategia PAC
        pacVersamenti = pacVersamenti + investimento;
        pacMontante = pacMontante * (1 + rendimentoAnnualePacPerc) + investimento * (1 + rendimentoAnnualePacPerc * frequenzaDiCarico);
        const pacExit = pacMontante - (pacMontante - pacVersamenti) * tassazioneRenditePac + tfrExit;

        // Strategia FP fino a limite deduzioni, poi PAC
        fpVersamentiMix1 = fpVersamentiMix1 + investimentoFpEntroDeduzione;
        fpMontanteMix1 = fpMontanteMix1 * (1 + rendimentoAnnualeFpPerc) + investimentoFpEntroDeduzione * (1 + rendimentoAnnualeFpPerc * frequenzaDiCarico);
        pacVersamentiMix1 = pacVersamentiMix1 + investimentoFpOltreDeduzione;
        pacMontanteMix1 = pacMontanteMix1 * (1 + rendimentoAnnualePacPerc) + investimentoFpOltreDeduzione * (1 + rendimentoAnnualePacPerc * frequenzaDiCarico);
        const fpMix1Exit = fpMontanteMix1 - fpVersamentiMix1 * calcolaTassazioneFp(anno);
        const pacMix1Exit = pacMontanteMix1 - (pacMontanteMix1 - pacVersamentiMix1) * tassazioneRenditePac
        const fpPacMix1Exit = fpMix1Exit + pacMix1Exit + tfrExit;

        // Strategia rendimento massimo tra FP e PAC
        rendimentoCompostoFPPerc = (1 + rendimentoAnnualeFpPerc) ** (durata - anno - 1);
        rendimentoCompostoPACPerc = (1 + rendimentoAnnualePacPerc) ** (durata - anno - 1);

        const investimentoAvanzo = investimentoEntroDeduzione + quotaDatoreFp + risparmioImposta - investimentoFpEntroDeduzione
        interesseCompostoFPFPEntro = investimentoFpEntroDeduzione * rendimentoCompostoFPPerc + (investimentoFpEntroDeduzione * rendimentoAnnualeFpPerc * frequenzaDiCarico) - (investimentoFpEntroDeduzione * calcolaTassazioneFp(durata - 1));
        rendimentoCompostoFPPACEntro = investimentoAvanzo * rendimentoCompostoPACPerc + (investimentoAvanzo * rendimentoAnnualePacPerc * frequenzaDiCarico);
        interesseCompostoFPPACEntro = rendimentoCompostoFPPACEntro - ((rendimentoCompostoFPPACEntro - investimentoAvanzo) * tassazioneRenditePac)
        interesseCompostoFPEntro = interesseCompostoFPFPEntro + interesseCompostoFPPACEntro;

        rendimentoCompostoPACEntro = investimentoEntroDeduzione * rendimentoCompostoPACPerc + (investimentoEntroDeduzione * rendimentoAnnualePacPerc * frequenzaDiCarico);
        interesseCompostoPACEntro = rendimentoCompostoPACEntro - ((rendimentoCompostoPACEntro - investimentoEntroDeduzione) * tassazioneRenditePac)

        interesseCompostoFPOltre = investimentoOltreDeduzione * rendimentoCompostoFPPerc + (investimentoOltreDeduzione * rendimentoAnnualeFpPerc * frequenzaDiCarico) - (investimentoOltreDeduzione * calcolaTassazioneFp(durata - 1));

        rendimentoCompostoPACOltre = investimentoOltreDeduzione * rendimentoCompostoPACPerc + (investimentoOltreDeduzione * rendimentoAnnualePacPerc * frequenzaDiCarico);
        interesseCompostoPACOltre = rendimentoCompostoPACOltre - ((rendimentoCompostoPACOltre - investimentoOltreDeduzione) * tassazioneRenditePac)

        if (interesseCompostoPACEntro > interesseCompostoFPEntro) {
            fpVersamentiMix2 = fpVersamentiMix2 + 1;
            fpMontanteMix2 = fpMontanteMix2 * (1 + rendimentoAnnualeFpPerc) + 1 * (1 + rendimentoAnnualeFpPerc * frequenzaDiCarico);
            pacVersamentiMix2 = pacVersamentiMix2 + investimento - 1;
            pacMontanteMix2 = pacMontanteMix2 * (1 + rendimentoAnnualePacPerc) + (investimento - 1) * (1 + rendimentoAnnualePacPerc * frequenzaDiCarico);
            entroDeduzionePAC.push(anno);
            if (interesseCompostoPACOltre > 0) {
                oltreDeduzionePAC.push(anno);
            }
        }
        else {
            if (interesseCompostoPACOltre > interesseCompostoFPOltre) {
                fpVersamentiMix2 = fpVersamentiMix2 + investimentoFpEntroDeduzione;
                fpMontanteMix2 = fpMontanteMix2 * (1 + rendimentoAnnualeFpPerc) + investimentoFpEntroDeduzione * (1 + rendimentoAnnualeFpPerc * frequenzaDiCarico);
                pacVersamentiMix2 = pacVersamentiMix2 + investimentoFpOltreDeduzione;
                pacMontanteMix2 = pacMontanteMix2 * (1 + rendimentoAnnualePacPerc) + investimentoFpOltreDeduzione * (1 + rendimentoAnnualePacPerc * frequenzaDiCarico);
                entroDeduzioneFP.push(anno);
                oltreDeduzionePAC.push(anno);
            }
            else {
                fpVersamentiMix2 = fpVersamentiMix2 + investimentoFp;
                fpMontanteMix2 = fpMontanteMix2 * (1 + rendimentoAnnualeFpPerc) + investimentoFp * (1 + rendimentoAnnualeFpPerc * frequenzaDiCarico);
                pacVersamentiMix2 = pacVersamentiMix2;
                pacMontanteMix2 = pacMontanteMix2 * (1 + rendimentoAnnualePacPerc);
                entroDeduzioneFP.push(anno);
                if (interesseCompostoPACOltre > 0) {
                    oltreDeduzioneFP.push(anno);
                }
            }
        }

        const fpPacMix2Exit = (fpMontanteMix2 - fpVersamentiMix2 * calcolaTassazioneFp(durata - 1)) + (pacMontanteMix2 - (pacMontanteMix2 - pacVersamentiMix2) * tassazioneRenditePac) + tfrExit;

        const result = {
            "Anno": anno + 1,
            "Reddito": Math.round(reddito),
            "Investimento": Math.round(investimento),
            "TFR": Math.round(tfr),
            "Ris. Fiscale": Math.round(risparmioImposta),
            "Quota Datore": Math.round(quotaDatoreFp),
            "Exit FP": Math.round(fpExit),
            "Exit PAC": Math.round(pacExit),
            "Exit Mix-1": Math.round(fpPacMix1Exit),
            "Exit Mix-2": Math.round(fpPacMix2Exit),
        }
        results.push(result);
    }


    const fpRangesEntro = getRanges(entroDeduzioneFP, 'Fondo Pensione');
    const pacRangesEntro = getRanges(entroDeduzionePAC, 'PAC');
    const resultStringEntro = [...pacRangesEntro, ...fpRangesEntro].join(', ');
    const stringEntro = "Per la quota entro deduzione: " + resultStringEntro + ".";

    const fpRangesOltre = getRanges(oltreDeduzioneFP, 'Fondo Pensione');
    const pacRangesOltre = getRanges(oltreDeduzionePAC, 'PAC');
    const resultStringOltre = [...pacRangesOltre, ...fpRangesOltre].join(', ');
    const stringOltre = "Per la quota oltre deduzione: " + resultStringOltre + ".";

    document.getElementById("strategy-div").textContent = stringEntro;

    csvContent = convertToCSV(results);
    createTable(results);
}

function createTable(results) {

    const rows = results.map(result => {
        return Object.entries(result).map(([key, value]) => {
            if (key !== "Anno") {
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

function getRanges(arr, name) {
    let ranges = [];
    let start = arr[0];

    for (let i = 1; i <= arr.length; i++) {
        if (arr[i] !== arr[i - 1] + 1 || i === arr.length) {
            let end = arr[i - 1];
            if (start === end) {
                ranges.push(`nell'anno ${start} investire in ${name}`);
            } else {
                ranges.push(`dall'anno ${start} all'anno ${end} investire in ${name}`);
            }
            start = arr[i];
        }
    }

    return ranges;
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

function calcolaImposta(reddito) {
    let imposta;
    if (reddito <= 15000) {
        imposta = reddito * 0.24;
    } else if (reddito <= 28000) {
        imposta = 15000 * 0.24 + (reddito - 15000) * 0.26;
    } else if (reddito <= 50000) {
        imposta = 15000 * 0.24 + 13000 * 0.26 + (reddito - 28000) * 0.37;
    } else {
        imposta = 15000 * 0.24 + 13000 * 0.26 + 22000 * 0.35 + (reddito - 50000) * 0.45;
    }
    return imposta;
}

function calcolaDetrazioniDipendente(reddito) {
    let detrazione;

    if (reddito <= 15000) {
        detrazione = 1880;
    } else if (reddito <= 28000) {
        let rapporto = (28000 - reddito) / 13000;
        detrazione = 1910 + (1190 * rapporto);
    } else if (reddito <= 50000) {
        let rapporto = (50000 - reddito) / 22000;
        detrazione = 1910 * rapporto;
    } else {
        detrazione = 0;
    }

    if (reddito >= 25000 && reddito <= 35000) {
        detrazione += 65;
    }

    return detrazione;
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

function calcolaRisparmioImpostaRicorsivo(redditoImponibile, investimento, redditoConQuotaDatoreFp, investimentoConQuotaDatoreFp, risparmioImposta) {


    console.log("redditoImponibile " + redditoImponibile)
    console.log("investimento " + investimento)
    console.log("redditoConQuotaDatoreFp " + redditoConQuotaDatoreFp)
    console.log("investimentoConQuotaDatoreFp " + investimentoConQuotaDatoreFp)
    console.log("risparmioImposta " + risparmioImposta)


    const detrazioneDipendente = calcolaDetrazioniDipendente(redditoImponibile);
    const imposta = Math.max(calcolaImposta(redditoImponibile) - detrazioneDipendente, 0);
    const deduzione_0 = Math.min(investimentoConQuotaDatoreFp, limiteDeduzioneFp)
    const redditoConQuotaDatoreFpDedotto_0 = Math.max(redditoConQuotaDatoreFp - deduzione_0, 0);
    const impostaDedotta_0 = Math.max(calcolaImposta(redditoConQuotaDatoreFpDedotto_0) - detrazioneDipendente, 0);
    const risparmioImposta_0 = imposta - impostaDedotta_0;

    console.log("detrazioneDipendente " + detrazioneDipendente)
    console.log("imposta " + imposta)
    console.log("deduzione_0 " + deduzione_0)
    console.log("redditoConQuotaDatoreFpDedotto_0 " + redditoConQuotaDatoreFpDedotto_0)
    console.log("impostaDedotta_0 " + impostaDedotta_0)
    console.log("risparmioImposta_0 " + risparmioImposta_0)



    if (risparmioImposta == risparmioImposta_0) {
        return risparmioImposta;
    }
    else {
        calcolaRisparmioImpostaRicorsivo(redditoImponibile - investimento - risparmioImposta_0, investimento + risparmioImposta_0, redditoConQuotaDatoreFp - investimentoConQuotaDatoreFp - risparmioImposta_0, investimentoConQuotaDatoreFp + risparmioImposta_0, risparmioImposta_0);

    }
}

