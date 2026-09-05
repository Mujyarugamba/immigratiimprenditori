import type { PlatformLocale } from "@/lib/i18n/config";

type Locale = Exclude<PlatformLocale, "it">;

const LABELS: Record<Locale, Record<string, string>> = {
  en: {
    IT:"Italy",ITA:"Italy",BEL:"Belgium",CAN:"Canada",CZE:"Czechia",FRA:"France",DEU:"Germany",NLD:"Netherlands",PRT:"Portugal",GBR:"United Kingdom",ESP:"Spain",USA:"United States",EU27:"European Union (27 countries)",OECD37:"OECD average (37 countries)",
    AL:"Albania",BD:"Bangladesh",CN:"China",FR:"France",DE:"Germany",IN:"India",MA:"Morocco",RO:"Romania",SN:"Senegal",TN:"Tunisia",UA:"Ukraine",EU_OTHER:"Citizens of other EU countries",NON_EU:"Non-EU citizens",FOR:"Foreign citizens",FB:"Foreign-born",NB:"Native-born",
    "IT-65":"Abruzzo","IT-77":"Basilicata","IT-78":"Calabria","IT-72":"Campania","IT-45":"Emilia-Romagna","IT-36":"Friuli-Venezia Giulia","IT-62":"Lazio","IT-42":"Liguria","IT-25":"Lombardy","IT-57":"Marche","IT-67":"Molise","IT-21":"Piedmont","IT-75":"Apulia","IT-88":"Sardinia","IT-82":"Sicily","IT-52":"Tuscany","IT-32":"Trentino-Alto Adige/South Tyrol","IT-55":"Umbria","IT-23":"Aosta Valley","IT-34":"Veneto",
  },
  fr: {
    IT:"Italie",ITA:"Italie",BEL:"Belgique",CAN:"Canada",CZE:"Tchéquie",FRA:"France",DEU:"Allemagne",NLD:"Pays-Bas",PRT:"Portugal",GBR:"Royaume-Uni",ESP:"Espagne",USA:"États-Unis",EU27:"Union européenne (27 pays)",OECD37:"Moyenne OCDE (37 pays)",
    AL:"Albanie",BD:"Bangladesh",CN:"Chine",FR:"France",DE:"Allemagne",IN:"Inde",MA:"Maroc",RO:"Roumanie",SN:"Sénégal",TN:"Tunisie",UA:"Ukraine",EU_OTHER:"Citoyens d’autres pays de l’UE",NON_EU:"Citoyens hors UE",FOR:"Citoyens étrangers",FB:"Nés à l’étranger",NB:"Nés dans le pays",
    "IT-65":"Abruzzes","IT-77":"Basilicate","IT-78":"Calabre","IT-72":"Campanie","IT-45":"Émilie-Romagne","IT-36":"Frioul-Vénétie Julienne","IT-62":"Latium","IT-42":"Ligurie","IT-25":"Lombardie","IT-57":"Marches","IT-67":"Molise","IT-21":"Piémont","IT-75":"Pouilles","IT-88":"Sardaigne","IT-82":"Sicile","IT-52":"Toscane","IT-32":"Trentin-Haut-Adige/Tyrol du Sud","IT-55":"Ombrie","IT-23":"Vallée d’Aoste","IT-34":"Vénétie",
  },
  es: {
    IT:"Italia",ITA:"Italia",BEL:"Bélgica",CAN:"Canadá",CZE:"Chequia",FRA:"Francia",DEU:"Alemania",NLD:"Países Bajos",PRT:"Portugal",GBR:"Reino Unido",ESP:"España",USA:"Estados Unidos",EU27:"Unión Europea (27 países)",OECD37:"Media de la OCDE (37 países)",
    AL:"Albania",BD:"Bangladés",CN:"China",FR:"Francia",DE:"Alemania",IN:"India",MA:"Marruecos",RO:"Rumanía",SN:"Senegal",TN:"Túnez",UA:"Ucrania",EU_OTHER:"Ciudadanos de otros países de la UE",NON_EU:"Ciudadanos no UE",FOR:"Ciudadanos extranjeros",FB:"Nacidos en el extranjero",NB:"Nacidos en el país",
    "IT-65":"Abruzos","IT-77":"Basilicata","IT-78":"Calabria","IT-72":"Campania","IT-45":"Emilia-Romaña","IT-36":"Friul-Venecia Julia","IT-62":"Lacio","IT-42":"Liguria","IT-25":"Lombardía","IT-57":"Marcas","IT-67":"Molise","IT-21":"Piamonte","IT-75":"Apulia","IT-88":"Cerdeña","IT-82":"Sicilia","IT-52":"Toscana","IT-32":"Trentino-Alto Adigio/Tirol del Sur","IT-55":"Umbría","IT-23":"Valle de Aosta","IT-34":"Véneto",
  },
  de: {
    IT:"Italien",ITA:"Italien",BEL:"Belgien",CAN:"Kanada",CZE:"Tschechien",FRA:"Frankreich",DEU:"Deutschland",NLD:"Niederlande",PRT:"Portugal",GBR:"Vereinigtes Königreich",ESP:"Spanien",USA:"Vereinigte Staaten",EU27:"Europäische Union (27 Länder)",OECD37:"OECD-Durchschnitt (37 Länder)",
    AL:"Albanien",BD:"Bangladesch",CN:"China",FR:"Frankreich",DE:"Deutschland",IN:"Indien",MA:"Marokko",RO:"Rumänien",SN:"Senegal",TN:"Tunesien",UA:"Ukraine",EU_OTHER:"Bürger anderer EU-Länder",NON_EU:"Nicht-EU-Bürger",FOR:"Ausländische Staatsangehörige",FB:"Im Ausland geboren",NB:"Im Inland geboren",
    "IT-65":"Abruzzen","IT-77":"Basilikata","IT-78":"Kalabrien","IT-72":"Kampanien","IT-45":"Emilia-Romagna","IT-36":"Friaul-Julisch Venetien","IT-62":"Latium","IT-42":"Ligurien","IT-25":"Lombardei","IT-57":"Marken","IT-67":"Molise","IT-21":"Piemont","IT-75":"Apulien","IT-88":"Sardinien","IT-82":"Sizilien","IT-52":"Toskana","IT-32":"Trentino-Südtirol","IT-55":"Umbrien","IT-23":"Aostatal","IT-34":"Venetien",
  },
  ar: {
    IT:"إيطاليا",ITA:"إيطاليا",BEL:"بلجيكا",CAN:"كندا",CZE:"التشيك",FRA:"فرنسا",DEU:"ألمانيا",NLD:"هولندا",PRT:"البرتغال",GBR:"المملكة المتحدة",ESP:"إسبانيا",USA:"الولايات المتحدة",EU27:"الاتحاد الأوروبي (27 دولة)",OECD37:"متوسط OECD (37 دولة)",
    AL:"ألبانيا",BD:"بنغلاديش",CN:"الصين",FR:"فرنسا",DE:"ألمانيا",IN:"الهند",MA:"المغرب",RO:"رومانيا",SN:"السنغال",TN:"تونس",UA:"أوكرانيا",EU_OTHER:"مواطنو دول أخرى في الاتحاد الأوروبي",NON_EU:"مواطنون من خارج الاتحاد الأوروبي",FOR:"مواطنون أجانب",FB:"مولودون في الخارج",NB:"مولودون في البلد",
    "IT-65":"أبروتسو","IT-77":"بازيليكاتا","IT-78":"كالابريا","IT-72":"كامبانيا","IT-45":"إميليا-رومانيا","IT-36":"فريولي-فينيتسيا جوليا","IT-62":"لاتسيو","IT-42":"ليغوريا","IT-25":"لومبارديا","IT-57":"ماركي","IT-67":"موليزي","IT-21":"بييمونتي","IT-75":"بوليا","IT-88":"سردينيا","IT-82":"صقلية","IT-52":"توسكانا","IT-32":"ترينتينو-ألتو أديجي/جنوب تيرول","IT-55":"أومبريا","IT-23":"وادي أوستا","IT-34":"فينيتو",
  },
  zh: {
    IT:"意大利",ITA:"意大利",BEL:"比利时",CAN:"加拿大",CZE:"捷克",FRA:"法国",DEU:"德国",NLD:"荷兰",PRT:"葡萄牙",GBR:"英国",ESP:"西班牙",USA:"美国",EU27:"欧盟（27国）",OECD37:"OECD平均值（37国）",
    AL:"阿尔巴尼亚",BD:"孟加拉国",CN:"中国",FR:"法国",DE:"德国",IN:"印度",MA:"摩洛哥",RO:"罗马尼亚",SN:"塞内加尔",TN:"突尼斯",UA:"乌克兰",EU_OTHER:"其他欧盟国家公民",NON_EU:"非欧盟公民",FOR:"外国公民",FB:"境外出生",NB:"本国出生",
    "IT-65":"阿布鲁佐","IT-77":"巴西利卡塔","IT-78":"卡拉布里亚","IT-72":"坎帕尼亚","IT-45":"艾米利亚-罗马涅","IT-36":"弗留利-威尼斯朱利亚","IT-62":"拉齐奥","IT-42":"利古里亚","IT-25":"伦巴第","IT-57":"马尔凯","IT-67":"莫利塞","IT-21":"皮埃蒙特","IT-75":"普利亚","IT-88":"撒丁岛","IT-82":"西西里","IT-52":"托斯卡纳","IT-32":"特伦蒂诺-上阿迪杰/南蒂罗尔","IT-55":"翁布里亚","IT-23":"瓦莱达奥斯塔","IT-34":"威尼托",
  },
};

const FALLBACK_LABELS: Record<Locale, Record<string, string>> = {
  en: {
    "Cittadini del paese dichiarante":"Citizens of the reporting country",
    "Cittadini nazionali":"National citizens",
  },
  fr: {
    "Cittadini del paese dichiarante":"Citoyens du pays déclarant",
    "Cittadini nazionali":"Citoyens nationaux",
  },
  es: {
    "Cittadini del paese dichiarante":"Ciudadanos del país declarante",
    "Cittadini nazionali":"Ciudadanos nacionales",
  },
  de: {
    "Cittadini del paese dichiarante":"Staatsangehörige des meldenden Landes",
    "Cittadini nazionali":"Inländische Staatsangehörige",
  },
  ar: {
    "Cittadini del paese dichiarante":"مواطنو البلد المُبلِّغ",
    "Cittadini nazionali":"المواطنون الوطنيون",
  },
  zh: {
    "Cittadini del paese dichiarante":"报告国公民",
    "Cittadini nazionali":"本国公民",
  },
};

export const TERRITORY_LEVEL_LABELS: Record<Locale, Record<string, string>> = {
  en:{italy:"Country",region:"Region",other:"Country / area"},
  fr:{italy:"Pays",region:"Région",other:"Pays / zone"},
  es:{italy:"País",region:"Región",other:"País / área"},
  de:{italy:"Land",region:"Region",other:"Land / Gebiet"},
  ar:{italy:"دولة",region:"إقليم",other:"دولة / منطقة"},
  zh:{italy:"国家",region:"地区",other:"国家 / 区域"},
};

export function localizedTerritoryLabel(
  locale: Locale,
  code: string | null | undefined,
  fallback: string | null | undefined,
): string {
  if (fallback && FALLBACK_LABELS[locale][fallback]) return FALLBACK_LABELS[locale][fallback];
  if (code && LABELS[locale][code]) return LABELS[locale][code];
  return fallback ?? "—";
}
