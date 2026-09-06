import type { PlatformLocale } from "@/lib/i18n/config";

export type PublicTranslationLocale = Exclude<PlatformLocale, "it">;

type IndicatorCopy = {
  title: string;
  description: string;
  purpose: string;
  methodology: string;
};

type EventCopy = {
  title: string;
  summary: string | null;
  description: string;
};

export const INDICATOR_TRANSLATIONS: Record<PublicTranslationLocale, Record<string, IndicatorCopy>> = {
  en: {
    "imprese-individuali-paese-nascita-titolare-atlas": {
      title: "Sole proprietorships by owner’s country of birth — Atlas countries",
      description: "Number of sole proprietorships registered in Italy whose owner was born in one of the countries included in the Atlas’s initial scope.",
      purpose: "Measure the entrepreneurial presence in Italy of communities of origin included in the first Atlas, keeping place of birth distinct from citizenship.",
      methodology: "Source: Futurae / InfoCamere / Unioncamere, Figure 13 of the H1 2025 report. Values at 30 June 2025, sole proprietorships only. Country refers to the owner’s place of birth. The original figure shows the top 20 foreign communities; this series imports only those within the approved scope of the first Atlas and must not be interpreted as a complete ranking of all origins.",
    },
    "imprese-straniere-registrate": {
      title: "Registered foreign enterprises",
      description: "Number of enterprises classified as foreign and registered in the Business Register on the reference date.",
      purpose: "Measure the chamber-of-commerce stock of foreign enterprises using an explicit definition, kept separate from indicators on individuals in self-employment.",
      methodology: "Source: Business Register, processed by InfoCamere within the Futurae programme. ‘Foreign’ means that the overall participation of natural persons not born in Italy exceeds 50%, combining ownership shares and administrative roles according to the type of enterprise. This is an indicator of registered enterprises, not a count of people and not an LFS measure of self-employment.",
    },
    "imprese-straniere-settori-corrispondenza-diretta": {
      title: "Registered foreign enterprises by sector — direct correspondence",
      description: "Number of foreign enterprises registered in Italy at 30 June 2025 for Research Centre taxonomy sectors that correspond directly to an ATECO section published by the source.",
      purpose: "Enable a sectoral reading of foreign entrepreneurship without forcing aggregations between non-equivalent classifications.",
      methodology: "Source: Futurae / InfoCamere / Unioncamere, Figure 8 of the H1 2025 report. Only ATECO sections with a one-to-one correspondence to the Research Centre taxonomy are imported: A agriculture, C manufacturing, F construction, G trade, H transport and storage, I accommodation and food services. Other sections in the original figure remain in the source and are not remapped arbitrarily.",
    },
    "lavoro-autonomo-per-cittadinanza": {
      title: "Self-employment by citizenship",
      description: "People in self-employment in Italy by citizenship (Eurostat Labour Force Survey). Values are expressed as persons; the Eurostat source is originally in thousands of persons (THS_PER).",
      purpose: "Provide an official reference on self-employment by citizenship, distinct from enterprises controlled by people born abroad under chamber-of-commerce definitions and from the broader concept of migrant entrepreneur.",
      methodology: "Source: Eurostat dataset lfsa_esgan (Self-employed persons by citizenship). Filters: geo=IT, wstatus=SELF, sex=T, age=Y15-64. The Eurostat source unit is thousands of persons; values are converted to persons in the Research Centre database for consistency with the count/units unit. The citizen dimension indicates statistical citizenship, not place of birth and not enterprises in the Business Register.",
    },
    "quota-lavoro-autonomo-per-cittadinanza-ue": {
      title: "Share of self-employment by citizenship in the EU",
      description: "Share of employed people who are self-employed in the European Union, broken down by citizenship.",
      purpose: "Compare the incidence of self-employment among nationals, citizens of other EU countries and non-EU citizens.",
      methodology: "Source: Eurostat, EU-LFS, population aged 20–64. Measures the share of self-employed people among total employed people at EU-27 level. Citizenship is not equivalent to place of birth or to the chamber-of-commerce definition of a foreign enterprise.",
    },
    "tasso-lavoro-autonomo-per-luogo-nascita": {
      title: "Self-employment rate by place of birth",
      description: "Share of the employed population working on their own account, distinguishing foreign-born from native-born people.",
      purpose: "Use a homogeneous measure to compare the prevalence of self-employment among foreign-born and native-born people, showing differences between countries without turning them into a ranking of entrepreneurial quality.",
      methodology: "OECD International Migration Outlook 2024, Table 4.1. Self-employment rate among the employed population, 2022, percentage. FB = foreign-born; NB = native-born. The measure concerns employed people and place of birth: it is not the same as citizenship or the number of registered enterprises.",
    },
  },
  fr: {
    "imprese-individuali-paese-nascita-titolare-atlas": {
      title: "Entreprises individuelles selon le pays de naissance du titulaire — pays de l’Atlas",
      description: "Nombre d’entreprises individuelles enregistrées en Italie dont le titulaire est né dans l’un des pays inclus dans le premier périmètre de l’Atlas.",
      purpose: "Mesurer la présence entrepreneuriale en Italie des communautés d’origine incluses dans le premier Atlas, en distinguant le lieu de naissance de la citoyenneté.",
      methodology: "Source : Futurae / InfoCamere / Unioncamere, figure 13 du rapport du premier semestre 2025. Valeurs au 30 juin 2025, uniquement les entreprises individuelles. Le pays correspond au lieu de naissance du titulaire. La figure originale présente les 20 principales communautés étrangères ; cette série n’importe que celles relevant du périmètre approuvé du premier Atlas et ne doit pas être interprétée comme un classement complet de toutes les origines.",
    },
    "imprese-straniere-registrate": {
      title: "Entreprises étrangères enregistrées",
      description: "Nombre d’entreprises classées comme étrangères et inscrites au Registre des entreprises à la date de référence.",
      purpose: "Mesurer le stock d’entreprises étrangères enregistré par les chambres de commerce au moyen d’une définition explicite, distincte des indicateurs sur le travail indépendant des personnes.",
      methodology: "Source : Registre des entreprises, traitement InfoCamere dans le programme Futurae. « Étrangère » signifie que la participation globale de personnes physiques non nées en Italie dépasse 50 %, en combinant parts de propriété et fonctions administratives selon la forme de l’entreprise. Il s’agit d’un indicateur d’entreprises enregistrées, non d’un comptage de personnes ni d’une mesure LFS du travail indépendant.",
    },
    "imprese-straniere-settori-corrispondenza-diretta": {
      title: "Entreprises étrangères enregistrées par secteur — correspondance directe",
      description: "Nombre d’entreprises étrangères enregistrées en Italie au 30 juin 2025 pour les secteurs de la taxonomie du Centre d’études correspondant directement à une section ATECO publiée par la source.",
      purpose: "Permettre une lecture sectorielle de l’entrepreneuriat étranger sans imposer d’agrégations entre des classifications non équivalentes.",
      methodology: "Source : Futurae / InfoCamere / Unioncamere, figure 8 du rapport du premier semestre 2025. Seules les sections ATECO en correspondance univoque avec la taxonomie du Centre d’études sont importées : A agriculture, C industrie manufacturière, F construction, G commerce, H transport et entreposage, I hébergement et restauration. Les autres sections de la figure originale restent dans la source et ne sont pas remappées arbitrairement.",
    },
    "lavoro-autonomo-per-cittadinanza": {
      title: "Travail indépendant selon la citoyenneté",
      description: "Personnes exerçant un travail indépendant en Italie selon la citoyenneté (enquête Eurostat sur les forces de travail). Les valeurs sont exprimées en personnes ; la source Eurostat est initialement en milliers de personnes (THS_PER).",
      purpose: "Fournir une référence officielle sur le travail indépendant selon la citoyenneté, distincte des entreprises contrôlées par des personnes nées à l’étranger selon la définition des chambres de commerce et du concept plus large d’entrepreneur migrant.",
      methodology: "Source : jeu de données Eurostat lfsa_esgan (Self-employed persons by citizenship). Filtres : geo=IT, wstatus=SELF, sex=T, age=Y15-64. L’unité source Eurostat est le millier de personnes ; les valeurs sont converties en personnes dans la base du Centre d’études pour rester cohérentes avec l’unité count/units. La dimension citizen indique la citoyenneté statistique, non le lieu de naissance ni les entreprises du Registre des entreprises.",
    },
    "quota-lavoro-autonomo-per-cittadinanza-ue": {
      title: "Part du travail indépendant selon la citoyenneté dans l’UE",
      description: "Part des personnes occupées exerçant un travail indépendant dans l’Union européenne, ventilée selon la citoyenneté.",
      purpose: "Comparer l’incidence du travail indépendant entre ressortissants nationaux, citoyens d’autres pays de l’UE et citoyens hors UE.",
      methodology: "Source : Eurostat, EU-LFS, population de 20 à 64 ans. Mesure la part des travailleurs indépendants dans l’ensemble des personnes occupées au niveau UE-27. La citoyenneté n’équivaut ni au lieu de naissance ni à la définition d’entreprise étrangère utilisée par les chambres de commerce.",
    },
    "tasso-lavoro-autonomo-per-luogo-nascita": {
      title: "Taux de travail indépendant selon le lieu de naissance",
      description: "Part de la population occupée travaillant à son compte, en distinguant les personnes nées à l’étranger et celles nées dans le pays.",
      purpose: "Comparer, au moyen d’une mesure homogène, la diffusion du travail indépendant entre personnes nées à l’étranger et personnes nées dans le pays, en montrant les différences entre pays sans les transformer en classement de qualité entrepreneuriale.",
      methodology: "OCDE, International Migration Outlook 2024, tableau 4.1. Taux de travail indépendant dans la population occupée, année 2022, pourcentage. FB = foreign-born / nés à l’étranger ; NB = native-born / nés dans le pays. La mesure concerne les personnes occupées et le lieu de naissance : elle ne coïncide ni avec la citoyenneté ni avec le nombre d’entreprises enregistrées.",
    },
  },
  es: {
    "imprese-individuali-paese-nascita-titolare-atlas": {
      title: "Empresas individuales por país de nacimiento del titular — países del Atlas",
      description: "Número de empresas individuales registradas en Italia cuyo titular nació en uno de los países incluidos en el primer ámbito del Atlas.",
      purpose: "Medir la presencia empresarial en Italia de las comunidades de origen incluidas en el primer Atlas, manteniendo separado el lugar de nacimiento de la ciudadanía.",
      methodology: "Fuente: Futurae / InfoCamere / Unioncamere, figura 13 del informe del primer semestre de 2025. Valores a 30 de junio de 2025, solo empresas individuales. El país indica el lugar de nacimiento del titular. La figura original presenta las 20 principales comunidades extranjeras; esta serie importa únicamente las pertenecientes al ámbito aprobado del primer Atlas y no debe interpretarse como una clasificación completa de todos los orígenes.",
    },
    "imprese-straniere-registrate": {
      title: "Empresas extranjeras registradas",
      description: "Número de empresas clasificadas como extranjeras e inscritas en el Registro de Empresas en la fecha de referencia.",
      purpose: "Medir el stock registral de empresas extranjeras con una definición explícita y separada de los indicadores sobre trabajo autónomo de las personas.",
      methodology: "Fuente: Registro de Empresas, elaborado por InfoCamere dentro del programa Futurae. «Extranjera» indica que la participación total de personas físicas no nacidas en Italia supera el 50 %, combinando cuotas y cargos administrativos según el tipo de empresa. Es un indicador de empresas registradas, no un recuento de personas ni una medida LFS de trabajo autónomo.",
    },
    "imprese-straniere-settori-corrispondenza-diretta": {
      title: "Empresas extranjeras registradas por sector — correspondencia directa",
      description: "Número de empresas extranjeras registradas en Italia a 30 de junio de 2025 para los sectores de la taxonomía del Centro de Estudios que corresponden directamente a una sección ATECO publicada por la fuente.",
      purpose: "Permitir una lectura sectorial del emprendimiento extranjero sin forzar agregaciones entre clasificaciones no equivalentes.",
      methodology: "Fuente: Futurae / InfoCamere / Unioncamere, figura 8 del informe del primer semestre de 2025. Solo se importan las secciones ATECO con correspondencia unívoca con la taxonomía del Centro de Estudios: A agricultura, C manufactura, F construcción, G comercio, H transporte y almacenamiento, I alojamiento y restauración. Las demás secciones de la figura original permanecen en la fuente y no se remapean de forma arbitraria.",
    },
    "lavoro-autonomo-per-cittadinanza": {
      title: "Trabajo autónomo por ciudadanía",
      description: "Personas en trabajo autónomo en Italia según la ciudadanía (Encuesta de Fuerza Laboral de Eurostat). Los valores se expresan en personas; la fuente Eurostat está originalmente en miles de personas (THS_PER).",
      purpose: "Proporcionar una referencia oficial sobre trabajo autónomo por ciudadanía, distinta de las empresas controladas por personas nacidas en el extranjero según la definición registral y del concepto más amplio de emprendedor migrante.",
      methodology: "Fuente: conjunto de datos Eurostat lfsa_esgan (Self-employed persons by citizenship). Filtros: geo=IT, wstatus=SELF, sex=T, age=Y15-64. La unidad original de Eurostat es miles de personas; los valores se convierten a personas en la base de datos del Centro de Estudios para mantener la coherencia con la unidad count/units. La dimensión citizen indica ciudadanía estadística, no lugar de nacimiento ni empresas del Registro de Empresas.",
    },
    "quota-lavoro-autonomo-per-cittadinanza-ue": {
      title: "Proporción de trabajo autónomo por ciudadanía en la UE",
      description: "Proporción de personas ocupadas que trabajan por cuenta propia en la Unión Europea, diferenciada por ciudadanía.",
      purpose: "Comparar la incidencia del trabajo autónomo entre ciudadanos nacionales, ciudadanos de otros países de la UE y ciudadanos de fuera de la UE.",
      methodology: "Fuente: Eurostat, EU-LFS, población de 20 a 64 años. Mide la proporción de autónomos sobre el total de ocupados en la UE-27. La ciudadanía no equivale al lugar de nacimiento ni a la definición registral de empresa extranjera.",
    },
    "tasso-lavoro-autonomo-per-luogo-nascita": {
      title: "Tasa de trabajo autónomo por lugar de nacimiento",
      description: "Proporción de la población ocupada que trabaja por cuenta propia, distinguiendo entre personas nacidas en el extranjero y personas nacidas en el país.",
      purpose: "Comparar con una medida homogénea la difusión del trabajo autónomo entre nacidos en el extranjero y nacidos en el país, mostrando las diferencias entre países sin convertirlas en una clasificación de calidad empresarial.",
      methodology: "OCDE, International Migration Outlook 2024, tabla 4.1. Tasa de trabajo autónomo sobre la población ocupada, año 2022, porcentaje. FB = foreign-born / nacidos en el extranjero; NB = native-born / nacidos en el país. La medida se refiere a personas ocupadas y lugar de nacimiento: no coincide con la ciudadanía ni con el número de empresas registradas.",
    },
  },
  de: {
    "imprese-individuali-paese-nascita-titolare-atlas": {
      title: "Einzelunternehmen nach Geburtsland des Inhabers — Atlas-Länder",
      description: "Anzahl der in Italien registrierten Einzelunternehmen, deren Inhaber in einem der Länder des ersten Atlas-Umfangs geboren wurde.",
      purpose: "Die unternehmerische Präsenz der im ersten Atlas berücksichtigten Herkunftsgemeinschaften in Italien messen und dabei Geburtsort und Staatsangehörigkeit klar unterscheiden.",
      methodology: "Quelle: Futurae / InfoCamere / Unioncamere, Abb. 13 des Berichts für das 1. Halbjahr 2025. Werte zum 30. Juni 2025, nur Einzelunternehmen. Das Land bezeichnet den Geburtsort des Inhabers. Die ursprüngliche Abbildung zeigt die 20 größten ausländischen Gemeinschaften; diese Reihe übernimmt nur jene aus dem genehmigten Umfang des ersten Atlas und darf nicht als vollständige Rangliste aller Herkunftsländer verstanden werden.",
    },
    "imprese-straniere-registrate": {
      title: "Registrierte ausländische Unternehmen",
      description: "Anzahl der als ausländisch eingestuften und zum Stichtag im Unternehmensregister eingetragenen Unternehmen.",
      purpose: "Den kammerrechtlich erfassten Bestand ausländischer Unternehmen mit einer ausdrücklichen Definition messen und von Indikatoren zur Selbstständigkeit von Personen getrennt halten.",
      methodology: "Quelle: Unternehmensregister, von InfoCamere im Programm Futurae verarbeitet. „Ausländisch“ bedeutet, dass die Gesamtbeteiligung natürlicher Personen, die nicht in Italien geboren wurden, mehr als 50 % beträgt; dabei werden Beteiligungsquoten und Verwaltungsfunktionen je nach Unternehmensform kombiniert. Dies ist ein Indikator registrierter Unternehmen, keine Personenzählung und keine LFS-Messung der Selbstständigkeit.",
    },
    "imprese-straniere-settori-corrispondenza-diretta": {
      title: "Registrierte ausländische Unternehmen nach Sektor — direkte Zuordnung",
      description: "Anzahl der am 30. Juni 2025 in Italien registrierten ausländischen Unternehmen in den Sektoren der Taxonomie des Studienzentrums, die unmittelbar einem von der Quelle veröffentlichten ATECO-Abschnitt entsprechen.",
      purpose: "Eine sektorale Betrachtung ausländischen Unternehmertums ermöglichen, ohne nicht gleichwertige Klassifikationen künstlich zusammenzufassen.",
      methodology: "Quelle: Futurae / InfoCamere / Unioncamere, Abb. 8 des Berichts für das 1. Halbjahr 2025. Importiert werden nur ATECO-Abschnitte mit eindeutiger Zuordnung zur Taxonomie des Studienzentrums: A Landwirtschaft, C Verarbeitendes Gewerbe, F Baugewerbe, G Handel, H Verkehr und Lagerei, I Beherbergung und Gastronomie. Die übrigen Abschnitte der Originalabbildung verbleiben in der Quelle und werden nicht willkürlich neu zugeordnet.",
    },
    "lavoro-autonomo-per-cittadinanza": {
      title: "Selbstständigkeit nach Staatsangehörigkeit",
      description: "Selbstständig Erwerbstätige in Italien nach Staatsangehörigkeit (Eurostat-Arbeitskräfteerhebung). Die Werte werden als Personen angegeben; die Eurostat-Quelle verwendet ursprünglich Tausend Personen (THS_PER).",
      purpose: "Eine offizielle Referenz zur Selbstständigkeit nach Staatsangehörigkeit bereitstellen, getrennt von Unternehmen unter Kontrolle im Ausland geborener Personen nach Kammerdefinition und vom weiter gefassten Begriff des migrantischen Unternehmers.",
      methodology: "Quelle: Eurostat-Datensatz lfsa_esgan (Self-employed persons by citizenship). Filter: geo=IT, wstatus=SELF, sex=T, age=Y15-64. Die Eurostat-Quelle ist in Tausend Personen angegeben; für die Einheit count/units werden die Werte in der Datenbank des Studienzentrums in Personen umgerechnet. Die Dimension citizen bezeichnet die statistische Staatsangehörigkeit, nicht den Geburtsort und nicht Unternehmen im Unternehmensregister.",
    },
    "quota-lavoro-autonomo-per-cittadinanza-ue": {
      title: "Anteil der Selbstständigkeit nach Staatsangehörigkeit in der EU",
      description: "Anteil der Erwerbstätigen in Selbstständigkeit in der Europäischen Union, unterschieden nach Staatsangehörigkeit.",
      purpose: "Die Häufigkeit der Selbstständigkeit bei Staatsangehörigen des eigenen Landes, Bürgern anderer EU-Länder und Nicht-EU-Bürgern vergleichen.",
      methodology: "Quelle: Eurostat, EU-LFS, Bevölkerung im Alter von 20–64 Jahren. Gemessen wird der Anteil der Selbstständigen an allen Erwerbstätigen auf EU-27-Ebene. Staatsangehörigkeit ist weder mit dem Geburtsort noch mit der kammerrechtlichen Definition eines ausländischen Unternehmens gleichzusetzen.",
    },
    "tasso-lavoro-autonomo-per-luogo-nascita": {
      title: "Selbstständigenquote nach Geburtsort",
      description: "Anteil der Erwerbstätigen, die selbstständig arbeiten, unterschieden nach im Ausland und im Inland Geborenen.",
      purpose: "Mit einer einheitlichen Kennzahl die Verbreitung der Selbstständigkeit bei im Ausland und im Inland Geborenen vergleichen und Länderunterschiede zeigen, ohne daraus eine Rangliste unternehmerischer Qualität zu machen.",
      methodology: "OECD International Migration Outlook 2024, Tabelle 4.1. Selbstständigenquote unter den Erwerbstätigen, Jahr 2022, Prozent. FB = foreign-born / im Ausland geboren; NB = native-born / im Inland geboren. Die Kennzahl bezieht sich auf Erwerbstätige und den Geburtsort: Sie entspricht weder der Staatsangehörigkeit noch der Zahl registrierter Unternehmen.",
    },
  },
  ar: {
    "imprese-individuali-paese-nascita-titolare-atlas": {
      title: "المؤسسات الفردية حسب بلد ميلاد المالك — دول الأطلس",
      description: "عدد المؤسسات الفردية المسجلة في إيطاليا التي وُلد مالكها في إحدى الدول المشمولة في النطاق الأول للأطلس.",
      purpose: "قياس الحضور الريادي في إيطاليا لمجتمعات الأصل المشمولة في الأطلس الأول، مع إبقاء مكان الميلاد منفصلاً عن الجنسية.",
      methodology: "المصدر: Futurae / InfoCamere / Unioncamere، الشكل 13 من تقرير النصف الأول من 2025. القيم في 30 يونيو 2025، للمؤسسات الفردية فقط. تشير الدولة إلى مكان ميلاد المالك. يعرض الشكل الأصلي أكبر 20 جالية أجنبية؛ ولا تستورد هذه السلسلة إلا الجاليات الداخلة في النطاق المعتمد للأطلس الأول، ولا ينبغي تفسيرها على أنها ترتيب كامل لجميع بلدان الأصل.",
    },
    "imprese-straniere-registrate": {
      title: "المؤسسات الأجنبية المسجلة",
      description: "عدد المؤسسات المصنفة كأجنبية والمسجلة في سجل الشركات في التاريخ المرجعي.",
      purpose: "قياس رصيد المؤسسات الأجنبية المسجل لدى الغرف التجارية وفق تعريف صريح، مع فصله عن مؤشرات العمل الحر الخاصة بالأشخاص.",
      methodology: "المصدر: سجل الشركات، معالجة InfoCamere ضمن برنامج Futurae. تعني «أجنبية» أن إجمالي مشاركة الأشخاص الطبيعيين غير المولودين في إيطاليا يتجاوز 50%، مع احتساب حصص الملكية والمناصب الإدارية بحسب نوع المؤسسة. هذا مؤشر للمؤسسات المسجلة، وليس عدداً للأشخاص ولا مقياساً للعمل الحر وفق مسح القوى العاملة LFS.",
    },
    "imprese-straniere-settori-corrispondenza-diretta": {
      title: "المؤسسات الأجنبية المسجلة حسب القطاع — مطابقة مباشرة",
      description: "عدد المؤسسات الأجنبية المسجلة في إيطاليا في 30 يونيو 2025 ضمن قطاعات تصنيف مركز الدراسات التي تقابل مباشرة قسماً من تصنيف ATECO منشوراً في المصدر.",
      purpose: "إتاحة قراءة قطاعية لريادة الأعمال الأجنبية دون فرض تجميعات بين تصنيفات غير متكافئة.",
      methodology: "المصدر: Futurae / InfoCamere / Unioncamere، الشكل 8 من تقرير النصف الأول من 2025. لا تُستورد إلا أقسام ATECO ذات المطابقة الأحادية مع تصنيف مركز الدراسات: A الزراعة، C الصناعة التحويلية، F البناء، G التجارة، H النقل والتخزين، I الإقامة وخدمات الطعام. وتبقى الأقسام الأخرى في الشكل الأصلي ضمن المصدر ولا يعاد تصنيفها بصورة اعتباطية.",
    },
    "lavoro-autonomo-per-cittadinanza": {
      title: "العمل الحر حسب الجنسية",
      description: "الأشخاص العاملون لحسابهم الخاص في إيطاليا حسب الجنسية (مسح القوى العاملة في Eurostat). تُعرض القيم بعدد الأشخاص؛ بينما يورد مصدر Eurostat القيم أصلاً بآلاف الأشخاص (THS_PER).",
      purpose: "توفير مرجع رسمي للعمل الحر حسب الجنسية، منفصل عن المؤسسات التي يسيطر عليها أشخاص مولودون في الخارج وفق التعريفات التجارية وعن المفهوم الأوسع لرائد الأعمال المهاجر.",
      methodology: "المصدر: مجموعة بيانات Eurostat lfsa_esgan (Self-employed persons by citizenship). المرشحات: geo=IT، wstatus=SELF، sex=T، age=Y15-64. وحدة المصدر في Eurostat هي آلاف الأشخاص؛ وتُحوّل القيم إلى أشخاص في قاعدة بيانات مركز الدراسات للاتساق مع وحدة count/units. يشير بُعد citizen إلى الجنسية الإحصائية، لا إلى مكان الميلاد ولا إلى المؤسسات في سجل الشركات.",
    },
    "quota-lavoro-autonomo-per-cittadinanza-ue": {
      title: "حصة العمل الحر حسب الجنسية في الاتحاد الأوروبي",
      description: "حصة الأشخاص المشتغلين الذين يعملون لحسابهم الخاص في الاتحاد الأوروبي، موزعة حسب الجنسية.",
      purpose: "مقارنة انتشار العمل الحر بين مواطني الدولة نفسها ومواطني دول أخرى في الاتحاد الأوروبي والمواطنين من خارج الاتحاد.",
      methodology: "المصدر: Eurostat، EU-LFS، السكان من 20 إلى 64 سنة. يقيس حصة العاملين لحسابهم الخاص من إجمالي المشتغلين على مستوى الاتحاد الأوروبي-27. ولا تعادل الجنسية مكان الميلاد ولا تعريف المؤسسة الأجنبية المستخدم لدى الغرف التجارية.",
    },
    "tasso-lavoro-autonomo-per-luogo-nascita": {
      title: "معدل العمل الحر حسب مكان الميلاد",
      description: "حصة السكان المشتغلين الذين يعملون لحسابهم الخاص، مع التمييز بين المولودين في الخارج والمولودين في البلد.",
      purpose: "مقارنة انتشار العمل الحر بين المولودين في الخارج والمولودين في البلد باستخدام مقياس متجانس، وإظهار الفروق بين الدول دون تحويلها إلى ترتيب لجودة ريادة الأعمال.",
      methodology: "OECD International Migration Outlook 2024، الجدول 4.1. معدل العمل الحر ضمن السكان المشتغلين، سنة 2022، كنسبة مئوية. FB = مولودون في الخارج؛ NB = مولودون في البلد. يتعلق المقياس بالأشخاص المشتغلين ومكان الميلاد، ولا يطابق الجنسية ولا عدد المؤسسات المسجلة.",
    },
  },
  zh: {
    "imprese-individuali-paese-nascita-titolare-atlas": {
      title: "按业主出生国划分的个体企业 — 地图集国家",
      description: "在意大利登记、且业主出生于首期地图集范围内某一国家的个体企业数量。",
      purpose: "衡量首期地图集所涵盖原籍社群在意大利的创业存在，同时明确区分出生地与国籍。",
      methodology: "来源：Futurae / InfoCamere / Unioncamere，2025年上半年报告图13。数据截至2025年6月30日，仅包括个体企业。国家指业主的出生地。原图列出前20个外国社群；本系列仅导入首期地图集已批准范围内的社群，不应将其解读为所有来源地的完整排名。",
    },
    "imprese-straniere-registrate": {
      title: "登记的外国企业",
      description: "在参考日期被归类为外国企业并登记于企业注册簿的企业数量。",
      purpose: "用明确的定义衡量商会口径下外国企业的存量，并与个人自雇指标保持区分。",
      methodology: "来源：企业注册簿，由 InfoCamere 在 Futurae 项目中处理。“外国”是指未出生于意大利的自然人总体参与比例超过50%，并根据企业类型综合考虑持股份额和管理职务。该指标衡量登记企业，而不是人数，也不是劳动力调查 LFS 的自雇指标。",
    },
    "imprese-straniere-settori-corrispondenza-diretta": {
      title: "按行业划分的登记外国企业 — 直接对应",
      description: "截至2025年6月30日在意大利登记的外国企业数量，按研究中心分类中与来源所发布 ATECO 门类直接对应的行业划分。",
      purpose: "在不强行合并不等价分类的前提下，对外国创业进行行业层面的观察。",
      methodology: "来源：Futurae / InfoCamere / Unioncamere，2025年上半年报告图8。仅导入与研究中心分类一一对应的 ATECO 门类：A 农业、C 制造业、F 建筑业、G 商业、H 运输和仓储、I 住宿和餐饮服务。原图中的其他门类保留在来源中，不进行任意重新映射。",
    },
    "lavoro-autonomo-per-cittadinanza": {
      title: "按国籍划分的自雇就业",
      description: "意大利按国籍划分的自雇人员（Eurostat 劳动力调查）。数值以人数表示；Eurostat 原始来源单位为千人（THS_PER）。",
      purpose: "提供按国籍划分的自雇官方参考指标，并与商会定义下由境外出生者控制的企业以及更广义的移民创业者概念区分开来。",
      methodology: "来源：Eurostat 数据集 lfsa_esgan（Self-employed persons by citizenship）。筛选条件：geo=IT、wstatus=SELF、sex=T、age=Y15-64。Eurostat 原始单位为千人；研究中心数据库将其换算为人数，以与 count/units 单位保持一致。citizen 维度表示统计国籍，不表示出生地，也不表示企业注册簿中的企业。",
    },
    "quota-lavoro-autonomo-per-cittadinanza-ue": {
      title: "欧盟按国籍划分的自雇比例",
      description: "欧盟就业人口中自雇人员的比例，按国籍分类。",
      purpose: "比较本国公民、其他欧盟国家公民和非欧盟公民的自雇发生率。",
      methodology: "来源：Eurostat，EU-LFS，20–64岁人口。衡量欧盟27国层面自雇人员占全部就业人口的比例。国籍不等同于出生地，也不等同于商会对外国企业的定义。",
    },
    "tasso-lavoro-autonomo-per-luogo-nascita": {
      title: "按出生地划分的自雇率",
      description: "就业人口中自营工作的比例，区分境外出生者与本国出生者。",
      purpose: "使用统一指标比较境外出生者和本国出生者的自雇普及程度，展示各国差异，同时避免将其转化为创业质量排名。",
      methodology: "OECD《International Migration Outlook 2024》表4.1。2022年就业人口中的自雇率，单位为百分比。FB = foreign-born / 境外出生；NB = native-born / 本国出生。该指标涉及就业人口和出生地，并不等同于国籍，也不等同于登记企业数量。",
    },
  },
};

export const EVENT_TRANSLATIONS: Record<PublicTranslationLocale, Record<string, EventCopy>> = {
  en: {
    "30440dcc-d67b-41ff-9d95-c6c14af40e90": {
      title: "One Way Summit 2026",
      summary: "An international gathering in San Francisco for immigrant founders, bringing together entrepreneurs, investors and policy leaders.",
      description: "An annual event dedicated to immigrant entrepreneurs in the US startup ecosystem. The official programme includes a main stage, expert sessions and an international startup competition. This page reports only information verified on the official website; the programme, speakers and participation arrangements may be updated by the organiser.",
    },
  },
  fr: {
    "30440dcc-d67b-41ff-9d95-c6c14af40e90": {
      title: "One Way Summit 2026",
      summary: "Rencontre internationale à San Francisco dédiée aux fondateurs issus de l’immigration, réunissant entrepreneurs, investisseurs et responsables des politiques publiques.",
      description: "Événement annuel consacré aux entrepreneurs immigrés dans l’écosystème américain des startups. Le programme officiel prévoit une scène principale, des sessions avec des experts et une compétition internationale de startups. Cette fiche ne rapporte que les informations vérifiées sur le site officiel ; le programme, les intervenants et les modalités de participation peuvent être mis à jour par l’organisateur.",
    },
  },
  es: {
    "30440dcc-d67b-41ff-9d95-c6c14af40e90": {
      title: "One Way Summit 2026",
      summary: "Encuentro internacional en San Francisco dedicado a fundadores inmigrantes, con emprendedores, inversores y responsables de políticas públicas.",
      description: "Evento anual dedicado a emprendedores inmigrantes dentro del ecosistema estadounidense de startups. El programa oficial incluye un escenario principal, sesiones con expertos y una competición internacional para startups. Esta ficha recoge únicamente información verificada en la página oficial; el programa, los ponentes y las modalidades de participación pueden ser actualizados por la organización.",
    },
  },
  de: {
    "30440dcc-d67b-41ff-9d95-c6c14af40e90": {
      title: "One Way Summit 2026",
      summary: "Internationales Treffen in San Francisco für immigrantische Gründerinnen und Gründer mit Unternehmern, Investoren und politischen Entscheidungsträgern.",
      description: "Jährliche Veranstaltung für eingewanderte Unternehmerinnen und Unternehmer im US-amerikanischen Startup-Ökosystem. Das offizielle Programm umfasst eine Hauptbühne, Expertensitzungen und einen internationalen Startup-Wettbewerb. Diese Seite gibt ausschließlich Informationen wieder, die auf der offiziellen Website überprüft wurden; Programm, Redner und Teilnahmebedingungen können vom Veranstalter aktualisiert werden.",
    },
  },
  ar: {
    "30440dcc-d67b-41ff-9d95-c6c14af40e90": {
      title: "One Way Summit 2026",
      summary: "لقاء دولي في سان فرانسيسكو مخصص لمؤسسي الشركات من المهاجرين، ويجمع رواد الأعمال والمستثمرين وصناع السياسات.",
      description: "فعالية سنوية مخصصة لرواد الأعمال المهاجرين في منظومة الشركات الناشئة بالولايات المتحدة. يتضمن البرنامج الرسمي منصة رئيسية وجلسات مع خبراء ومسابقة دولية للشركات الناشئة. تعرض هذه الصفحة فقط المعلومات التي جرى التحقق منها على الموقع الرسمي؛ وقد يحدّث المنظم البرنامج والمتحدثين وشروط المشاركة.",
    },
  },
  zh: {
    "30440dcc-d67b-41ff-9d95-c6c14af40e90": {
      title: "One Way Summit 2026",
      summary: "在旧金山举行的国际聚会，面向移民创业者，汇集企业家、投资者和政策领袖。",
      description: "面向美国初创企业生态中移民创业者的年度活动。官方议程包括主舞台、专家交流环节和国际初创企业竞赛。本页面仅呈现经官方网站核实的信息；活动议程、嘉宾和参与方式可能由主办方更新。",
    },
  },
};

export const EVENT_TYPE_LABELS: Record<PublicTranslationLocale, Record<string, string>> = {
  en: { conference: "Conference" },
  fr: { conference: "Conférence" },
  es: { conference: "Conferencia" },
  de: { conference: "Konferenz" },
  ar: { conference: "مؤتمر" },
  zh: { conference: "会议" },
};

export const CREATIVE_FIELDS: Record<PublicTranslationLocale, readonly string[]> = {
  en: ["Audiovisual", "Publishing", "Music", "Live performance", "Design", "Fashion", "Artistic crafts", "Cultural heritage and services"],
  fr: ["Audiovisuel", "Édition", "Musique", "Spectacle vivant", "Design", "Mode", "Métiers d’art", "Patrimoine et services culturels"],
  es: ["Audiovisual", "Edición", "Música", "Artes escénicas", "Diseño", "Moda", "Artesanía artística", "Patrimonio y servicios culturales"],
  de: ["Audiovisuelles", "Verlagswesen", "Musik", "Darstellende Künste", "Design", "Mode", "Kunsthandwerk", "Kulturerbe und kulturelle Dienstleistungen"],
  ar: ["السمعي البصري", "النشر", "الموسيقى", "فنون الأداء الحي", "التصميم", "الأزياء", "الحرف الفنية", "التراث والخدمات الثقافية"],
  zh: ["视听", "出版", "音乐", "现场表演", "设计", "时尚", "艺术工艺", "文化遗产与文化服务"],
};

export function indicatorTranslation(locale: PublicTranslationLocale, slug: string): IndicatorCopy | null {
  return INDICATOR_TRANSLATIONS[locale][slug] ?? null;
}

export function eventTranslation(locale: PublicTranslationLocale, id: string): EventCopy | null {
  return EVENT_TRANSLATIONS[locale][id] ?? null;
}

export function eventTypeLabel(locale: PublicTranslationLocale, typeCode: string): string {
  return EVENT_TYPE_LABELS[locale][typeCode] ?? typeCode.replaceAll("_", " ");
}
