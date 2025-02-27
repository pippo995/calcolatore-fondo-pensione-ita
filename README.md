# Calcolatore di Finanza Personale - Italia

[https://pippo995.github.io/calcolatore-finanza-personale-ita/](https://pippo995.github.io/calcolatore-fondo-pensione-ita/)

## Introduzione

Il **Fondo Pensione (FP)** e il **Piano di Accumulo Capitale (PAC)** sono due strumenti di investimento a lungo termine, ciascuno con caratteristiche e vantaggi distinti. Il Fondo Pensione è progettato per accumulare risparmi destinati alla pensione, offrendo vantaggi fiscali e una crescita graduale del capitale. Il Piano di Accumulo Capitale, invece, consente di accumulare un capitale attraverso versamenti regolari, con l'obiettivo di ottenere rendimenti nel lungo periodo.

Per fornire stime precise dei risultati potenziali, è essenziale considerare una serie di variabili fiscali complesse. Questo calcolatore è stato progettato per integrare tutte queste variabili, offrendo una panoramica dettagliata dei risultati attesi per entrambi gli strumenti. Gli utenti possono inserire i rendimenti sperati e il calcolatore elaborerà le stime tenendo conto delle implicazioni fiscali specifiche.

Inoltre, il calcolatore esplora due strategie miste che prevedono un investimento suddiviso tra il Fondo Pensione e il Piano di Accumulo Capitale. L'obiettivo è ottimizzare il rendimento finale, sfruttando i benefici e gestendo i rischi di entrambi gli strumenti per ottenere i migliori risultati possibili.

Nelle note del calcolatore, vengono spiegate dettagliatamente la metodologia di calcolo utilizzata e le decisioni adottate per affrontare le complessità fiscali e ottimizzare le stime. Inoltre, sono forniti chiarimenti su come inserire i parametri necessari per ottenere le simulazioni desiderate, garantendo così una comprensione completa del funzionamento del calcolatore e dei criteri impiegati per generare i risultati.

## Parametri

### Età

L'età alla quale si prevede di iniziare l'investimento. Questo dato è utile solo come riferimento in tabella. Iniziare a investire il prima possibile può massimizzare i rendimenti grazie all'effetto dell'interesse composto.

### Durata

La durata dell'investimento. È consigliata una durata minima di 10 anni per massimizzare i benefici di entrambi gli strumenti. Investimenti a lungo termine tendono a ridurre il rischio e aumentare i rendimenti.

### Frequenza di Carico

La frequenza con cui vengono effettuati i versamenti influisce sul calcolo dei rendimenti. Se mensile, ogni versamento viene moltiplicato per una frazione del tasso annuale. Se annuale, il versamento viene considerato come effettuato il 31 dicembre, senza interessi per quell'anno. Versamenti più frequenti possono aumentare i rendimenti grazie all'effetto dell'interesse composto.

### Reddito

Indicare il reddito deducibile al momento dell'inizio dell'investimento. Questo dato viene utilizzato per calcolare il TFR, le deduzioni fiscali e il contributo del datore di lavoro.

### Variazione del Reddito

Scegliere tra variazione percentuale o numerica del reddito, specificando la frequenza in anni con cui la variazione avviene e il valore della variazione.

### Investimento Iniziale

La cifra investita annualmente all'inizio dell'investimento. Un investimento iniziale maggiore può portare a rendimenti più elevati nel lungo termine.

### Variazione dell'Investimento

Scegliere tra variazione percentuale o numerica dell'investimento, specificando la frequenza in anni con cui la variazione avviene e il valore della variazione.

### Contributo del Datore di Lavoro

In alcuni casi, il datore di lavoro contribuisce al fondo pensione con una percentuale del reddito del lavoratore. È necessario specificare se questo contributo è presente. Questo contributo può aumentare significativamente il montante finale del fondo pensione.

### Investire Risparmio Fiscale

Indicare se si desidera reinvestire il risparmio fiscale ottenuto dalle deduzioni. Si può scegliere di investirlo nello stesso anno in cui la deduzione viene generata o nell'anno successivo. Il risparmio fiscale investito genera a sua volta altro risparmio fiscale (es. se investo 1000 euro e ottengo 100 euro di risparmio fiscale potrò investire altri 100 euro. Questi 100 euro mi permettono di risparmiare altri 10 euro etc.). Se non si hanno problemi di liquidità, si consiglia di selezionare "Anno Corrente" e aggiungere al proprio investimento la cifra indicata nella colonna "Risparmio Fiscale". Il risparmio fiscale (a parte la quota mediata dal sostituto d'imposta) viene recuperato nell'anno successivo in fase di dichiarazione dei redditi.

### Investire TFR

Indicare se è presente il TFR e se viene lasciato in azienda o portato nel Fondo Pensione. Lasciare il TFR in azienda può essere meno vantaggioso rispetto a investirlo in un fondo pensione, che può offrire rendimenti più elevati nel lungo termine.

### Inflazione

L'inflazione media attesa nel periodo indicato. Si consiglia di lasciare il valore al 2%, target delle Banche Centrali.

### Rendimento Annuo Storico del Fondo Pensione

Recuperabile dalle tabelle fornite dalla COVIP (Commissione di Vigilanza sui Fondi Pensione). Questo rendimento è da intendersi al netto della tassazione sulle plusvalenze, come per i rendimenti indicati dalla COVIP.

### Rendimento Annuo PAC (%)

Si può utilizzare come benchmark l'indice *MSCI All World Index*, che ha ottenuto un rendimento medio annuo dell'8,23% negli ultimi 30 anni. Tuttavia, il rendimento può variare molto in base alla strategia di investimento scelta e non è in alcun modo garantito.

## Strategie

### Nota su TFR

Il TFR viene in ogni caso allocato secondo la scelta effettuata. Le exit finali di tutte le strategie riportano anche i ritorni generati dal TFR in azienda o nel Fondo Pensione, secondo la scelta effettuata.

### Strategia FP

Investimento esclusivo nel fondo pensione fino al limite delle deduzioni fiscali (5164 euro) e anche oltre, sfruttando al massimo i vantaggi fiscali e il contributo del datore di lavoro, con l'obiettivo di ottenere una rendita previdenziale a lungo termine.

### Strategia PAC

Investimento esclusivo nel Piano di Accumulo Capitale (PAC), senza limitazioni fiscali. Questo consente una gestione più flessibile del capitale e una diversificazione dell'investimento, sebbene senza i benefici fiscali e la contribuzione del datore di lavoro offerti dal fondo pensione.

### Strategia Mix-1

Investimento combinato tra FP e PAC. Si investe nel fondo pensione fino al limite massimo delle deduzioni fiscali (5164 euro), mentre l'eventuale eccedenza viene destinata al PAC. Questa strategia permette di ottimizzare i benefici fiscali del fondo pensione e, al contempo, diversificare l'investimento con il PAC.

### Strategia Mix-2

Strategia dinamica in cui ogni anno viene calcolato se l'interesse composto generato dal fondo pensione sulla quota d'investimento entro il limite di deduzione, sommato alle deduzioni fiscali e al contributo del datore di lavoro, superi l'interesse composto ottenuto investendo la stessa somma nel PAC. In base a quale delle due opzioni offra il ritorno più alto, l'investimento viene allocato di conseguenza, massimizzando così il guadagno finale. Ogni anno viene comunque considerato un investimento di 1 euro sul fondo pensione in modo da abbassare la tassazione in uscita.

## Note sui Calcoli

### Temporalità

L'anno 0 non è riportato in tabella perché viene considerato esclusivamente come anno di carico. Se consideriamo il 2024 come primo anno e scegliamo una frequenza di carico annuale, il versamento al Fondo Pensione o al PAC è ipotizzato come effettuato al 31-12-2024. Ad esempio, la riga 30 riporta la situazione dell'investimento al 31 dicembre 2054, considerando il 2024 come anno "0" dell'investimento.

### Tassazione dei Versamenti nel Fondo Pensione

I versamenti dedotti al Fondo Pensione non sono esenti da imposte, ma la tassazione è posticipata al momento del riscatto o della pensione. L'aliquota fiscale è del 15%, riducibile fino al 9% dopo 35 anni di adesione al fondo. In caso di riscatto anticipato, l'aliquota può salire fino al 23%, a seconda della motivazione del riscatto.

### Tassazione delle Plusvalenze nel Fondo Pensione

Le plusvalenze generate dal Fondo Pensione sono tassate annualmente con un'aliquota del 20%, ridotta al 12,5% per i titoli di Stato. I rendimenti indicati sul sito della COVIP sono già al netto di queste imposte.

### Tassazione dei Versamenti nel PAC

I versamenti effettuati in un Piano di Accumulo Capitale (PAC) sono già tassati come reddito personale. Tuttavia, vengono tassate solo le plusvalenze realizzate, con un'aliquota del 26%, ridotta al 12,5%
