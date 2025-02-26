import { FINANCIAL_CONSTANTS } from '../constants/financial-constants.js';

/**
 * FinancialModel - Contains all business logic and calculations
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
        sceltaTfr, quotaDatoreFpPerc, quotaMinAderentePerc, quotaEccedente, 
        investireRisparmioFisc, frequenzaDiCarico, inflazioneAnnualePerc, 
        rendimentoAnnualeFpPerc, rendimentoAnnualePacPerc
      } = config;
  
      let reddito = primoReddito;
      let investimento = primoInvestimento;
      let risparmioImposta_1 = 0;
  
      // Initialize accumulators
      const accumulators = this._initializeAccumulators();
      const results = [];
      const entroDeduzioneFP = [];
      const oltreDeduzioneFP = [];
      const entroDeduzionePAC = [];
      const oltreDeduzionePAC = [];
  
      for (let anno = 0; anno < durata; anno++) {
        // Update reddito and investimento based on frequency and type
        reddito = this._calculateValue(
          reddito, anno, freqAumentoReddito, tipoAumentoReddito, aumentoReddito
        );
        
        investimento = this._calculateValue(
          investimento, anno, freqAumentoInvestimento, tipoAumentoInvestimento, aumentoInvestimento
        );
  
        // TFR calculation
        const tfr = reddito * 0.06907;
        const tfrResults = this._calculateTfr(
          tfr, sceltaTfr, accumulators, anno, inflazioneAnnualePerc, rendimentoAnnualeFpPerc
        );
  
        // Tax savings calculation
        const quotaDatoreFp = reddito * quotaDatoreFpPerc;
        const quotaDatoreFpEccedente = Math.max(quotaDatoreFp - FINANCIAL_CONSTANTS.LIMITE_DEDUZIONE_FP, 0);
        const limiteDeduzioneFpEffettivo = Math.max(FINANCIAL_CONSTANTS.LIMITE_DEDUZIONE_FP - quotaDatoreFp, 0);
  
        const redditoImponibile = reddito * (1 - FINANCIAL_CONSTANTS.TASSAZIONE_INPS);
        const detrazioneDipendente = this.calcolaDetrazioniDipendente(redditoImponibile);
        const impostaLorda = this.calcolaImposta(redditoImponibile);
        const impostaNetta = Math.max(impostaLorda - detrazioneDipendente, 0);
  
        // Tax saving calculations
        const taxResults = this._calculateTaxSavings(
          redditoImponibile, investimento, limiteDeduzioneFpEffettivo, 
          detrazioneDipendente, impostaNetta, quotaEccedente, investireRisparmioFisc
        );
        
        risparmioImposta_1 = taxResults.risparmioImposta_1;
        const risparmioImposta = taxResults.risparmioImposta;
  
        // Investment strategy calculations
        const investResults = this._calculateInvestmentStrategies(
          investimento, risparmioImposta, quotaDatoreFp, limiteDeduzioneFpEffettivo,
          rendimentoAnnualeFpPerc, rendimentoAnnualePacPerc, frequenzaDiCarico, durata, anno,
          accumulators, tfrResults.tfrExit, entroDeduzioneFP, oltreDeduzioneFP,
          entroDeduzionePAC, oltreDeduzionePAC
        );
  
        // Store results for this year
        results.push({
          "Anno": anno + 1,
          "Reddito": Math.round(reddito),
          "Investimento": Math.round(investimento),
          "TFR": Math.round(tfr),
          "Ris. Fiscale": Math.round(risparmioImposta),
          "Quota Datore": Math.round(quotaDatoreFp),
          "Exit FP": Math.round(investResults.fpExit),
          "Exit PAC": Math.round(investResults.pacExit),
          "Exit Mix-1": Math.round(investResults.fpPacMix1Exit),
          "Exit Mix-2": Math.round(investResults.fpPacMix2Exit),
        });
      }
  
      // Generate strategy strings
      const strategyInfo = this._generateStrategyText(
        entroDeduzioneFP, entroDeduzionePAC, oltreDeduzioneFP, oltreDeduzionePAC
      );
  
      return {
        results,
        entroDeduzioneFP,
        oltreDeduzioneFP,
        entroDeduzionePAC,
        oltreDeduzionePAC,
        strategyText: strategyInfo.stringEntro,
        strategyTextOltre: strategyInfo.stringOltre
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
        fpMontante: 0,
        pacVersamenti: 0,
        pacMontante: 0,
        fpVersamentiMix1: 0,
        fpMontanteMix1: 0,
        pacVersamentiMix1: 0,
        pacMontanteMix1: 0,
        fpVersamentiMix2: 0,
        fpMontanteMix2: 0,
        pacVersamentiMix2: 0,
        pacMontanteMix2: 0
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
     * Calculates TFR (severance pay) based on configuration
     * @param {number} tfr - TFR amount
     * @param {string} sceltaTfr - TFR choice
     * @param {Object} accumulators - Accumulator values
     * @param {number} anno - Current year
     * @param {number} inflazioneAnnualePerc - Annual inflation
     * @param {number} rendimentoAnnualeFpPerc - Annual pension fund return
     * @returns {Object} TFR calculation results
     */
    _calculateTfr(tfr, sceltaTfr, accumulators, anno, inflazioneAnnualePerc, rendimentoAnnualeFpPerc) {
      switch (sceltaTfr) {
        case "Azienda":
          accumulators.tfrAziendaVersamenti += tfr;
          accumulators.tfrAziendaMontante = accumulators.tfrAziendaMontante * 
            (1 + (inflazioneAnnualePerc * 0.75 + 0.015) * 0.83) + tfr;
          break;
        case "Fondo Pensione":
          accumulators.tfrFpVersamenti += tfr;
          accumulators.tfrFpMontante = accumulators.tfrFpMontante * 
            (1 + rendimentoAnnualeFpPerc) + tfr * (1 + rendimentoAnnualeFpPerc * 0.375);
          break;
        default:
          tfr = 0;
          break;
      }
  
      const tfrAziendaExit = accumulators.tfrAziendaMontante - 
        accumulators.tfrAziendaMontante * this.calcolaTassazioneTfr(accumulators.tfrAziendaVersamenti, anno);
      const tfrFpExit = accumulators.tfrFpMontante - 
        accumulators.tfrFpVersamenti * this.calcolaTassazioneFp(anno);
      const tfrExit = tfrAziendaExit + tfrFpExit;
  
      return {
        tfrAziendaExit,
        tfrFpExit,
        tfrExit
      };
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
          risparmioImposta = risparmioImposta_0; // This should be risparmioImpostaRic which is undefined in original code
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
     * Calculates different investment strategies
     * @param {Object} params - Various parameters for investment calculations
     * @returns {Object} Results of different investment strategies
     */
    _calculateInvestmentStrategies(
      investimento, risparmioImposta, quotaDatoreFp, limiteDeduzioneFpEffettivo,
      rendimentoAnnualeFpPerc, rendimentoAnnualePacPerc, frequenzaDiCarico, durata, anno,
      accumulators, tfrExit, entroDeduzioneFP, oltreDeduzioneFP,
      entroDeduzionePAC, oltreDeduzionePAC
    ) {
      // Investment within deduction limits
      const investimentoEntroDeduzione = Math.min(investimento, limiteDeduzioneFpEffettivo);
      const investimentoOltreDeduzione = investimento - investimentoEntroDeduzione;
  
      // Pension fund investment with tax savings and employer contribution
      const investimentoFp = investimento + risparmioImposta + quotaDatoreFp;
      const investimentoFpEntroDeduzione = Math.min(investimentoFp, limiteDeduzioneFpEffettivo);
      const investimentoFpOltreDeduzione = investimentoFp - investimentoFpEntroDeduzione;
  
      // Strategy 1: Pension Fund only
      accumulators.fpVersamenti += investimentoFp;
      accumulators.fpMontante = accumulators.fpMontante * (1 + rendimentoAnnualeFpPerc) + 
        investimentoFp * (1 + rendimentoAnnualeFpPerc * frequenzaDiCarico);
      const fpExit = accumulators.fpMontante - 
        accumulators.fpVersamenti * this.calcolaTassazioneFp(anno) + tfrExit;
  
      // Strategy 2: PAC only
      accumulators.pacVersamenti += investimento;
      accumulators.pacMontante = accumulators.pacMontante * (1 + rendimentoAnnualePacPerc) + 
        investimento * (1 + rendimentoAnnualePacPerc * frequenzaDiCarico);
      const pacExit = accumulators.pacMontante - 
        (accumulators.pacMontante - accumulators.pacVersamenti) * 
        FINANCIAL_CONSTANTS.TASSAZIONE_RENDITE_PAC + tfrExit;
  
      // Strategy 3: Mix 1 - FP up to deduction limit, then PAC
      accumulators.fpVersamentiMix1 += investimentoFpEntroDeduzione;
      accumulators.fpMontanteMix1 = accumulators.fpMontanteMix1 * (1 + rendimentoAnnualeFpPerc) + 
        investimentoFpEntroDeduzione * (1 + rendimentoAnnualeFpPerc * frequenzaDiCarico);
      accumulators.pacVersamentiMix1 += investimentoFpOltreDeduzione;
      accumulators.pacMontanteMix1 = accumulators.pacMontanteMix1 * (1 + rendimentoAnnualePacPerc) + 
        investimentoFpOltreDeduzione * (1 + rendimentoAnnualePacPerc * frequenzaDiCarico);
      
      const fpMix1Exit = accumulators.fpMontanteMix1 - 
        accumulators.fpVersamentiMix1 * this.calcolaTassazioneFp(anno);
      const pacMix1Exit = accumulators.pacMontanteMix1 - 
        (accumulators.pacMontanteMix1 - accumulators.pacVersamentiMix1) * 
        FINANCIAL_CONSTANTS.TASSAZIONE_RENDITE_PAC;
      const fpPacMix1Exit = fpMix1Exit + pacMix1Exit + tfrExit;
  
      // Strategy 4: Mix 2 - Optimized allocation based on return
      const strategyMix2 = this._calculateOptimizedMix(
        investimentoEntroDeduzione, investimentoOltreDeduzione,
        investimentoFpEntroDeduzione, investimentoFpOltreDeduzione,
        investimentoFp, investimento, quotaDatoreFp, risparmioImposta,
        rendimentoAnnualeFpPerc, rendimentoAnnualePacPerc, frequenzaDiCarico,
        durata, anno, accumulators, entroDeduzioneFP, oltreDeduzioneFP,
        entroDeduzionePAC, oltreDeduzionePAC
      );
  
      const fpPacMix2Exit = (accumulators.fpMontanteMix2 - 
        accumulators.fpVersamentiMix2 * this.calcolaTassazioneFp(durata - 1)) + 
        (accumulators.pacMontanteMix2 - (accumulators.pacMontanteMix2 - accumulators.pacVersamentiMix2) * 
        FINANCIAL_CONSTANTS.TASSAZIONE_RENDITE_PAC) + tfrExit;
  
      return {
        fpExit,
        pacExit,
        fpPacMix1Exit,
        fpPacMix2Exit
      };
    }
  
    /**
     * Calculates optimal investment mix based on returns
     * @param {Object} params - Various parameters for optimization
     * @returns {Object} Optimal investment allocation
     */
    _calculateOptimizedMix(
      investimentoEntroDeduzione, investimentoOltreDeduzione,
      investimentoFpEntroDeduzione, investimentoFpOltreDeduzione,
      investimentoFp, investimento, quotaDatoreFp, risparmioImposta,
      rendimentoAnnualeFpPerc, rendimentoAnnualePacPerc, frequenzaDiCarico,
      durata, anno, accumulators, entroDeduzioneFP, oltreDeduzioneFP,
      entroDeduzionePAC, oltreDeduzionePAC
    ) {
      // Calculate compound returns for comparison
      const rendimentoCompostoFPPerc = (1 + rendimentoAnnualeFpPerc) ** (durata - anno - 1);
      const rendimentoCompostoPACPerc = (1 + rendimentoAnnualePacPerc) ** (durata - anno - 1);
  
      const investimentoAvanzo = investimentoEntroDeduzione + quotaDatoreFp + risparmioImposta - investimentoFpEntroDeduzione;
      
      // Within deduction limit comparison
      const interesseCompostoFPFPEntro = investimentoFpEntroDeduzione * rendimentoCompostoFPPerc + 
        (investimentoFpEntroDeduzione * rendimentoAnnualeFpPerc * frequenzaDiCarico) - 
        (investimentoFpEntroDeduzione * this.calcolaTassazioneFp(durata - 1));
      
      const rendimentoCompostoFPPACEntro = investimentoAvanzo * rendimentoCompostoPACPerc + 
        (investimentoAvanzo * rendimentoAnnualePacPerc * frequenzaDiCarico);
      const interesseCompostoFPPACEntro = rendimentoCompostoFPPACEntro - 
        ((rendimentoCompostoFPPACEntro - investimentoAvanzo) * FINANCIAL_CONSTANTS.TASSAZIONE_RENDITE_PAC);
      const interesseCompostoFPEntro = interesseCompostoFPFPEntro + interesseCompostoFPPACEntro;
  
      const rendimentoCompostoPACEntro = investimentoEntroDeduzione * rendimentoCompostoPACPerc + 
        (investimentoEntroDeduzione * rendimentoAnnualePacPerc * frequenzaDiCarico);
      const interesseCompostoPACEntro = rendimentoCompostoPACEntro - 
        ((rendimentoCompostoPACEntro - investimentoEntroDeduzione) * FINANCIAL_CONSTANTS.TASSAZIONE_RENDITE_PAC);
  
      // Beyond deduction limit comparison
      const interesseCompostoFPOltre = investimentoOltreDeduzione * rendimentoCompostoFPPerc + 
        (investimentoOltreDeduzione * rendimentoAnnualeFpPerc * frequenzaDiCarico) - 
        (investimentoOltreDeduzione * this.calcolaTassazioneFp(durata - 1));
  
      const rendimentoCompostoPACOltre = investimentoOltreDeduzione * rendimentoCompostoPACPerc + 
        (investimentoOltreDeduzione * rendimentoAnnualePacPerc * frequenzaDiCarico);
      const interesseCompostoPACOltre = rendimentoCompostoPACOltre - 
        ((rendimentoCompostoPACOltre - investimentoOltreDeduzione) * FINANCIAL_CONSTANTS.TASSAZIONE_RENDITE_PAC);
  
      // Choose the best strategy based on return comparison
      if (interesseCompostoPACEntro > interesseCompostoFPEntro) {
        accumulators.fpVersamentiMix2 += 1;
        accumulators.fpMontanteMix2 = accumulators.fpMontanteMix2 * (1 + rendimentoAnnualeFpPerc) + 
          1 * (1 + rendimentoAnnualeFpPerc * frequenzaDiCarico);
        accumulators.pacVersamentiMix2 += investimento - 1;
        accumulators.pacMontanteMix2 = accumulators.pacMontanteMix2 * (1 + rendimentoAnnualePacPerc) + 
          (investimento - 1) * (1 + rendimentoAnnualePacPerc * frequenzaDiCarico);
        entroDeduzionePAC.push(anno);
        if (interesseCompostoPACOltre > 0) {
          oltreDeduzionePAC.push(anno);
        }
      } else {
        if (interesseCompostoPACOltre > interesseCompostoFPOltre) {
          accumulators.fpVersamentiMix2 += investimentoFpEntroDeduzione;
          accumulators.fpMontanteMix2 = accumulators.fpMontanteMix2 * (1 + rendimentoAnnualeFpPerc) + 
            investimentoFpEntroDeduzione * (1 + rendimentoAnnualeFpPerc * frequenzaDiCarico);
          accumulators.pacVersamentiMix2 += investimentoFpOltreDeduzione;
          accumulators.pacMontanteMix2 = accumulators.pacMontanteMix2 * (1 + rendimentoAnnualePacPerc) + 
            investimentoFpOltreDeduzione * (1 + rendimentoAnnualePacPerc * frequenzaDiCarico);
          entroDeduzioneFP.push(anno);
          oltreDeduzionePAC.push(anno);
        } else {
          accumulators.fpVersamentiMix2 += investimentoFp;
          accumulators.fpMontanteMix2 = accumulators.fpMontanteMix2 * (1 + rendimentoAnnualeFpPerc) + 
            investimentoFp * (1 + rendimentoAnnualeFpPerc * frequenzaDiCarico);
          accumulators.pacVersamentiMix2 = accumulators.pacVersamentiMix2;
          accumulators.pacMontanteMix2 = accumulators.pacMontanteMix2 * (1 + rendimentoAnnualePacPerc);
          entroDeduzioneFP.push(anno);
          if (interesseCompostoPACOltre > 0) {
            oltreDeduzioneFP.push(anno);
          }
        }
      }
    }
  
    /**
     * Generates strategy text from year arrays
     * @param {Array} entroDeduzioneFP - Years to invest in pension fund within deduction limit
     * @param {Array} entroDeduzionePAC - Years to invest in PAC within deduction limit
     * @param {Array} oltreDeduzioneFP - Years to invest in pension fund beyond deduction limit
     * @param {Array} oltreDeduzionePAC - Years to invest in PAC beyond deduction limit
     * @returns {Object} Strategy text for both scenarios
     */
    _generateStrategyText(entroDeduzioneFP, entroDeduzionePAC, oltreDeduzioneFP, oltreDeduzionePAC) {
      const fpRangesEntro = this.getRanges(entroDeduzioneFP, 'Fondo Pensione');
      const pacRangesEntro = this.getRanges(entroDeduzionePAC, 'PAC');
      const resultStringEntro = [...pacRangesEntro, ...fpRangesEntro].join(', ');
      const stringEntro = "Per la quota entro deduzione: " + resultStringEntro + ".";
  
      const fpRangesOltre = this.getRanges(oltreDeduzioneFP, 'Fondo Pensione');
      const pacRangesOltre = this.getRanges(oltreDeduzionePAC, 'PAC');
      const resultStringOltre = [...pacRangesOltre, ...fpRangesOltre].join(', ');
      const stringOltre = "Per la quota oltre deduzione: " + resultStringOltre + ".";
  
      return {
        stringEntro,
        stringOltre
      };
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
     * Finds year ranges for investment strategies
     * @param {Array} arr - Array of years
     * @param {string} name - Strategy name
     * @returns {Array} Formatted range strings
     */
    getRanges(arr, name) {
      if (!arr.length) return [];
      
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