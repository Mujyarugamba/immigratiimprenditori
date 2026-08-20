# Italiani imprenditori all'estero — Mappa delle fonti

Stato: **SOURCE MAP v1 — NON PUBBLICARE COME TOTALE AGGREGATO**  
Data ricognizione: 19/08/2026  
Collegamento editoriale: Numero zero `A2-italiani-impresa-estero.md`

## Regola metodologica

L'obiettivo non è produrre a forza un unico numero mondiale degli italiani imprenditori all'estero. Per ogni Paese di destinazione registriamo separatamente:

1. definizione dell'origine: luogo di nascita, cittadinanza, immigration history;
2. definizione economica: self-employed, owner-manager, business owner/founder;
3. universo: occupati, popolazione 15/16+, persone con esperienza lavorativa, imprese;
4. anno e fonte;
5. possibilità di estrarre esattamente la popolazione nata/cittadina italiana;
6. comparabilità con gli altri Paesi.

`residente italiano all'estero` ≠ `nato in Italia all'estero` ≠ `cittadino italiano` ≠ `self-employed` ≠ `proprietario/fondatore di impresa`.

---

## 1. Stati Uniti — U.S. Census Bureau / ACS

### Fonte ufficiale

**American Community Survey — Selected Population Profile, S0201**  
https://data.census.gov/table/ACSSPP1Y2024.S0201

Documentazione/API:
- https://api.census.gov/data/2024/acs/acs1/spp.html
- https://api.census.gov/data/2024/acs/acs1/spp/variables.html

### Che cosa consente

La tabella S0201 può essere iterata per gruppi di **place of birth**. Per i gruppi nati fuori dagli Stati Uniti, l'universo del profilo è la popolazione foreign-born del gruppo selezionato.

Nella sezione `CLASS OF WORKER` sono disponibili misure di lavoro autonomo; tra le variabili pubbliche è esplicitamente presente `Self-employed workers in own not incorporated business`.

Per una misura completa che distingua anche le altre classi di lavoro e consenta incroci personalizzati, l'ACS PUMS resta il secondo livello di verifica.

### Stato Italia

**POTENZIALE ALTO / EXTRACTION PENDING.**  
Il sistema consente profili per place of birth, ma prima della pubblicazione va estratto e salvato il profilo esatto `Italy` con anno, estimate e margin of error.

### Comparabilità

Comparabile concettualmente con altri dati di self-employment **solo dichiarando** che si tratta di ACS e di una definizione di class of worker. Non equivale a conteggio di società fondate o possedute da italiani.

---

## 2. Australia — Australian Bureau of Statistics / Census 2021

### Fonti ufficiali

ABS Census 2021, Country of birth QuickStats e tabelle employment/status.  
Portale: https://www.abs.gov.au/census/find-census-data

Prodotto W05:
**Status in employment by country of birth of person by sex**.

### Che cosa consente

L'ABS definisce l'`owner manager` come persona che lavora nella propria attività, con o senza dipendenti e in forma incorporated o unincorporated. Il Census consente la lettura per country of birth.

Esistono inoltre QuickStats specifiche per persone **born in Italy**, con sezioni su labour force e work.

### Stato Italia

**READY FOR EXTRACTION.**  
È la fonte più promettente del primo gruppo perché combina in modo nativo luogo di nascita ed employment status. Prima della pubblicazione vanno estratti il valore nazionale Australia `born in Italy` e la categoria economica esatta prescelta, evitando di mischiare `owner manager` e altre forme di lavoro autonomo.

### Comparabilità

Buona per analisi di persone nate in Italia, ma non identica a ACS, OECD o registri delle imprese. Il Census 2021 è inoltre una fotografia censuaria, non una serie annuale.

---

## 3. Regno Unito — ONS / Census 2021 / Nomis

### Fonti ufficiali

ONS Country of birth classifications, Census 2021:  
https://www.ons.gov.uk/census/census2021dictionary/variablesbytopic/internationalmigrationvariablescensus2021/countryofbirth/classifications

Nomis dataset RM017 — Economic activity status by country of birth:  
https://www.nomisweb.co.uk/datasets/c2021rm017

### Che cosa consente

La classificazione ONS del country of birth contiene **Italy** come categoria esplicita. Il dataset RM017 incrocia economic activity status e country of birth.

Tuttavia RM017, nella versione pubblicata standard, aggrega `in employment` e non separa in modo sufficiente employee/self-employed per il nostro obiettivo A2.

### Stato Italia

**COUNTRY IDENTIFIED / SELF-EMPLOYMENT CROSS-TAB PENDING.**  
Non usare RM017 da solo per stimare gli italiani self-employed. Serve una tabella Census più dettagliata/custom, un dataset con classificazione economica che distingua self-employed, oppure estrazione/microdata compatibile con disclosure control ONS.

### Comparabilità

La stessa pagina Nomis avverte che la definizione Census 2021 dell'economic activity non è direttamente comparabile con quella ILO usata dalla Labour Force Survey.

---

## 4. Canada — Statistics Canada / Census 2021

### Fonti ufficiali

Dictionary — `Class of worker`:  
https://www12.statcan.gc.ca/census-recensement/2021/ref/dict/az/definition-eng.cfm?ID=pop017

Table 98-10-0600-01 — Class of worker by industry, immigrant status and period of immigration, admission category, age and gender:  
https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=9810060001

Census Profile 2021:  
https://www12.statcan.gc.ca/census-recensement/2021/dp-pd/prof/index.cfm

### Che cosa consente

Statistics Canada definisce la `class of worker` distinguendo employee e self-employed. I self-employed comprendono persone con o senza impresa, con o senza paid help, e possono operare attività incorporated o unincorporated.

Le tavole pubbliche permettono analisi molto ricche per immigrant status e periodo di immigrazione. Il Census Profile contiene inoltre il luogo di nascita, compresa l'Italia.

### Stato Italia

**COMPONENTS AVAILABLE / EXACT CROSS-TAB PENDING.**  
Non sommare il numero di persone nate in Italia con il tasso generale di self-employment degli immigrati. Va individuata una tabella/custom extraction che incroci direttamente `Italy` e class of worker, oppure usare microdata/servizio statistico ufficiale.

### Comparabilità

La definizione canadese di self-employed include anche unpaid family workers in alcune classificazioni: va indicato se il valore usato include o esclude questa componente.

---

## 5. Germania — Destatis / Mikrozensus

### Fonti ufficiali

Mikrozensus — Migration background, final results 2024:  
https://www.destatis.de/DE/Themen/Gesellschaft-Umwelt/Bevoelkerung/Migration-Integration/Publikationen/Downloads-Migration/statistischer-bericht-migrationshintergrund-end-2010220247005.html

GENESIS-Online area 12211.  
Pagina labour force participation per migrant background:  
https://www.destatis.de/EN/Themes/Society-Environment/Population/Migration-Integration/Tables/migrant-status-labour-force-participation.html

Comunicato su popolazione con storia migratoria italiana 2024:  
https://www.destatis.de/DE/Presse/Pressemitteilungen/2025/12/PD25_457_122.html

### Che cosa consente

Il Mikrozensus pubblica self-employed **with persons employed** e **without persons employed** per migration background. Destatis pubblica inoltre dati specifici sulla popolazione con storia migratoria italiana: nel 2024 circa 650 mila persone, di cui 465 mila immigrate personalmente.

### Stato Italia

**STRONG SOURCE / EXACT ITALY × SELF-EMPLOYMENT PENDING.**  
Le due dimensioni esistono nel sistema statistico ma il cross-tab esatto Italia × status in employment non è stato ancora estratto dalla pagina pubblica. Va verificato nel file XLSX/GENESIS 12211 prima di produrre un valore.

### Comparabilità

La categoria tedesca `Migrationshintergrund/Einwanderungsgeschichte` non è identica a `born in Italy` o `Italian citizen`. Un confronto internazionale deve scegliere e dichiarare il concetto.

---

## 6. Eurostat / EU-LFS — strato comparabile europeo

### Fonti ufficiali

Migrant integration — Information on data:  
https://ec.europa.eu/eurostat/web/migration-asylum/migrant-integration/information-data

Methodology:  
https://ec.europa.eu/eurostat/web/migration-asylum/migrant-integration/methodology

### Che cosa consente

Eurostat include il **self-employment** tra gli indicatori di integrazione dei migranti e usa principalmente EU-LFS. Le dimensioni di migrazione comprendono country of birth e citizenship.

Per i prodotti pubblici armonizzati, però, le categorie di origine sono spesso aggregate (`native-born`, altro Paese UE, extra-UE) e non sempre consentono una lettura `Italy-born` per ogni Paese di destinazione.

### Stato Italia

**COMPARABILITY LAYER / NOT A UNIVERSAL ITALY-BORN COUNT.**  
Ottimo per confronti europei coerenti; meno adatto, da solo, a costruire lo stock degli italiani imprenditori in ciascun Paese.

---

## Matrice di prontezza

| Destinazione | Origine italiana identificabile | Self-employment identificabile | Cross-tab esatto già pronto | Prossimo passo |
| --- | --- | --- | --- | --- |
| Stati Uniti | Sì, place of birth | Sì | **No** | Estrarre ACS Italy profile / PUMS con MOE |
| Australia | Sì, born in Italy | Sì, status/owner manager | **Quasi** | Estrarre valore nazionale W05/QuickStats |
| Regno Unito | Sì, Census Italy | Sì nel Census, ma non RM017 standard | **No** | Custom table/dataset ONS |
| Canada | Sì, place of birth | Sì, class of worker | **No** | Cercare/ottenere Italy × class of worker |
| Germania | Sì, Italian migration history | Sì, Mikrozensus | **No** | GENESIS/XLSX exact cross-tab |
| UE armonizzata | Di solito aggregata | Sì, EU-LFS | **No per tutti i Paesi** | Usare come strato comparabile, non totale diaspora |

## Decisione editoriale A2

Il dossier può essere pubblicato **anche senza un totale mondiale**, purché mostri con chiarezza:

- quali Paesi rendono possibile una misura italiana specifica;
- quali pubblicano solo categorie aggregate;
- quando si misura self-employment e quando ownership;
- dove il dato richiede una richiesta/custom table;
- perché la somma di definizioni incompatibili sarebbe metodologicamente sbagliata.

`ITALIANS_ABROAD_SOURCE_MAP = PASS_V1`
