const enTranslations = require('../lang/en.json');
const kaTranslations = require('../lang/ka.json');

const languageMiddleware = (req, res, next) => {
  const { lang } = req.query;
  let langTranslations = ""
  console.log("Language Middleware called");
  if (lang === "en") {
    req.langName = "name_en";
    req.langName1 = "name_en";
    req.langTranslations = enTranslations
    // console.log(langTranslations, "shouldbeEN");
  } else {
    req.langName = "name_ka"; // Default language variable
    req.langName1 = "name_ka1";
    req.langTranslations = kaTranslations
    // console.log(langTranslations, "shouldbeKa");
  }

  next();
};

module.exports = languageMiddleware;
