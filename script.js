document.addEventListener('DOMContentLoaded', () => {

    const inputForm = document.getElementById('input-form');
    const resultOutput = document.getElementById('result-output');

    let configurations;
    fetch('configurations.json')
        .then(response => response.json())
        .then(data => {
            etaInizio.value = sessionStorage.getItem("etaInizio") || data["Valori Default"]["etaInizio"];
            durata.value = sessionStorage.getItem("durata") || data["Valori Default"]["durata"];
            primaRal.value = sessionStorage.getItem("primaRal") || data["Valori Default"]["primaRal"];
            aumentoRal.value = sessionStorage.getItem("aumentoRal") || data["Valori Default"]["aumentoRal"];
            investimentoAnnuale.value = sessionStorage.getItem("investimentoAnnuale") || data["Valori Default"]["investimentoAnnuale"];
            contribuzioneDatoreFpnPerc.value = sessionStorage.getItem("contribuzioneDatoreFpnPerc") || data["Valori Default"]["contribuzioneDatoreFpnPerc"];
            rendimentoAnnualeFpnPerc.value = sessionStorage.getItem("rendimentoAnnualeFpnPerc") || data["Valori Default"]["rendimentoAnnualeFpnPerc"];
            rendimentoAnnualePacPerc.value = sessionStorage.getItem("rendimentoAnnualePacPerc") || data["Valori Default"]["rendimentoAnnualePacPerc"];
            sessionStorage.setItem("configurations", data);
            configurations = data;
            updateResults();
        })
        .catch(error => console.error('Error fetching JSON:', error));

    function saveInputValues(event) {
        const inputId = event.target.id;
        const inputValue = event.target.value;
        sessionStorage.setItem(inputId, inputValue);
    }

    function updateResults() {

        const etaInizio = parseInt(document.getElementById('etaInizio').value);
        const durata = parseInt(document.getElementById('durata').value);
        const primaRal = parseFloat(document.getElementById('primaRal').value);
        const aumentoRal = parseFloat(document.getElementById('aumentoRal').value);
        const investimentoAnnuale = parseFloat(document.getElementById('investimentoAnnuale').value);
        const contribuzioneDatoreFpnPerc = parseFloat(document.getElementById('contribuzioneDatoreFpnPerc').value) / 100;
        const rendimentoAnnualeFpnPerc = parseFloat(document.getElementById('rendimentoAnnualeFpnPerc').value) / 100;
        const rendimentoAnnualePacPerc = parseFloat(document.getElementById('rendimentoAnnualePacPerc').value) / 100;

        const rows = [];
        let deduzione_1 = 0;
        let fpnVersamenti = 0;
        let fpnMontante = 0;
        let pacVersamenti_1 = 0;
        let pacMontante_1 = 0;
        let pacVersamenti = 0;
        let pacMontante = 0;
        for (let i = 0; i < durata; i++) {
            const eta = etaInizio + i;
            const ral = primaRal + aumentoRal * Math.floor(i / 5);
            const imposta = calcolaImposta(ral);
            const ralDedotta = Math.max(ral - Math.min(investimentoAnnuale, 5164), 0);
            const ralDedotta_1 = Math.max(ral - Math.min(investimentoAnnuale + deduzione_1, 5164), 0);
            const impostaRidotta = calcolaImposta(ralDedotta);
            const impostaRidotta_1 = calcolaImposta(ralDedotta_1);
            const deduzione = imposta - impostaRidotta;            
            const investimentoEntroDeduzione = Math.min(investimentoAnnuale, 5164)
            const investimentoOltreDeduzione = investimentoAnnuale - investimentoEntroDeduzione 
            const investimentoAnnuale_1 = investimentoAnnuale + deduzione_1;  
            const investimentoEntroDeduzione_1 = Math.min(investimentoAnnuale_1, 5164)
            const investimentoOltreDeduzione_1 = investimentoAnnuale_1 - investimentoEntroDeduzione_1
            deduzione_1 = imposta - impostaRidotta_1;
            const contribuzioneDatoreFpn = Math.floor(ral * contribuzioneDatoreFpnPerc);
            const tassazioneVersamentiFpn = Math.max((15 - Math.max(i + 1 - 15, 0) * 0.3), 9).toFixed(2)
            fpnVersamenti = fpnVersamenti + investimentoEntroDeduzione_1 + contribuzioneDatoreFpn;
            fpnMontante = fpnMontante + Math.floor(fpnMontante * rendimentoAnnualeFpnPerc) + investimentoEntroDeduzione_1 + contribuzioneDatoreFpn;
            pacVersamenti_1 = pacVersamenti_1 + investimentoOltreDeduzione_1;
            pacMontante_1 = pacMontante_1 + Math.floor(pacMontante_1 * rendimentoAnnualePacPerc) + investimentoOltreDeduzione_1;
            const fpnPacExit = (fpnMontante - Math.floor(fpnVersamenti * tassazioneVersamentiFpn / 100)) + (pacMontante_1 - Math.floor((pacMontante_1 - pacVersamenti_1) * configurations["Tassazione Pluvalenze Pac"]));
            pacVersamenti = pacVersamenti + investimentoAnnuale;
            pacMontante = pacMontante + Math.floor(pacMontante * rendimentoAnnualePacPerc) + investimentoAnnuale;
            const pacExit = pacMontante - Math.floor((pacMontante - pacVersamenti) * configurations["Tassazione Pluvalenze Pac"]);

            const row = {
                "Età": eta,
                "Durata": i + 1,
                "Ral": ral,
                //"Imposta": imposta,
                //"Ral Dedotta": ralDedotta,
                //"Imposta Ridotta": impostaRidotta,
                //"Deduzione": deduzione,
                //"Ral Dedotta +1": ralDedotta_1,
                //"Imposta Ridotta +1": impostaRidotta_1,
                //"Deduzione +1": deduzione_1,
                //"Contribuzione Datore Fpn": contribuzioneDatoreFpn,
                //"Tassazione Versamenti Fpn": tassazioneVersamentiFpn,
                //"Investimento Annuale": investimentoAnnuale,
                //"Entro Deduzione": investimentoEntroDeduzione,
                //"Oltre Deduzione": investimentoOltreDeduzione,
                //"Investimento Annuale +1": investimentoAnnuale_1,
                //"Entro Deduzione +1": investimentoEntroDeduzione_1,
                //"Oltre Deduzione +1": investimentoOltreDeduzione_1,
                //"Fpn Versamenti": fpnVersamenti,
                //"Fpn Montante": fpnMontante,
                //"Pac Versamenti +1": pacVersamenti_1,
                //"Pac Montante +1": pacMontante_1,
                "FpnPac Exit": fpnPacExit,
                //"Pac Versamenti": pacVersamenti,
                //"Pac Montante": pacMontante,
                "Pac Exit": pacExit
            }
            rows.push(row);
        }

        const table = document.createElement('table');
        table.id = 'result-table';

        const headerRow = table.insertRow();
        for (const key in rows[0]) {
            const headerCell = headerRow.insertCell();
            headerCell.textContent = key;
        }

        rows.forEach(row => {
            const newRow = table.insertRow();
            for (const key in row) {
                const cell = newRow.insertCell();
                cell.textContent = row[key];
            }
        });

        while (resultOutput.firstChild) {
            resultOutput.removeChild(resultOutput.firstChild);
        }
        resultOutput.appendChild(table);
    }

    inputForm.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', saveInputValues);
        input.addEventListener('input', updateResults);
    });

    function loadInputValues() {
        inputForm.querySelectorAll('input').forEach(input => {
            input.value = sessionStorage.getItem(input.id) || 0
        })
    }

    window.addEventListener('load', loadInputValues);

});


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


