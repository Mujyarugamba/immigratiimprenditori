import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isPlatformLocale, type PlatformLocale } from "@/lib/i18n/config";
import { languageAlternates } from "@/lib/i18n/seo";

type Locale = Exclude<PlatformLocale, "it">;
type PolicySection = {
  title: string;
  paragraphs: readonly string[];
  bullets?: readonly string[];
  contactLead?: string;
};
type PolicyCopy = {
  kicker: string;
  title: string;
  description: string;
  intro: string;
  sections: readonly PolicySection[];
};

const COPY: Record<Locale, PolicyCopy> = {
  en: {
    kicker: "Immigrati Imprenditori · AIPEL Research Centre",
    title: "Editorial policy and corrections",
    description: "Editorial principles, source criteria and correction policy of Immigrati Imprenditori.",
    intro: "Immigrati Imprenditori studies and documents migrant entrepreneurship through a clear and recognisable method: identifiable sources, a distinction between data and interpretation, human editorial responsibility and transparent correction of errors.",
    sections: [
      { title: "1. Editorial independence", paragraphs: ["Decisions about what to study, verify and publish belong to the editorial team. Support, partnerships, sponsorships and institutional relationships do not grant any right of prior approval, alteration or removal of editorial content."] },
      { title: "2. Data, analysis and opinions", paragraphs: ["As far as possible, the project distinguishes three levels: documentable data or facts; analysis and interpretations by the editorial team or authors; and opinions attributed to interviewees or quoted parties. A testimony is not presented as statistical data, and an interpretation is not presented as an established fact."] },
      { title: "3. Source hierarchy and transparency", paragraphs: ["Sources are assessed according to the nature of the content. The editorial register distinguishes at least:"], bullets: ["official and statistical sources", "academic research", "institutions and public bodies", "research centres, foundations and independent organisations", "associations and representative organisations", "press and media", "testimonies and direct interviews"], },
      { title: "4. Verification", paragraphs: ["The editorial team seeks the primary source when available, compares relevant information and assesses the reliability of secondary sources. Controversial or potentially harmful claims require a level of verification proportionate to their seriousness."] },
      { title: "5. Stories, interviews and testimonies", paragraphs: ["People's voices are an essential part of the project, but they do not replace verification. Quotations must preserve the meaning of what was said. Photographs, audio, video and personal materials are published only when the editorial team has the authorisations and legal bases required in the specific case."] },
      { title: "6. External contributions", paragraphs: ["Leads, stories and proposals submitted through participation forms are not published automatically. They enter the private Inbox and may be verified, investigated, assigned, rejected or archived. Responsibility for publication remains with the editorial team."] },
      { title: "7. Corrections and updates", paragraphs: ["A verified factual error is corrected without waiting for it to become publicly significant. When a change substantially affects the meaning of the content, the page should state that it has been corrected or updated and, when useful, indicate the nature and date of the change.", "Purely typographical or formal corrections that do not change the meaning may be made without a separate note. Content may be withdrawn when it cannot be corrected adequately or when duly justified legal or safeguarding reasons arise."] },
      { title: "8. Conflicts of interest", paragraphs: ["Authors and collaborators must disclose to the editorial team any professional, financial or personal interests directly relevant to the content. When a conflict is significant for the reader, it is disclosed in the content or managed through a different editorial assignment."] },
      { title: "9. Automation and artificial intelligence tools", paragraphs: ["Automated systems may support research, monitoring, classification, transcription or preparatory work. Source verification, the decision to publish original editorial content and editorial responsibility remain human.", "To make already published editorial content more accessible, the site may display automatic translations generated with artificial intelligence. These translations are identified as such, may contain errors and do not necessarily undergo prior human review. They do not alter or replace the original content: in case of doubt or discrepancy, the version in the original language always prevails and remains accessible from the translated page."] },
      { title: "10. Correction requests", paragraphs: [], contactLead: "Reasoned reports of errors may be sent to the editorial team at" },
    ],
  },
  fr: {
    kicker: "Immigrati Imprenditori · Centre d’études AIPEL",
    title: "Politique éditoriale et corrections",
    description: "Principes éditoriaux, critères relatifs aux sources et politique de correction d’Immigrati Imprenditori.",
    intro: "Immigrati Imprenditori étudie et documente l’entrepreneuriat migrant selon une méthode claire et reconnaissable : sources identifiables, distinction entre données et interprétations, responsabilité humaine de la rédaction et correction transparente des erreurs.",
    sections: [
      { title: "1. Indépendance éditoriale", paragraphs: ["Les décisions concernant ce qui doit être étudié, vérifié et publié relèvent de la rédaction. Les soutiens, partenariats, parrainages et relations institutionnelles ne confèrent aucun droit d’approbation préalable, de modification ou de suppression des contenus éditoriaux."] },
      { title: "2. Données, analyses et opinions", paragraphs: ["Dans la mesure du possible, le projet distingue trois niveaux : les données ou faits documentables ; les analyses et interprétations de la rédaction ou des auteurs ; les opinions attribuées aux personnes interrogées ou citées. Un témoignage n’est pas présenté comme une donnée statistique et une interprétation n’est pas présentée comme un fait établi."] },
      { title: "3. Hiérarchie et transparence des sources", paragraphs: ["Les sources sont évaluées en fonction de la nature du contenu. Le registre éditorial distingue au moins :"], bullets: ["sources officielles et statistiques", "recherche académique", "institutions et organismes publics", "centres d’études, fondations et organismes indépendants", "associations et organisations représentatives", "presse et médias", "témoignages et entretiens directs"], },
      { title: "4. Vérification", paragraphs: ["La rédaction recherche la source primaire lorsqu’elle est disponible, confronte les informations pertinentes et évalue la fiabilité des sources secondaires. Les affirmations controversées ou potentiellement préjudiciables exigent un niveau de vérification proportionné à leur gravité."] },
      { title: "5. Récits, entretiens et témoignages", paragraphs: ["La voix des personnes est une composante essentielle du projet, mais elle ne remplace pas la vérification. Les citations doivent respecter le sens des déclarations. Les photographies, fichiers audio, vidéos et documents personnels ne sont publiés que lorsque la rédaction dispose des autorisations et des bases nécessaires au cas concret."] },
      { title: "6. Contributions externes", paragraphs: ["Les signalements, récits et propositions envoyés au moyen des formulaires de participation ne sont pas publiés automatiquement. Ils entrent dans l’Inbox privée et peuvent être vérifiés, approfondis, attribués, refusés ou archivés. La responsabilité de la publication reste à la rédaction."] },
      { title: "7. Corrections et mises à jour", paragraphs: ["Une erreur factuelle vérifiée est corrigée sans attendre qu’elle devienne médiatiquement importante. Lorsqu’une modification change substantiellement le sens du contenu, la page doit indiquer qu’elle a été corrigée ou mise à jour et, lorsque cela est utile, préciser la nature et la date de la modification.", "Les corrections purement typographiques ou formelles qui ne modifient pas le sens peuvent être effectuées sans note séparée. Un contenu peut être retiré lorsqu’il n’est pas possible de le corriger de manière suffisante ou lorsque des raisons juridiques ou de protection dûment motivées apparaissent."] },
      { title: "8. Conflits d’intérêts", paragraphs: ["Les auteurs et collaborateurs doivent signaler à la rédaction les intérêts professionnels, économiques ou personnels directement pertinents pour le contenu. Lorsqu’un conflit est significatif pour le lecteur, il est déclaré dans le contenu ou géré par une autre attribution éditoriale."] },
      { title: "9. Automatisation et outils d’intelligence artificielle", paragraphs: ["Les systèmes automatiques peuvent soutenir la recherche, la veille, la classification, la transcription ou des activités préparatoires. La vérification des sources, la décision de publier un contenu éditorial original et la responsabilité éditoriale restent humaines.", "Afin de rendre plus accessibles des contenus éditoriaux déjà publiés, le site peut afficher des traductions automatiques générées par intelligence artificielle. Ces traductions sont identifiées comme telles, peuvent contenir des erreurs et ne font pas nécessairement l’objet d’une révision humaine préalable. Elles ne modifient ni ne remplacent le contenu original : en cas de doute ou de divergence, la version dans la langue originale prévaut toujours et reste accessible depuis la page traduite."] },
      { title: "10. Demandes de correction", paragraphs: [], contactLead: "Les signalements motivés d’erreurs peuvent être envoyés à la rédaction à l’adresse" },
    ],
  },
  es: {
    kicker: "Immigrati Imprenditori · Centro de Estudios AIPEL",
    title: "Política editorial y correcciones",
    description: "Principios editoriales, criterios sobre las fuentes y política de correcciones de Immigrati Imprenditori.",
    intro: "Immigrati Imprenditori estudia y documenta el emprendimiento migrante con un método claro y reconocible: fuentes identificables, distinción entre datos e interpretaciones, responsabilidad humana de la redacción y corrección transparente de los errores.",
    sections: [
      { title: "1. Independencia editorial", paragraphs: ["Las decisiones sobre qué estudiar, verificar y publicar corresponden a la redacción. Los apoyos, alianzas, patrocinios y relaciones institucionales no otorgan ningún derecho de aprobación previa, modificación o retirada de los contenidos editoriales."] },
      { title: "2. Datos, análisis y opiniones", paragraphs: ["En la medida de lo posible, el proyecto distingue tres niveles: datos o hechos documentables; análisis e interpretaciones de la redacción o de los autores; y opiniones atribuidas a personas entrevistadas o citadas. Un testimonio no se presenta como dato estadístico y una interpretación no se presenta como hecho probado."] },
      { title: "3. Jerarquía y transparencia de las fuentes", paragraphs: ["Las fuentes se evalúan en función de la naturaleza del contenido. El registro editorial distingue al menos:"], bullets: ["fuentes oficiales y estadísticas", "investigación académica", "instituciones y organismos públicos", "centros de estudios, fundaciones y organismos independientes", "asociaciones y organizaciones representativas", "prensa y medios", "testimonios y entrevistas directas"], },
      { title: "4. Verificación", paragraphs: ["La redacción busca la fuente primaria cuando está disponible, contrasta la información relevante y evalúa la fiabilidad de las fuentes secundarias. Las afirmaciones controvertidas o potencialmente lesivas requieren un nivel de verificación proporcional a su gravedad."] },
      { title: "5. Historias, entrevistas y testimonios", paragraphs: ["Las voces de las personas son una parte esencial del proyecto, pero no sustituyen la verificación. Las citas deben respetar el sentido de las declaraciones. Fotografías, audios, vídeos y materiales personales solo se publican cuando la redacción dispone de las autorizaciones y bases necesarias para el caso concreto."] },
      { title: "6. Contribuciones externas", paragraphs: ["Los avisos, historias y propuestas enviados mediante los formularios de participación no se publican automáticamente. Entran en la Inbox privada y pueden ser verificados, estudiados, asignados, rechazados o archivados. La responsabilidad de la publicación sigue correspondiendo a la redacción."] },
      { title: "7. Correcciones y actualizaciones", paragraphs: ["Un error factual verificado se corrige sin esperar a que adquiera relevancia mediática. Cuando una modificación afecta de forma sustancial al significado del contenido, la página debe indicar que ha sido corregida o actualizada y, cuando sea útil, señalar la naturaleza y la fecha del cambio.", "Las correcciones meramente tipográficas o formales que no cambian el significado pueden realizarse sin una nota separada. Un contenido puede retirarse cuando no sea posible corregirlo adecuadamente o cuando surjan razones jurídicas o de protección debidamente motivadas."] },
      { title: "8. Conflictos de interés", paragraphs: ["Autores y colaboradores deben comunicar a la redacción los intereses profesionales, económicos o personales directamente relevantes para el contenido. Cuando un conflicto sea significativo para el lector, se declara en el contenido o se gestiona mediante una asignación editorial diferente."] },
      { title: "9. Automatización y herramientas de inteligencia artificial", paragraphs: ["Los sistemas automáticos pueden apoyar la investigación, el seguimiento, la clasificación, la transcripción o tareas preparatorias. La verificación de las fuentes, la decisión de publicar contenido editorial original y la responsabilidad editorial siguen siendo humanas.", "Para hacer más accesibles contenidos editoriales ya publicados, el sitio puede mostrar traducciones automáticas generadas mediante inteligencia artificial. Estas traducciones se identifican como tales, pueden contener errores y no implican necesariamente una revisión humana previa. No modifican ni sustituyen el contenido original: en caso de duda o divergencia, prevalece siempre la versión en la lengua original, que sigue accesible desde la página traducida."] },
      { title: "10. Solicitudes de corrección", paragraphs: [], contactLead: "Las comunicaciones motivadas de errores pueden enviarse a la redacción a" },
    ],
  },
  de: {
    kicker: "Immigrati Imprenditori · AIPEL Studienzentrum",
    title: "Redaktionelle Richtlinie und Korrekturen",
    description: "Redaktionelle Grundsätze, Kriterien für Quellen und Korrekturpraxis von Immigrati Imprenditori.",
    intro: "Immigrati Imprenditori untersucht und dokumentiert migrantisches Unternehmertum nach einer klaren und erkennbaren Methode: identifizierbare Quellen, die Trennung von Daten und Interpretation, menschliche redaktionelle Verantwortung und transparente Korrektur von Fehlern.",
    sections: [
      { title: "1. Redaktionelle Unabhängigkeit", paragraphs: ["Die Entscheidungen darüber, was untersucht, überprüft und veröffentlicht wird, liegen bei der Redaktion. Unterstützung, Partnerschaften, Sponsoring und institutionelle Beziehungen begründen kein Recht auf vorherige Genehmigung, Änderung oder Entfernung redaktioneller Inhalte."] },
      { title: "2. Daten, Analysen und Meinungen", paragraphs: ["Soweit möglich unterscheidet das Projekt drei Ebenen: dokumentierbare Daten oder Tatsachen; Analysen und Interpretationen der Redaktion oder der Autoren; sowie Meinungen, die interviewten oder zitierten Personen zugeschrieben werden. Eine Aussage wird nicht als statistischer Wert und eine Interpretation nicht als feststehende Tatsache dargestellt."] },
      { title: "3. Hierarchie und Transparenz der Quellen", paragraphs: ["Quellen werden nach der Art des Inhalts bewertet. Das redaktionelle Register unterscheidet mindestens:"], bullets: ["offizielle und statistische Quellen", "akademische Forschung", "Institutionen und öffentliche Stellen", "Studienzentren, Stiftungen und unabhängige Organisationen", "Verbände und Interessenvertretungen", "Presse und Medien", "Aussagen und direkte Interviews"], },
      { title: "4. Überprüfung", paragraphs: ["Die Redaktion sucht nach Möglichkeit die Primärquelle, vergleicht relevante Informationen und bewertet die Zuverlässigkeit sekundärer Quellen. Kontroverse oder potenziell schädigende Behauptungen erfordern eine ihrem Gewicht angemessene Überprüfung."] },
      { title: "5. Geschichten, Interviews und Aussagen", paragraphs: ["Die Stimmen von Menschen sind ein wesentlicher Bestandteil des Projekts, ersetzen aber keine Überprüfung. Zitate müssen den Sinn der gemachten Aussagen wahren. Fotos, Audio, Video und persönliche Materialien werden nur veröffentlicht, wenn die Redaktion über die im konkreten Fall erforderlichen Genehmigungen und Rechtsgrundlagen verfügt."] },
      { title: "6. Externe Beiträge", paragraphs: ["Hinweise, Geschichten und Vorschläge, die über Beteiligungsformulare eingereicht werden, werden nicht automatisch veröffentlicht. Sie gelangen in die private Inbox und können überprüft, vertieft, zugewiesen, abgelehnt oder archiviert werden. Die Verantwortung für eine Veröffentlichung verbleibt bei der Redaktion."] },
      { title: "7. Korrekturen und Aktualisierungen", paragraphs: ["Ein bestätigter sachlicher Fehler wird korrigiert, ohne abzuwarten, bis er öffentliche Aufmerksamkeit erlangt. Wenn eine Änderung die Aussage eines Inhalts wesentlich verändert, soll die Seite darauf hinweisen, dass sie korrigiert oder aktualisiert wurde, und wenn sinnvoll Art und Datum der Änderung nennen.", "Rein typografische oder formale Korrekturen, die die Bedeutung nicht verändern, können ohne gesonderten Hinweis vorgenommen werden. Inhalte können zurückgezogen werden, wenn eine ausreichende Korrektur nicht möglich ist oder wenn angemessen begründete rechtliche oder schutzbezogene Gründe auftreten."] },
      { title: "8. Interessenkonflikte", paragraphs: ["Autoren und Mitwirkende müssen der Redaktion berufliche, wirtschaftliche oder persönliche Interessen mitteilen, die für den Inhalt unmittelbar relevant sind. Ist ein Konflikt für die Leserschaft wesentlich, wird er im Inhalt offengelegt oder durch eine andere redaktionelle Zuweisung gehandhabt."] },
      { title: "9. Automatisierung und Werkzeuge der künstlichen Intelligenz", paragraphs: ["Automatisierte Systeme können Recherche, Monitoring, Klassifizierung, Transkription oder vorbereitende Tätigkeiten unterstützen. Quellenprüfung, die Entscheidung über die Veröffentlichung originärer redaktioneller Inhalte und die redaktionelle Verantwortung bleiben menschlich.", "Um bereits veröffentlichte redaktionelle Inhalte leichter zugänglich zu machen, kann die Website automatisch mit künstlicher Intelligenz erzeugte Übersetzungen anzeigen. Diese werden als solche gekennzeichnet, können Fehler enthalten und werden nicht zwingend vorher menschlich geprüft. Sie verändern oder ersetzen den Originalinhalt nicht: Bei Zweifeln oder Abweichungen gilt stets die Fassung in der Originalsprache, die von der übersetzten Seite aus zugänglich bleibt."] },
      { title: "10. Korrekturanfragen", paragraphs: [], contactLead: "Begründete Hinweise auf Fehler können an die Redaktion gesendet werden unter" },
    ],
  },
  ar: {
    kicker: "Immigrati Imprenditori · مركز الدراسات AIPEL",
    title: "السياسة التحريرية والتصحيحات",
    description: "المبادئ التحريرية ومعايير المصادر وسياسة التصحيح لدى Immigrati Imprenditori.",
    intro: "يدرس Immigrati Imprenditori ريادة الأعمال لدى المهاجرين ويوثقها وفق منهج واضح يمكن التعرف عليه: مصادر قابلة للتحديد، وتمييز بين البيانات والتفسير، ومسؤولية تحريرية بشرية، وتصحيح شفاف للأخطاء.",
    sections: [
      { title: "1. الاستقلال التحريري", paragraphs: ["تعود قرارات ما ينبغي دراسته والتحقق منه ونشره إلى هيئة التحرير. ولا تمنح أشكال الدعم أو الشراكات أو الرعاية أو العلاقات المؤسسية أي حق في الموافقة المسبقة على المحتوى التحريري أو تعديله أو حذفه."] },
      { title: "2. البيانات والتحليل والآراء", paragraphs: ["يميز المشروع، قدر الإمكان، بين ثلاثة مستويات: البيانات أو الوقائع القابلة للتوثيق؛ والتحليلات والتفسيرات التي تقدمها هيئة التحرير أو المؤلفون؛ والآراء المنسوبة إلى الأشخاص الذين تمت مقابلتهم أو الاستشهاد بهم. ولا تُعرض الشهادة بوصفها بيانات إحصائية، كما لا يُعرض التفسير بوصفه حقيقة ثابتة."] },
      { title: "3. تراتبية المصادر وشفافيتها", paragraphs: ["تُقيَّم المصادر بحسب طبيعة المحتوى. ويميز السجل التحريري على الأقل بين:"], bullets: ["المصادر الرسمية والإحصائية", "البحوث الأكاديمية", "المؤسسات والهيئات العامة", "مراكز الدراسات والمؤسسات والهيئات المستقلة", "الجمعيات والهيئات التمثيلية", "الصحافة ووسائل الإعلام", "الشهادات والمقابلات المباشرة"], },
      { title: "4. التحقق", paragraphs: ["تسعى هيئة التحرير إلى الرجوع إلى المصدر الأولي عندما يكون متاحاً، وتقارن المعلومات ذات الصلة وتقيّم موثوقية المصادر الثانوية. وتتطلب الادعاءات المثيرة للجدل أو التي قد تسبب ضرراً مستوى من التحقق يتناسب مع خطورتها."] },
      { title: "5. القصص والمقابلات والشهادات", paragraphs: ["أصوات الأشخاص جزء أساسي من المشروع، لكنها لا تحل محل التحقق. ويجب أن تحافظ الاقتباسات على معنى التصريحات الأصلية. ولا تُنشر الصور أو التسجيلات الصوتية أو المرئية أو المواد الشخصية إلا عندما تتوفر لدى هيئة التحرير التصاريح والأسس اللازمة للحالة المعنية."] },
      { title: "6. المساهمات الخارجية", paragraphs: ["لا تُنشر الإشارات والقصص والمقترحات المرسلة عبر نماذج المشاركة بصورة تلقائية. بل تدخل إلى صندوق التحرير الخاص ويمكن التحقق منها أو تعميقها أو إسنادها أو رفضها أو أرشفتها. وتبقى مسؤولية النشر لدى هيئة التحرير."] },
      { title: "7. التصحيحات والتحديثات", paragraphs: ["يُصحح الخطأ الواقعي الذي تم التحقق منه من دون انتظار أن يصبح ذا أهمية إعلامية. وعندما يؤثر التعديل بصورة جوهرية في معنى المحتوى، ينبغي أن تشير الصفحة إلى أنها صُححت أو حُدثت، وأن توضح عند الحاجة طبيعة التغيير وتاريخه.", "يمكن إجراء التصحيحات الطباعية أو الشكلية البحتة التي لا تغير المعنى من دون ملاحظة منفصلة. ويمكن سحب المحتوى عندما لا يكون من الممكن تصحيحه على نحو كافٍ أو عندما تظهر أسباب قانونية أو أسباب حماية مبررة بصورة مناسبة."] },
      { title: "8. تضارب المصالح", paragraphs: ["يجب على المؤلفين والمتعاونين إبلاغ هيئة التحرير بأي مصالح مهنية أو اقتصادية أو شخصية ذات صلة مباشرة بالمحتوى. وإذا كان التضارب مهماً للقارئ، فيُكشف عنه داخل المحتوى أو يُدار بإسناد تحريري مختلف."] },
      { title: "9. الأتمتة وأدوات الذكاء الاصطناعي", paragraphs: ["يمكن للأنظمة الآلية دعم البحث والرصد والتصنيف والنسخ أو الأعمال التحضيرية. لكن التحقق من المصادر، وقرار نشر محتوى تحريري أصلي، والمسؤولية التحريرية تبقى بشرية.", "لتسهيل الوصول إلى محتوى تحريري منشور بالفعل، قد يعرض الموقع ترجمات آلية مولدة بالذكاء الاصطناعي. ويجري تعريف هذه الترجمات بوضوح على أنها آلية، وقد تتضمن أخطاء، ولا تعني بالضرورة أنها خضعت لمراجعة بشرية مسبقة. وهي لا تعدل المحتوى الأصلي ولا تستبدله: عند الشك أو الاختلاف تسود دائماً النسخة باللغة الأصلية، وتظل متاحة من الصفحة المترجمة."] },
      { title: "10. طلبات التصحيح", paragraphs: [], contactLead: "يمكن إرسال البلاغات المعللة عن الأخطاء إلى هيئة التحرير على العنوان" },
    ],
  },
  zh: {
    kicker: "Immigrati Imprenditori · AIPEL 研究中心",
    title: "编辑政策与更正",
    description: "Immigrati Imprenditori 的编辑原则、来源标准与更正政策。",
    intro: "Immigrati Imprenditori 以清晰、可识别的方法研究并记录移民创业：来源可识别，区分数据与解释，坚持由人承担编辑责任，并以透明方式更正错误。",
    sections: [
      { title: "1. 编辑独立性", paragraphs: ["研究什么、核实什么以及发布什么，由编辑团队决定。资助、合作、赞助及机构关系均不赋予任何一方预先批准、修改或删除编辑内容的权利。"] },
      { title: "2. 数据、分析与观点", paragraphs: ["在可能的情况下，本项目区分三个层次：可记录的数据或事实；编辑团队或作者的分析与解释；以及明确归属于受访者或被引用主体的观点。个人证言不会被当作统计数据，解释也不会被当作已经证实的事实。"] },
      { title: "3. 来源层级与透明度", paragraphs: ["来源根据内容性质进行评估。编辑登记体系至少区分："], bullets: ["官方及统计来源", "学术研究", "公共机构和公共组织", "研究中心、基金会及独立机构", "协会及代表性组织", "新闻与媒体", "证言及直接访谈"], },
      { title: "4. 核实", paragraphs: ["在存在一手来源时，编辑团队会优先寻找一手来源，对照相关信息，并评估二手来源的可靠性。具有争议或可能造成损害的主张，需要与其严重程度相称的核实。"] },
      { title: "5. 故事、访谈与证言", paragraphs: ["人的声音是本项目的重要组成部分，但不能替代核实。引用必须忠实于原始陈述的含义。照片、音频、视频及个人材料，仅在编辑团队具备具体情形所需的授权及相应依据时发布。"] },
      { title: "6. 外部投稿", paragraphs: ["通过参与表单提交的线索、故事和建议不会自动发布。它们进入非公开编辑收件箱，可被核实、进一步调查、分派、拒绝或归档。发布责任始终由编辑团队承担。"] },
      { title: "7. 更正与更新", paragraphs: ["一旦核实存在事实性错误，即会进行更正，而不会等到错误获得媒体关注。若修改对内容含义产生实质影响，页面应说明内容已被更正或更新；在适当情况下，还应说明修改的性质和日期。", "不改变含义的纯排版或形式更正可以不另行说明。若内容无法得到充分更正，或出现有充分理由的法律或保护方面的原因，内容可以被撤下。"] },
      { title: "8. 利益冲突", paragraphs: ["作者和合作人员必须向编辑团队申报与内容直接相关的职业、经济或个人利益。如果利益冲突对读者具有重要意义，应在内容中披露，或通过重新安排编辑任务进行管理。"] },
      { title: "9. 自动化与人工智能工具", paragraphs: ["自动化系统可以支持研究、监测、分类、转录或准备工作。来源核实、是否发布原创编辑内容的决定以及编辑责任始终由人承担。", "为了提高已发布编辑内容的可访问性，网站可能展示由人工智能生成的自动翻译。这类翻译会被明确标识，可能包含错误，也不一定经过事先人工审校。它们不会修改或取代原始内容：如有疑问或差异，始终以原始语言版本为准，并可从翻译页面访问原文。"] },
      { title: "10. 更正请求", paragraphs: [], contactLead: "有依据的错误报告可发送至编辑团队：" },
    ],
  },
};

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") return { robots: { index: false, follow: false } };
  const copy = COPY[locale];
  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: `/${locale}/politica-editoriale`,
      languages: languageAlternates("/politica-editoriale"),
    },
  };
}

export default async function LocalizedEditorialPolicyPage({ params }: Props) {
  const { locale } = await params;
  if (!isPlatformLocale(locale) || locale === "it") notFound();
  const copy = COPY[locale];

  return (
    <main id="contenuto" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-3xl border-b border-black pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">{copy.kicker}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-black sm:text-5xl">{copy.title}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-700">{copy.intro}</p>
      </header>

      <div className="mt-10 max-w-3xl space-y-10 text-base leading-7 text-neutral-700">
        {copy.sections.map((section, index) => (
          <section key={section.title} className={index === 0 ? undefined : "border-t border-black pt-8"}>
            <h2 className="text-2xl font-semibold text-black">{section.title}</h2>
            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <p key={paragraph} className={paragraphIndex === 0 ? "mt-4" : "mt-3"}>{paragraph}</p>
            ))}
            {section.bullets ? (
              <ul className="mt-3 list-disc space-y-2 pl-6">
                {section.bullets.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : null}
            {section.contactLead ? (
              <p className="mt-4">
                {section.contactLead}{" "}
                <a href="mailto:redazione@immigratiimprenditori.it" className="break-all underline underline-offset-4">redazione@immigratiimprenditori.it</a>,
                {locale === "en" ? " indicating the relevant page and the elements that allow the request to be verified." : null}
                {locale === "fr" ? " en indiquant la page concernée et les éléments permettant de vérifier la demande." : null}
                {locale === "es" ? " indicando la página afectada y los elementos que permitan verificar la solicitud." : null}
                {locale === "de" ? " unter Angabe der betroffenen Seite und der Informationen, anhand derer die Anfrage geprüft werden kann." : null}
                {locale === "ar" ? " مع تحديد الصفحة المعنية والعناصر التي تتيح التحقق من الطلب." : null}
                {locale === "zh" ? "，并注明相关页面以及可用于核实该请求的材料。" : null}
              </p>
            ) : null}
          </section>
        ))}
      </div>
    </main>
  );
}
