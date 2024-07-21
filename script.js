document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('pac-form');
    const resultOutput = document.getElementById('result-output');

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

    function updateResults() {

        fetch('configurations.json')
            .then(response => response.json())
            .then(data => {
                const aliquoteIrpef = data["Aliquote Irpef"];
                const tassazioneVersamentiFpn = data["Tassazione Versamenti Fpn"];
                const stimaRendimentoAnnuoFpn = data["Stima Rendimento Annuo Fpn"];
                const stimaRendimentoAnnuoPac = data["Stima Rendimento Annuo Pac"];
                const tassazionePlusvalenzePac = data["Tassazione Pluvalenze Pac"];
            })
            .catch(error => console.error('Error fetching JSON:', error));

        const etaInizio = parseInt(document.getElementById('etaInizio').value);
        const durata = parseInt(document.getElementById('durata').value);
        const primaRal = parseFloat(document.getElementById('primaRal').value);
        const aumentoRal = parseFloat(document.getElementById('aumentoRal').value);
        const investimentoAnnuale = parseFloat(document.getElementById('investimentoAnnuale').value);
        const contribuzioneDatoreFpnPerc = parseFloat(document.getElementById('contribuzioneDatoreFpnPerc').value) / 100;

        const rows = [];
        for (let i = 1; i < durata; i++) {
            const eta = etaInizio + i
            const ral = primaRal + aumentoRal * Math.floor(i / 5);
            const ralDedotta = Math.max(ral - Math.min(investimentoAnnuale, 5164), 0);
            const imposta = calcolaImposta(ral);
            const impostaRidotta = calcolaImposta(ralDedotta);
            const deduzione = imposta - impostaRidotta;
            const contribuzioneDatoreFpn = Math.floor(ral * contribuzioneDatoreFpnPerc);
            const tassazioneVersamentiFpn = 0;

            const row = { 
                "Età": eta,
                "Ral": ral, 
                "Ral Dedotta": ralDedotta, 
                "imposta": imposta, 
                "impostaRidotta": impostaRidotta, 
                "deduzione": deduzione, 
                "contribuzioneDatoreFpn": contribuzioneDatoreFpn 
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

    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updateResults);
    });

    updateResults();
});
