import { FinancialModel } from '../models/FinancialModel.js';
import { FinancialView } from '../views/FinancialView.js';

/**
   * FinancialController - Handles events and connects model and view
   */
export class FinancialController {
    constructor() {
        this.model = new FinancialModel();
        this.view = new FinancialView();
        this.initEventListeners();
      }
  
    /**
     * Initializes all event listeners
     */
    initEventListeners() {
      document.getElementById('input-form').addEventListener('input', () => this.updateResults());
      document.getElementById("download-csv").addEventListener("click", () => this.downloadCsv());
      document.getElementById("tipoAumentoRedditoPerc").addEventListener("change", () => this.updateTipoReddito());
      document.getElementById("tipoAumentoRedditoN").addEventListener("change", () => this.updateTipoReddito());
      document.getElementById("tipoAumentoInvestimentoPerc").addEventListener("change", () => this.updateTipoInvestimento());
      document.getElementById("tipoAumentoInvestimentoN").addEventListener("change", () => this.updateTipoInvestimento());
    }
  
    /**
     * Main calculation function that gathers inputs and updates results
     */
    updateResults() {
      // Gather all input values
      const config = {
        durata: parseInt(document.getElementById('durata').value),
        
        // Reddito
        primoReddito: parseFloat(document.getElementById('reddito').value),
        tipoAumentoReddito: document.querySelector('input[name="tipoAumentoReddito"]:checked').value,
        freqAumentoReddito: parseFloat(document.getElementById('freqAumentoReddito').value),
        aumentoReddito: parseFloat(document.getElementById('aumentoReddito').value),
        
        // Investimento
        primoInvestimento: parseFloat(document.getElementById('investimento').value),
        tipoAumentoInvestimento: document.querySelector('input[name="tipoAumentoInvestimento"]:checked').value,
        freqAumentoInvestimento: parseFloat(document.getElementById('freqAumentoInvestimento').value),
        aumentoInvestimento: parseFloat(document.getElementById('aumentoInvestimento').value),
        
        // Varie
        sceltaTfr: document.getElementById('tfr').value,
        quotaDatoreFpPerc: parseFloat(document.getElementById('contribuzioneDatoreFpPerc').value) / 100,
        quotaMinAderentePerc: parseFloat(document.getElementById('quotaMinAderentePerc').value) / 100,
        quotaEccedente: document.getElementById('quotaEccedente').value,
        investireRisparmioFisc: document.getElementById('investireRisparmioFisc').value,
        frequenzaDiCarico: parseFloat(document.getElementById('frequenzaDiCarico').value),
        
        // Rendimenti
        inflazioneAnnualePerc: parseFloat(document.getElementById('inflazione').value) / 100,
        rendimentoAnnualeFpPerc: parseFloat(document.getElementById('rendimentoAnnualeFpPerc').value) / 100,
        rendimentoAnnualePacPerc: parseFloat(document.getElementById('rendimentoAnnualePacPerc').value) / 100
      };
  
      // Calculate results using the model
      const results = this.model.calculateResults(config);
      
      // Update the view
      this.view.createTable(results.results);
      this.view.updateStrategyText(results.strategyText);
      
      // Update CSV content for download
      this.csvContent = this.model.convertToCSV(results.results);
    }
  
    /**
     * Updates income increase type UI
     */
    updateTipoReddito() {
      const aumentoRedditoInput = document.getElementById('aumentoReddito');
      const tipoAumentoReddito = document.querySelector('input[name="tipoAumentoReddito"]:checked').value;
      
      if (tipoAumentoReddito === "%") {
        aumentoRedditoInput.step = "0.1";
        aumentoRedditoInput.value = "10";
      } else if (tipoAumentoReddito === "€") {
        aumentoRedditoInput.step = "100";
        aumentoRedditoInput.value = "5000";
      }
      
      this.updateResults();
    }
  
    /**
     * Updates investment increase type UI
     */
    updateTipoInvestimento() {
      const aumentoInvestimentoInput = document.getElementById('aumentoInvestimento');
      const tipoAumentoInvestimento = document.querySelector('input[name="tipoAumentoInvestimento"]:checked').value;
      
      if (tipoAumentoInvestimento === "%") {
        aumentoInvestimentoInput.step = "0.1";
        aumentoInvestimentoInput.value = "10";
      } else if (tipoAumentoInvestimento === "€") {
        aumentoInvestimentoInput.step = "100";
        aumentoInvestimentoInput.value = "500";
      }
      
      this.updateResults();
    }
  
    /**
     * Downloads CSV data
     */
    downloadCsv() {
      const blob = new Blob([this.csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", "data.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }