/**
   * FinancialView - Handles all UI rendering
   */
export class FinancialView {
    /**
     * Creates a results table and renders it
     * @param {Array} results - Calculation results
     */
    createTable(results) {
      if (!results.length) return;
      
      const rows = results.map(result => {
        return Object.entries(result).map(([key, value]) => {
          if (key !== "Anno") {
            value = this.formatMoney(value);
          }
          return [key, value];
        });
      }).map(entryArray => Object.fromEntries(entryArray));
  
      const table = document.createElement('table');
      table.id = 'output-table';
  
      // Create table header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      for (const key in rows[0]) {
        const headerCell = document.createElement('th');
        headerCell.textContent = key;
        headerRow.appendChild(headerCell);
      }
      thead.appendChild(headerRow);
      table.appendChild(thead);
  
      // Create table body
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
  
      // Replace existing table
      const griddiv = document.getElementById("grid-div");
      while (griddiv.firstChild) {
        griddiv.removeChild(griddiv.firstChild);
      }
      griddiv.appendChild(table);
    }
  
    /**
     * Updates strategy text in the UI
     * @param {string} text - Strategy description
     */
    updateStrategyText(text) {
      document.getElementById("strategy-div").textContent = text;
    }
  
    /**
     * Formats money values with thousand separators and currency symbol
     * @param {number} number - Amount to format
     * @returns {string} Formatted money string
     */
    formatMoney(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
    }
  }