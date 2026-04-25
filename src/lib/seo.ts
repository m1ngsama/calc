const BASE_URL = "https://calc.m1ng.space";

export function alternateLanguages(path: string) {
  return {
    canonical: `${BASE_URL}${path}`,
    languages: {
      en: `${BASE_URL}${path.replace(/^\/(en|zh)/, "/en")}`,
      "zh-CN": `${BASE_URL}${path.replace(/^\/(en|zh)/, "/zh")}`,
    },
  };
}
