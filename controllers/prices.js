const Species = require("../models/agriculture/speciesCL");
const Prices = require("../models/agriculture/prices");
const Indicator = require("../models/agriculture/indicatorCL");
const { Sequelize, Op } = require("sequelize");
const sequelize = require("../util/agriDb");
const languageMiddleware = require("../middleware/language");

const getSectionDataPrice = async (req, res) => {
  const langName = req.langName;
  const lang = req.langTranslations;

  let { indicator, year, quarter, species } = req.query;

  // console.log(req.query, "req.query");

  const query = {};

  if (!indicator) {
    res.status(400).send("Missing indicator parameter");
    return;
    // } else if (indicator == 23 || indicator == 24) {
    //   query.indicator = [23,24];
  } else {
    const indicatorArray = String(indicator).split(",");
    query.indicator = {
      [Op.in]: indicatorArray,
    };
  }

  if (!year) {
    // const maxYearResult = await Prices.findOne({
    //   attributes: [[Sequelize.fn("MAX", Sequelize.col("year")), "maxyear"]],
    // });
    // query.year = maxYearResult.dataValues.maxPeriod - 1;
  } else {
    const yearArray = String(year).split(",");
    query.year = {
      [Op.in]: yearArray,
    };
  }
  if (!species) {
    // query.species = 10;
  } else {
    const speciesArray = String(species).split(",");
    query.species = {
      [Op.in]: speciesArray,
    };
  }

  try {
    const data = await Prices.findAll({
      where: query,
      attributes: ["id", "value", "year", "quarter", "indicator"],
      include: [{ model: Species, attributes: [[langName, "name"], "code"] }],
    });

    res.json({ result: data });
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getSelectTextsPrice = async (req, res) => {
  const langName = req.langName;
  const lang = req.langTranslations;

  let { indicator } = req.query;
  const query = {};

  if (!indicator) {
    res.status(400).send("Missing indicator parameter");
    return;
  } else {
    query.indicator = indicator;
  }

  try {
    const years = await Prices.findAll({
      where: query,
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("year")), "year"],
        "quarter",
      ],
      order: [["year", "ASC"], ["quarter", "ASC"]],
    });
    
    const periodData = [];
    let currentYear = null;
    let currentYearObject = null;
    
    years.forEach((row) => {
      const year = row.dataValues.year;
      const quarter = row.dataValues.quarter;
    
      if (year !== currentYear) {
        if (currentYearObject) {
          periodData.push(currentYearObject);
        }
    
        currentYear = year;
        currentYearObject = {
          name: year.toString(),
          code: year.toString(),
          children: [],
        };
      }
    
      const romanNumeral = getRomanNumeral(quarter);
      currentYearObject.children.push({
        name: romanNumeral,
        code: quarter.toString(),
      });
    });
    
    if (currentYearObject) {
      periodData.push(currentYearObject);
    }
    
    const periodSelector = {
      title:lang.defaultS.period.title,
      placeholder: lang.defaultS.period.placeholder,
      selectValues: periodData,
    };
    
    function getRomanNumeral(number) {
      switch (number) {
        case 1:
          return `I ${lang.price.quarter}`;
        case 2:
          return  `II ${lang.price.quarter}`;
        case 3:
          return `III ${lang.price.quarter}`;
        case 4:
          return `IV ${lang.price.quarter}`;
        default:
          return "No Quarter";
      }
    }
    
    

    const species = await Prices.aggregate("species", "DISTINCT", {
      where: query,
      plain: false,
    });

    const speciesCodesAndNames = await Species.findAll({
      attributes: ["code", [langName, "name"], "parentId"],
      where: { code: species.map((s) => s.DISTINCT) },
      order: [["code", "ASC"]],
    });

    let speciesWithChildren;

    const speciesByParentId = speciesCodesAndNames.reduce((acc, curr) => {
      const parentId = curr.parentId || "null";
      acc[parentId] = acc[parentId] || [];
      acc[parentId].push(curr);
      return acc;
    }, {});

    speciesWithChildren = speciesByParentId["null"].reduce(
      (acc, parentSpecies) => {
        const { _previousDataValues, ...dataValues } = parentSpecies.dataValues;
        const species = {
          ...dataValues,
          childrens: speciesByParentId[parentSpecies.code] || [],
        };

        acc.species.push(species);

        return acc;
      },
      { species: [] }
    );

    const speciesSelector = {
      title: lang.price.title,
      placeholder: lang.price.chartTitle,
      selectValues: speciesWithChildren.species,    };

    res.json({
      periodSelector,
      speciesSelector,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getTitleTextsPrice = async (req, res) => {
  const lang = req.langTranslations;

  const langName = req.langName;


  try {
    const result = await Prices.findAll({
      attributes: ["indicator"],
      include: [
        {
          model: Indicator,
          attributes: [langName, "code"],
        },
      ],
    });



    const indicatorSet = new Set();
    const uniqueIndicators = result.reduce((acc, item) => {
      const code = item.cl_indicator.code;
      const title = item.cl_indicator[langName];
      const indicatorKey = `${title}_${code}`;
      if (!indicatorSet.has(indicatorKey)) {
        indicatorSet.add(indicatorKey);
        acc.push({ title, code,});
      }
      return acc;
    }, []);



    const cards = uniqueIndicators.reduce((acc, item, index) => {
      const cardName = `card${index + 1}`;
      // console.log(lang[`${section}`][cardName]?.chartTitle);
      // const choosenCard = lang[`${section}`][cardName];
      const choosenCard = [cardName];

      const chartTitle = choosenCard?.chartTitle;

      acc[cardName] = {
        title: item.title,
        code: parseInt(item.code),
        chartTitle: lang.price.chartTitle,

      };
      return acc;
    }, {});
   
    res.json({ cards });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports = {
  getSectionDataPrice,
  getSelectTextsPrice,
  getTitleTextsPrice
};
