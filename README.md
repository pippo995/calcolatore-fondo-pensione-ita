# Calcolatore di Finanza Personale - Italia

https://pippo995.github.io/calcolatore-finanza-personale-ita/

Un calcolatore di finanza personale basato sul contesto fiscale italiano.

## Introduzione
La gestione della finanza personale coinvolge numerosi fattori, molti dei quali possono variare significativamente. Questo progetto mira a sviluppare un calcolatore modulare che affronti diverse aree della finanza personale. Le prime aree di sviluppo saranno:

1. Investimento finanziario a lungo termine (>= 10 anni): Piano di Accumulo (PAC) o Fondo Pensione?
2. Abitazione: mutuo o affitto?
3. Risparmio: flusso di cassa e spese mensili.

## 1. Investimento Finanziario a Lungo Termine (>= 10 anni): Piano di Accumulo (PAC) o Fondo Pensione?

### Considerazioni Generali
- **Fondo Pensione**: Non è solo uno strumento finanziario, ma include una componente assicurativa che garantisce una rendita fino al decesso del titolare. È importante considerare anche questi aspetti non puramente finanziari quando si investe in un Fondo Pensione.
- **Sgravi Fiscali in Italia**: I Fondi Pensione godono di significativi sgravi fiscali tramite deduzione IRPEF per i lavoratori dipendenti. Questo sgravio può essere applicato direttamente nell'anno corrente tramite il sostituto d'imposta o recuperato nell'anno successivo con la dichiarazione dei redditi. Per semplicità, consideriamo lo sgravio fiscale come liquidato interamente nell'anno successivo ai versamenti.
- **Definizione di Sgravio Fiscale**: Lo sgravio fiscale non rappresenta un rendimento del fondo, ma una riduzione delle uscite (IRPEF), che incrementa la capacità di risparmio. Se reinvestiamo questo sgravio nel fondo, in un PAC, o lo accantoniamo, esso diventa, ai fini dell'analisi, equiparabile a un rendimento del fondo. Se utilizzato per altre spese (domestiche, vacanze, ecc.), resta una semplice riduzione del costo.
- **Contributo del Datore di Lavoro**: Nei fondi pensione chiusi, il contributo del datore di lavoro è equiparabile a un rendimento del fondo.
- **Tassazione Versamenti dei Fondi Pensione**: La deduzione non è una detassazione; la tassazione è posticipata al momento dell'anticipazione o del riscatto. In caso di maturazione della pensione, la tassazione è del 15% per i primi 15 anni, ridotta dello 0.3% ogni anno fino al 9%. In caso di riscatto anticipato, la tassazione può arrivare al 23% a seconda della motivazione.
- - **Tassazione Versamenti del PAC**: i versamenti del PAC sono già stati tassati dal momento che hanno costituito reddito. Verranno tassate solo le plusvalenze generate (vedi sotto).
- **Tassazione delle Plusvalenze del Fondo Pensione**: Le plusvalenze del fondo sono tassate annualmente al 20%, mentre quelle derivanti da titoli di Stato e similari sono tassate al 12.5%. I rendimenti indicati sul sito COVIP sono al netto di questa tassazione. Essendo difficile ricostruire anno per anno e in base al compartimento al quota di titoli di stato nel fondo pensione, si utilizzerà direttamente il rendimento COVIP indicato.
- **Tassazione delle Plusvalenze del Piano di Accumulo (PAC)**: Per il PAC, si calcola l'aliquota sulle plusvalenze al 26%, oltre all'aliquota del 12.5% per la quota di titoli di Stato, definita come parametro.

---
