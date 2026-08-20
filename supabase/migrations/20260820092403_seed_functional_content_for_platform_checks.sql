-- Functional content for development/QA. Public items are created private first,
-- enriched with authors/tags, then promoted through the existing publication guard.

insert into public.contents (
  owned_by_editorial, type_code, primary_category_code, language_id,
  title, subtitle, abstract, body, body_format, slug,
  source_url, source_label, editorial_status, publication_status,
  visibility_status, is_featured
)
select
  true,
  'guide',
  'entrepreneurship',
  l.id,
  'Tre numeri da non confondere quando si parla di imprenditoria migrante',
  'Imprese registrate, lavoratori autonomi e fondatori misurano fenomeni diversi.',
  'Una guida breve per leggere correttamente Registro Imprese, statistiche sul self-employment e storie di fondatori senza trasformare misure diverse in un unico numero.',
  $body$
## Tre misure, tre domande diverse

Quando si parla di imprenditoria migrante è facile mettere nello stesso contenitore numeri che arrivano da fonti costruite per scopi differenti. Per questo l’Osservatorio distingue almeno tre oggetti: **imprese registrate**, **lavoratori autonomi** e **fondatori o proprietari di impresa**.

### 1. Imprese registrate

Il Registro Imprese conta soggetti economici iscritti secondo regole amministrative. Nel rapporto InfoCamere/Futurae riferito al 30 giugno 2025 risultano **678.004 imprese straniere registrate in Italia**. La classificazione dipende dalla partecipazione di persone fisiche non nate in Italia e non coincide automaticamente con la biografia migratoria di un singolo fondatore.

Questo indicatore è utile per studiare stock di imprese, forme giuridiche, settori e territori.

### 2. Lavoratori autonomi

Le statistiche sul self-employment partono invece dalle persone. L’OECD, per esempio, confronta la quota di occupati nati all’estero e nati nel Paese che lavorano in proprio. Nel 2022 la media OECD era **13,8% tra i foreign-born e 13,4% tra i native-born**.

Un lavoratore autonomo può avere dipendenti oppure lavorare da solo. Per questo “self-employed” non è sinonimo perfetto di “imprenditore con azienda”.

### 3. Fondatori e proprietari

La domanda “quante persone immigrate hanno fondato un’impresa?” richiede dati ancora diversi. In alcuni Paesi esistono registri di proprietari o amministratori; in altri bisogna usare indagini o microdati. Non sempre queste informazioni sono disponibili o confrontabili tra Paesi.

## Perché non sommiamo tutto

Un’impresa registrata è un’unità economica. Un self-employed è una persona. Un founder è un ruolo nella nascita di un’impresa. Se si sommano o si confrontano direttamente questi oggetti senza dichiarare la definizione, il risultato può sembrare preciso ma essere metodologicamente sbagliato.

Per ogni numero pubblicato l’Osservatorio indica quindi **fonte, periodo, unità, territorio e metodologia**. Quando due fonti misurano cose diverse, vengono mostrate come informazioni complementari e non come valori intercambiabili.

## Come usare questa guida

Prima di leggere una classifica o confrontare due Paesi, conviene chiedersi:

1. l’unità è una persona o un’impresa?
2. il dato riguarda imprese registrate o attive?
3. l’origine è definita per cittadinanza o luogo di nascita?
4. self-employed significa con o senza dipendenti?
5. periodo e territorio sono realmente confrontabili?

Sono domande semplici, ma evitano gran parte degli errori più comuni nella lettura del fenomeno.
  $body$,
  'markdown',
  'tre-numeri-da-non-confondere-imprenditoria-migrante',
  'https://www.lavoro.gov.it/notizie/pagine/sono-quasi-680mila-le-imprese-di-migranti-italia',
  'Ministero del Lavoro / InfoCamere / Futurae; OECD',
  'ready', 'unpublished', 'private', true
from public.languages l
where l.code = 'it'
on conflict (slug) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  abstract = excluded.abstract,
  body = excluded.body,
  source_url = excluded.source_url,
  source_label = excluded.source_label,
  editorial_status = excluded.editorial_status,
  publication_status = 'unpublished',
  visibility_status = 'private',
  is_featured = excluded.is_featured,
  updated_at = now();

insert into public.contents (
  owned_by_editorial, type_code, primary_category_code, language_id,
  title, subtitle, abstract, body, body_format, slug,
  editorial_status, publication_status, visibility_status,
  is_featured
)
select
  true,
  'institutional_page',
  'other',
  l.id,
  'Dalla fonte alla pubblicazione: come lavora l’Osservatorio',
  'Discovery, verifica, metodologia e decisione editoriale restano passaggi distinti.',
  'Il percorso con cui una notizia, un dataset o un rapporto diventa una fonte verificata, un indicatore o un contenuto dell’Osservatorio.',
  $body$
## La fonte non è ancora un contenuto

L’Osservatorio usa fonti statistiche, documenti istituzionali, ricerche, segnalazioni e strumenti di discovery. Il fatto che una risorsa venga individuata non significa che sia automaticamente pronta per essere pubblicata.

Il lavoro è diviso in passaggi distinti.

### 1. Scoperta

Il Radar, una segnalazione esterna o il lavoro della redazione può individuare un documento, un dataset, una notizia o un evento potenzialmente rilevante.

Questa fase serve a **trovare** materiale. Non certifica ancora la qualità della fonte.

### 2. Verifica della fonte

La redazione controlla chi pubblica il materiale, la data, il documento originale, il perimetro geografico e il metodo con cui il dato è stato prodotto. Quando è disponibile una fonte primaria, viene preferita a riassunti e rilanci secondari.

### 3. Classificazione

Il materiale viene collegato a temi, territori, rotte migratorie e categorie editoriali. Un rapporto statistico può alimentare la biblioteca, un indicatore dell’Osservatorio e una successiva analisi, senza che questi tre oggetti diventino la stessa cosa.

### 4. Lettura metodologica

Prima di confrontare numeri provenienti da fonti diverse verifichiamo unità di misura, universo, definizioni, periodo e territorio. Se le definizioni non sono compatibili, i dati restano separati.

### 5. Produzione editoriale

Solo dopo la verifica nasce un contenuto: una nota dati, un’analisi, una guida, un policy brief o un rapporto. I materiali inviati con “Contribuisci” e quelli scoperti dal Radar entrano nella Inbox, ma non vengono autopubblicati.

### 6. Pubblicazione e tracciabilità

Il contenuto pubblico mantiene il collegamento alla fonte originale quando disponibile. Gli indicatori mostrano fonte, periodo, unità e nota metodologica. La redazione può aggiornare o ritirare un contenuto se emergono nuove informazioni o correzioni rilevanti.

## Una regola semplice

**Discovery non significa evidenza; evidenza non significa automaticamente pubblicazione.**

Separare questi passaggi rende il lavoro più lento di un feed automatico, ma permette al sito di funzionare come archivio di ricerca e non come semplice aggregatore.
  $body$,
  'markdown',
  'come-lavora-osservatorio-fonti-pubblicazione',
  'ready', 'unpublished', 'private', false
from public.languages l
where l.code = 'it'
on conflict (slug) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  abstract = excluded.abstract,
  body = excluded.body,
  editorial_status = excluded.editorial_status,
  publication_status = 'unpublished',
  visibility_status = 'private',
  updated_at = now();

insert into public.contents (
  owned_by_editorial, type_code, primary_category_code, language_id,
  title, abstract, body, body_format, slug, source_url, source_label,
  editorial_status, publication_status, visibility_status, is_featured
)
select
  true, 'analysis', 'entrepreneurship', l.id,
  '[QA] Verifica workflow editoriale con fonte, tag e geografia',
  'Contenuto tecnico privato usato per verificare che redazione, metadati e RLS distinguano correttamente bozza e pubblicazione.',
  'Contenuto di controllo interno. Deve restare privato. Serve a verificare rendering della bozza, fonte, tag, geografia, autore e filtri della scrivania redazionale.',
  'plain_text',
  'qa-workflow-editoriale-fonte-tag-geografia',
  'https://www.oecd.org/en/publications/international-migration-outlook-2024_50b0353e-en.html',
  'OECD — fonte QA',
  'draft','unpublished','private',false
from public.languages l where l.code='it'
on conflict (slug) do update set
  abstract=excluded.abstract, body=excluded.body, updated_at=now();

insert into public.content_authors (content_id, role_kind, display_label, is_primary, sort_order)
select c.id, 'author',
       case when c.slug='qa-workflow-editoriale-fonte-tag-geografia'
            then 'Redazione QA — non pubblicare'
            else 'Redazione Immigrati Imprenditori' end,
       true, 0
from public.contents c
where c.slug in (
  'tre-numeri-da-non-confondere-imprenditoria-migrante',
  'come-lavora-osservatorio-fonti-pubblicazione',
  'qa-workflow-editoriale-fonte-tag-geografia'
)
and not exists (
  select 1 from public.content_authors a
  where a.content_id=c.id and a.is_primary=true
);

insert into public.content_tag_links (content_id, tag_code, sort_order)
select c.id, x.tag_code, x.sort_order
from public.contents c
join (values
  ('tre-numeri-da-non-confondere-imprenditoria-migrante','migration-and-business',0),
  ('tre-numeri-da-non-confondere-imprenditoria-migrante','business-demography',1),
  ('come-lavora-osservatorio-fonti-pubblicazione','migration-and-business',0),
  ('qa-workflow-editoriale-fonte-tag-geografia','business-demography',0)
) as x(slug,tag_code,sort_order) on x.slug=c.slug
where not exists (
  select 1 from public.content_tag_links l
  where l.content_id=c.id and l.tag_code=x.tag_code
);

insert into public.content_geographies (content_id, country_code, relation_kind, sort_order)
select c.id, 'IT', 'focus', 0
from public.contents c
where c.slug='qa-workflow-editoriale-fonte-tag-geografia'
and not exists (
  select 1 from public.content_geographies g
  where g.content_id=c.id and g.country_code='IT'
);

-- Promotion is deliberately separate from creation and now passes the existing guard.
update public.contents
set publication_status='published', visibility_status='public', published_at=coalesce(published_at,now()), updated_at=now()
where slug in (
  'tre-numeri-da-non-confondere-imprenditoria-migrante',
  'come-lavora-osservatorio-fonti-pubblicazione'
);
