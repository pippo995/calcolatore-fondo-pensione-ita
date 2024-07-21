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
        let pacVersamenti = 0;
        let pacMontante = 0;
        for (let i = 1; i < durata; i++) {
            const eta = etaInizio + i - 1;
            const ral = primaRal + aumentoRal * Math.floor(i / 5);
            const ralDedotta = Math.max(ral - Math.min(investimentoAnnuale, 5164), 0);
            const imposta = calcolaImposta(ral);
            const impostaRidotta = calcolaImposta(ralDedotta);
            const deduzione = imposta - impostaRidotta;
            const investimentoEntroDeduzione = Math.min(investimentoAnnuale, 5164)
            const investimentoOltreDeduzione = investimentoAnnuale - investimentoEntroDeduzione
            const contribuzioneDatoreFpn = Math.floor(ral * contribuzioneDatoreFpnPerc);
            const tassazioneVersamentiFpn = Math.max((15 - Math.max(i - 15, 0) * 0.3), 9).toFixed(2)
            pacVersamenti = pacVersamenti + investimentoAnnuale;
            pacMontante = pacMontante + Math.floor(pacMontante * rendimentoAnnualePacPerc) + investimentoAnnuale;
            const pacExit = pacMontante - Math.floor(pacMontante * configurations["Tassazione Pluvalenze Pac"]);

            const row = {
                "Età": eta,
                "Durata": i,
                "Ral": ral,
                "Ral Dedotta": ralDedotta,
                "Imposta": imposta,
                "Imposta Ridotta": impostaRidotta,
                "Deduzione": deduzione,
                "Contribuzione Datore Fpn": contribuzioneDatoreFpn,
                "Tassazione Versamenti Fpn": tassazioneVersamentiFpn,
                "Entro Deduzione": investimentoEntroDeduzione,
                "Oltre Deduzione": investimentoOltreDeduzione,
                "Pac Versamenti": pacVersamenti,
                "Pac Montante": pacMontante,
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


