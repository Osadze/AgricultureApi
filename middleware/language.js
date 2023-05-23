const languageMiddleware = (req, res, next) => {
  const { lang } = req.query;
  console.log("Language Middleware called");
  if (lang === "en") {
    req.langName = "nameEn";
    // console.log(lang, "shouldbeEN");
  } else {
    req.langName = "nameKa"; // Default language variable
    // console.log(lang, "shouldbeKa");
  }

  next();
};

module.exports = languageMiddleware;
