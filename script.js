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

    function calcolaDetrazione(RAL) {
        let detrazione;
        if (RAL <= 15000) {
            detrazione = 1955;
        } else if (RAL > 1500 && RAL <= 28000) {
            detrazione = 1910 + (1195 * ((28000 - RAL) / 13000));
        } else if (RAL > 28000 && RAL <= 50000) {
            detrazione = 950 + ((50000 - RAL) / 22000);
        } else {
            detrazione = 0;
        }

        return Math.floor(detrazione)
    }


    // Function to perform calculations and update results
    function updateResults() {
        // Retrieve input values
        const ageStart = parseInt(document.getElementById('ageStart').value);
        const duration = parseInt(document.getElementById('duration').value);
        const firstRal = parseFloat(document.getElementById('firstRAL').value);
        const increaseRal = parseFloat(document.getElementById('increaseRAL').value);
        const investmentAnnual = parseFloat(document.getElementById('investmentAnnual').value);
        const contributionEmployer_perc = parseFloat(document.getElementById('contributionEmployer').value) / 100;
        const taxBaseFPN = parseFloat(document.getElementById('taxBaseFPN').value) / 100;
        const taxAnticipationFPN = parseFloat(document.getElementById('taxAnticipationFPN').value) / 100;
        const annualReturnFPN = parseFloat(document.getElementById('annualReturnFPN').value) / 100;
        const annualReturnPAC = parseFloat(document.getElementById('annualReturnPAC').value) / 100;
        const taxCapitalGainsPAC = parseFloat(document.getElementById('taxCapitalGainsPAC').value) / 100;
        const tfr = parseFloat(document.getElementById('tfr').value);
        const increaseTFR = parseFloat(document.getElementById('increaseTFR').value);


        // Calculate values for each year
        const rows = [];
        for (let i = 1; i < duration; i++) {
            const age = ageStart + i
            const ral = firstRal + increaseRal * Math.floor(i / 5);
            const ralDeducted = Math.max(ral - Math.max(investmentAnnual, 5164), 0);
            const imposta = calcolaImposta(ral);
            const impostaRidotta = calcolaImposta(ralDeducted);
            const deduzione = imposta - impostaRidotta;
            const contributionEmployer = ral * contributionEmployer_perc;

            const row = { age: age, ral: ral, ralDeducted, imposta: imposta, impostaRidotta: impostaRidotta, deduzione: deduzione, contributionEmployer: contributionEmployer }
            rows.push(row);
        }

        // Create the table element
        const table = document.createElement('table');
        table.id = 'result-table';

        // Create table header row dynamically
        const headerRow = table.insertRow();
        for (const key in rows[0]) {
            const headerCell = headerRow.insertCell();
            headerCell.textContent = key;
        }

        // Populate the table with data
        rows.forEach(row => {
            const newRow = table.insertRow();
            for (const key in row) {
                const cell = newRow.insertCell();
                cell.textContent = row[key];
            }
        });

        // Append the table to the result-output div
        while (resultOutput.firstChild) {
            resultOutput.removeChild(resultOutput.firstChild);
        }
        resultOutput.appendChild(table);
    }

    // Attach input event listeners to all input elements
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updateResults);
    });

    // Initial calculation
    updateResults();
});
