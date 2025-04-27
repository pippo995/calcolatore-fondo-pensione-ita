import { FINANCIAL_CONSTANTS } from '../constants/financial-constants.js';

/**
 * FinancialModel - Contains all business logic and calculations for the pension fund
 */
export class FinancialModel {
    constructor() {
      this.csvContent = "data:text/csv;charset=utf-8,";
    }
  
    /**
     * Calculates all financial scenarios based on input parameters
     * @param {Object} config - Configuration object with all input parameters
     * @returns {Object} Results and strategy information
     */
    calculateResults(config) {
      const {
        durata, primoReddito, tipoAumentoReddito, freqAumentoReddito, aumentoReddito,
        primoInvestimento, tipoAumentoInvestimento, freqAumentoInvestimento, aumentoInvestimento,
        calcolaTfr, quotaDatoreFpPerc, quotaMinAderentePerc, 
        inflazioneAnnualePerc, rendimentoAnnualeFpPerc
      } = config;
  
      let reddito = primoReddito;
      let investimento = primoInvestimento;
      let risparmioImposta_prevAnno = 0;
  
      // Initialize accumulators
      const accumulators = this._initializeAccumulators();
      const results = [];
  
      for (let anno = 0; anno < durata; anno++) {
        // Update reddito and investimento based on frequency and type
        reddito = this._calculateValue(
          reddito, anno, freqAumentoReddito, tipoAumentoReddito, aumentoReddito
        );
        
        investimento = this._calculateValue(
          investimento, anno, freqAumentoInvestimento, tipoAumentoInvestimento, aumentoInvestimento
        );
  
        // TFR calculation - simplified to yes/no
        const tfr = calcolaTfr === 'Si' ? reddito * 0.06907 : 0;
        const tfrMontante = this._calculateTfrFp(
          tfr, accumulators, rendimentoAnnualeFpPerc
        );
  
        // Tax savings calculation
        const quotaDatoreFp = reddito * quotaDatoreFpPerc;
        const limiteDeduzioneFpEffettivo = Math.max(FINANCIAL_CONSTANTS.LIMITE_DEDUZIONE_FP - quotaDatoreFp, 0);
  
        const redditoImponibile = reddito * (1 - FINANCIAL_CONSTANTS.TASSAZIONE_INPS);
        const detrazioneDipendente = this.calcolaDetrazioniDipendente(redditoImponibile);
        const impostaLorda = this.calcolaImposta(redditoImponibile);
        const impostaNetta = Math.max(impostaLorda - detrazioneDipendente, 0);
  
        // Tax saving calculations - always using previous year's tax savings
        const risparmioImposta = anno === 0 ? 0 : risparmioImposta_prevAnno;
        
        // Calculate next year's tax savings for future use
        const deduzione = Math.min(investimento, limiteDeduzioneFpEffettivo);
        const redditoDedotto = Math.max(redditoImponibile - deduzione, 0);
        const impostaLordaDedotta = this.calcolaImposta(redditoDedotto);
        const impostaNettaDedotta = Math.max(impostaLordaDedotta - detrazioneDipendente, 0);
        risparmioImposta_prevAnno = impostaNetta - impostaNettaDedotta;
  
        // Pension fund calculation - simplified with end-of-year contribution only
        const fpExit = this._calculatePensionFund(
          investimento, risparmioImposta, quotaDatoreFp,
          rendimentoAnnualeFpPerc, anno,
          accumulators, tfrMontante
        );
        
        // Calculate yield percentage
        const rendimentoPercentuale = anno === 0 ? 0 : 
          (accumulators.fpMontante / accumulators.fpVersamenti - 1) * 100;
  
        // Store results for this year
        results.push({
          "Anno": anno + 1,
          "Reddito": Math.round(reddito),
          "Investimento": Math.round(investimento),
          "TFR": Math.round(tfr),
          "Ris. Fiscale": Math.round(risparmioImposta),
          "Quota Datore": Math.round(quotaDatoreFp),
          "Montante FP": Math.round(accumulators.fpMontante),
          "Versamenti FP": Math.round(accumulators.fpVersamenti),
          "Rendimento %": rendimentoPercentuale.toFixed(2) + "%",
          "Tassazione FP": (this.calcolaTassazioneFp(anno) * 100).toFixed(1) + "%",
          "Exit FP": Math.round(fpExit)
        });
      }
  
      // Generate details about pension fund
      const strategyText = this._generateDetailsText(accumulators, durata);
  
      return {
        results,
        strategyText
      };
    }
  
    /**
     * Initializes accumulators for financial calculations
     * @returns {Object} Empty accumulators
     */
    _initializeAccumulators() {
      return {
        tfrAziendaVersamenti: 0,
        tfrAziendaMontante: 0,
        tfrFpVersamenti: 0,
        tfrFpMontante: 0,
        fpVersamenti: 0,
        fpMontante: 0
      };
    }
  
    /**
     * Calculates value with periodic increases
     * @param {number} baseValue - Initial value
     * @param {number} year - Current year
     * @param {number} frequency - Frequency of increases
     * @param {string} type - Type of increase (% or €)
     * @param {number} amount - Amount of increase
     * @returns {number} Updated value
     */
    _calculateValue(baseValue, year, frequency, type, amount) {
      if (year > 0 && year % frequency === 0) {
        if (type === "%") {
          return baseValue + baseValue * amount / 100;
        } else {
          return baseValue + amount;
        }
      }
      return baseValue;
    }
  
    /**
     * Calculates TFR (severance pay) invested in pension fund
     * @param {number} tfr - TFR amount
     * @param {Object} accumulators - Accumulator values
     * @param {number} rendimentoAnnualeFpPerc - Annual pension fund return
     * @returns {number} TFR montante in pension fund
     */
    _calculateTfrFp(tfr, accumulators, rendimentoAnnualeFpPerc) {
      if (tfr > 0) {
        accumulators.tfrFpVersamenti += tfr;
        accumulators.tfrFpMontante = accumulators.tfrFpMontante * 
          (1 + rendimentoAnnualeFpPerc) + tfr;
      }
      
      return accumulators.tfrFpMontante;
    }
  
    /**
     * Calculates tax savings
     * @param {number} redditoImponibile - Taxable income
     * @param {number} investimento - Investment amount
     * @param {number} limiteDeduzioneFpEffettivo - Effective deduction limit
     * @param {number} detrazioneDipendente - Employee tax deduction
     * @param {number} impostaNetta - Net tax
     * @param {string} quotaEccedente - Excess quota type
     * @param {string} investireRisparmioFisc - Tax savings investment choice
     * @returns {Object} Tax savings calculation results
     */
    _calculateTaxSavings(
      redditoImponibile, investimento, limiteDeduzioneFpEffettivo, 
      detrazioneDipendente, impostaNetta, quotaEccedente, investireRisparmioFisc
    ) {
      // Tax savings without reinvestment
      const deduzione_0 = Math.min(investimento, limiteDeduzioneFpEffettivo);
      const redditoDedotto_0 = Math.max(redditoImponibile - deduzione_0, 0);
      const impostaLordaDedotta_0 = this.calcolaImposta(redditoDedotto_0);
      const impostaNettaDedotta_0 = Math.max(impostaLordaDedotta_0 - detrazioneDipendente, 0);
      const risparmioImposta_0 = impostaNetta - impostaNettaDedotta_0;
  
      // Static variable simulation for first year
      let risparmioImposta_1 = risparmioImposta_0;
  
      // Taxable income calculation based on excess quota
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
  
      // Tax savings based on investment choice
      let risparmioImposta;
      switch (investireRisparmioFisc) {
        case "Anno corrente":
          risparmioImposta = risparmioImposta_0;
          break;
        case "Anno successivo":
          risparmioImposta = risparmioImposta_1;
          break;
        default:
          risparmioImposta = 0;
          break;
      }
  
      // Tax savings with reinvestment
      const detrazioneDipendente_1 = this.calcolaDetrazioniDipendente(redditoImponibile_1);
      const deduzione_1 = Math.min(investimento + risparmioImposta_1, limiteDeduzioneFpEffettivo);
      const redditoDedotto_1 = Math.max(redditoImponibile - deduzione_1, 0);
      const impostaLordaDedotta_1 = this.calcolaImposta(redditoDedotto_1);
      const impostaNettaDedotta_1 = impostaLordaDedotta_1 - detrazioneDipendente_1;
      risparmioImposta_1 = impostaNetta - impostaNettaDedotta_1;
  
      return {
        risparmioImposta,
        risparmioImposta_1
      };
    }
  
    /**
     * Calculates pension fund investment
     * @param {number} investimento - Base investment amount
     * @param {number} risparmioImposta - Tax savings
     * @param {number} quotaDatoreFp - Employer contribution
     * @param {number} rendimentoAnnualeFpPerc - Annual pension fund return
     * @param {number} anno - Current year
     * @param {Object} accumulators - Accumulator values
     * @param {number} tfrMontante - TFR accumulated value
     * @returns {number} Pension fund exit value
     */
    _calculatePensionFund(
      investimento, risparmioImposta, quotaDatoreFp,
      rendimentoAnnualeFpPerc, anno,
      accumulators, tfrMontante
    ) {
      // Existing capital grows with annual return
      accumulators.fpMontante = accumulators.fpMontante * (1 + rendimentoAnnualeFpPerc);
      
      // Add new investments at end of year (no partial year interest)
      const investimentoFp = investimento + risparmioImposta + quotaDatoreFp;
      accumulators.fpVersamenti += investimentoFp;
      accumulators.fpMontante += investimentoFp;
      
      // Calculate exit value (apply taxation)
      const totalVersamenti = accumulators.fpVersamenti + accumulators.tfrFpVersamenti;
      const totalMontante = accumulators.fpMontante + tfrMontante;
      
      const fpExit = totalMontante - totalVersamenti * this.calcolaTassazioneFp(anno);
      
      return fpExit;
    }
  
    /**
     * Generates detailed text about the pension fund
     * @param {Object} accumulators - Accumulator values
     * @param {number} durata - Investment duration
     * @returns {string} Details text
     */
    _generateDetailsText(accumulators, durata) {
      const totalContributions = Math.round(accumulators.fpVersamenti + accumulators.tfrFpVersamenti);
      const totalValue = Math.round(accumulators.fpMontante + accumulators.tfrFpMontante);
      const profits = Math.round(totalValue - totalContributions);
      const taxRate = (this.calcolaTassazioneFp(durata - 1) * 100).toFixed(1);
      const taxAmount = Math.round(totalContributions * this.calcolaTassazioneFp(durata - 1));
      const rendimentoPercentuale = ((totalValue / totalContributions - 1) * 100).toFixed(2);
      
      return `Alla fine del periodo di investimento (${durata} anni), il fondo pensione avrà accumulato un capitale lordo di ${this.formatMoney(totalValue)} a fronte di versamenti totali di ${this.formatMoney(totalContributions)}, generando un profitto di ${this.formatMoney(profits)} (rendimento del ${rendimentoPercentuale}%). La tassazione applicata al momento del riscatto sarà del ${taxRate}%, pari a ${this.formatMoney(taxAmount)}.`;
    }
  
    /**
     * Calculates pension fund taxation based on duration
     * @param {number} durata - Investment duration
     * @returns {number} Taxation rate
     */
    calcolaTassazioneFp(durata) {
      return Math.max((15 - Math.max(durata + 1 - 15, 0) * 0.3), 9).toFixed(2) / 100;
    }
  
    /**
     * Calculates TFR taxation based on contributions and year
     * @param {number} tfrVersamenti - TFR contributions
     * @param {number} anno - Current year
     * @returns {number} Taxation rate
     */
    calcolaTassazioneTfr(tfrVersamenti, anno) {
      if (tfrVersamenti > 0 && anno > 0) {
        const tfrRiferimento = tfrVersamenti * 12 / anno;
        const tfrRiferimentoImposta = this.calcolaImposta(tfrRiferimento);
        return tfrRiferimentoImposta / tfrRiferimento;
      }
      return 0;
    }
  
    /**
     * Calculates income tax based on progressive brackets
     * @param {number} reddito - Income amount
     * @returns {number} Tax amount
     */
    calcolaImposta(reddito) {
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
  
    /**
     * Calculates employee tax deductions based on income
     * @param {number} reddito - Income amount
     * @returns {number} Deduction amount
     */
    calcolaDetrazioniDipendente(reddito) {
      let detrazione;
  
      if (reddito <= 15000) {
        detrazione = 1880;
      } else if (reddito <= 28000) {
        const rapporto = (28000 - reddito) / 13000;
        detrazione = 1910 + (1190 * rapporto);
      } else if (reddito <= 50000) {
        const rapporto = (50000 - reddito) / 22000;
        detrazione = 1910 * rapporto;
      } else {
        detrazione = 0;
      }
  
      if (reddito >= 25000 && reddito <= 35000) {
        detrazione += 65;
      }
  
      return detrazione;
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
     * Converts results to CSV format
     * @param {Array} rows - Results data
     * @returns {string} CSV formatted string
     */
    convertToCSV(rows) {
      if (!rows.length) return '';
      
      let str = '';
      const headers = Object.keys(rows[0]).join(',');
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
  }