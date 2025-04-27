/**
 * FinancialView - Handles all UI rendering for the pension fund calculator
 */
export class FinancialView {
  constructor() {
      // Mostra il loader quando l'app si inizializza
      this._showLoading();
  }
  
  /**
   * Creates a results table and renders it
   * @param {Array} results - Calculation results
   */
  createTable(results) {
      if (!results || !results.length) {
          this._showLoading();
          return;
      }
      
      const rows = results.map(result => {
          return Object.entries(result).map(([key, value]) => {
              if (key !== "Anno" && key !== "Tassazione FP" && key !== "Rendimento %") {
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
              
              // Evidenzia i valori positivi e negativi nel rendimento percentuale
              if (key === "Rendimento %" && parseFloat(row[key]) !== 0) {
                  const rendValue = parseFloat(row[key]);
                  if (rendValue > 0) {
                      cell.classList.add('positive-value');
                  } else if (rendValue < 0) {
                      cell.classList.add('negative-value');
                  }
              }
              
              newRow.appendChild(cell);
          }
          tbody.appendChild(newRow);
      });
      table.appendChild(tbody);

      // Replace existing table with animation
      const griddiv = document.getElementById("grid-div");
      griddiv.classList.add('fade-out');
      
      setTimeout(() => {
          // Clear previous content
          while (griddiv.firstChild) {
              griddiv.removeChild(griddiv.firstChild);
          }
          
          // Add new table
          griddiv.appendChild(table);
          griddiv.classList.remove('fade-out');
          griddiv.classList.add('fade-in');
          
          // Remove animation class after animation completes
          setTimeout(() => {
              griddiv.classList.remove('fade-in');
          }, 500);
      }, 300);
  }

  /**
   * Updates pension fund details text in the UI
   * @param {string} text - Details description
   */
  updateStrategyText(text) {
      const strategyDiv = document.getElementById("strategy-div");
      
      // Animazione per l'aggiornamento del testo
      strategyDiv.classList.add('fade-out');
      
      setTimeout(() => {
          strategyDiv.textContent = text;
          strategyDiv.classList.remove('fade-out');
          strategyDiv.classList.add('fade-in');
          
          setTimeout(() => {
              strategyDiv.classList.remove('fade-in');
          }, 500);
      }, 300);
  }

  /**
   * Formats money values with thousand separators and currency symbol
   * @param {number} number - Amount to format
   * @returns {string} Formatted money string
   */
  formatMoney(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
  }
  
  /**
   * Mostra l'indicatore di caricamento nella griglia
   * @private
   */
  _showLoading() {
      const griddiv = document.getElementById("grid-div");
      
      // Clear previous content
      while (griddiv.firstChild) {
          griddiv.removeChild(griddiv.firstChild);
      }
      
      // Create loading indicator
      const loadingContainer = document.createElement('div');
      loadingContainer.className = 'loading-container';
      
      const spinner = document.createElement('div');
      spinner.className = 'loading-spinner';
      
      const loadingText = document.createElement('div');
      loadingText.className = 'loading-text';
      loadingText.textContent = 'Calcolo in corso...';
      
      loadingContainer.appendChild(spinner);
      loadingContainer.appendChild(loadingText);
      
      griddiv.appendChild(loadingContainer);
  }
}