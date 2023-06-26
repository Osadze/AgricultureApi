const Species = require("../models/agriculture/speciesCL");
const Prices = require("../models/agriculture/prices");
const Prices_1 = require("../models/agriculture/prices_1");
const Indicator = require("../models/agriculture/indicatorCL");
const Unit = require("../models/agriculture/unitCL");
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

  const query1 = {};
  query1.indicator = 71;

  const query2 = {};
  query2.indicator = 72;

  try {
    const years = await Prices.findAll({
      where: query1,
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("year")), "year"],
        "quarter",
      ],
      order: [
        ["year", "ASC"],
        ["quarter", "ASC"],
      ],
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
      title: lang.defaultS.period.title,
      placeholder: lang.defaultS.period.placeholder,
      selectValues: periodData,
    };

    function getRomanNumeral(number) {
      switch (number) {
        case 1:
          return `I ${lang.price.quarter}`;
        case 2:
          return `II ${lang.price.quarter}`;
        case 3:
          return `III ${lang.price.quarter}`;
        case 4:
          return `IV ${lang.price.quarter}`;
        default:
          return "No Quarter";
      }
    }

    const species1 = await Prices.aggregate("species", "DISTINCT", {
      where: query1,
      plain: false,
    });

    const speciesCodesAndNames1 = await Species.findAll({
      attributes: ["code", [langName, "name"], "parentId"],
      where: { code: species1.map((s) => s.DISTINCT) },
      order: [["code", "ASC"]],
    });

    let speciesWithChildren1;

    const speciesByParentId1 = speciesCodesAndNames1.reduce((acc, curr) => {
      const parentId = curr.parentId || "null";
      acc[parentId] = acc[parentId] || [];
      acc[parentId].push(curr);
      return acc;
    }, {});

    speciesWithChildren1 = speciesByParentId1["null"].reduce(
      (acc, parentSpecies) => {
        const { _previousDataValues, ...dataValues } = parentSpecies.dataValues;
        const species = {
          ...dataValues,
          childrens: speciesByParentId1[parentSpecies.code] || [],
        };

        acc.species.push(species);

        return acc;
      },
      { species: [] }
    );

    const species2 = await Prices.aggregate("species", "DISTINCT", {
      where: query2,
      plain: false,
    });

    const speciesCodesAndNames2 = await Species.findAll({
      attributes: ["code", [langName, "name"], "parentId"],
      where: { code: species2.map((s) => s.DISTINCT) },
      order: [["code", "ASC"]],
    });

    let speciesWithChildren2;

    const speciesByParentId2 = speciesCodesAndNames2.reduce((acc, curr) => {
      const parentId = curr.parentId || "null";
      acc[parentId] = acc[parentId] || [];
      acc[parentId].push(curr);
      return acc;
    }, {});

    speciesWithChildren2 = speciesByParentId2["null"].reduce(
      (acc, parentSpecies) => {
        const { _previousDataValues, ...dataValues } = parentSpecies.dataValues;
        const species = {
          ...dataValues,
          childrens: speciesByParentId2[parentSpecies.code] || [],
        };

        acc.species.push(species);

        return acc;
      },
      { species: [] }
    );

    const speciesSelector1 = {
      title: lang.price.title1,
      placeholder: lang.price.placeholder,
      selectValues: speciesWithChildren1.species,
    };

    const speciesSelector2 = {
      title: lang.price.title2,
      placeholder: lang.price.placeholder,
      selectValues: speciesWithChildren2.species,
    };

    res.json({
      periodSelector,
      speciesSelector1,
      speciesSelector2,
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
        acc.push({ title, code });
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

const getSectionDataPrice_2 = async (req, res) => {
  const langName = req.langName;
  const lang = req.langTranslations;

  let { period, species } = req.query;

  // console.log(req.query, "req.query");

  const query = {};

  if (!period) {
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
    const data = await Prices_1.findAll({
      where: query,
      attributes: ["id", "species", "period", "unit", "value"],
      include: [
        { model: Species, attributes: [[langName, "name"], "code"] },
        { model: Unit, attributes: [[langName, "name"], "code"] },
      ],
    });

    res.json({ result: data });
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getSelectsTextsPrice_2 = async (req, res) => {
  const lang = req.langTranslations;

  // need query

  const langName = req.langName;
  try {
    const periods = await Prices_1.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("period")), "period"],
      ],
      // where: {
      //   period: {
      //     [Sequelize.Op.gte]: 2014,
      //   },
      // },
      order: [["period", "ASC"]],
    });

    const periodData = periods.map((period) => ({
      name: period.dataValues.period,
      code: period.dataValues.period,
    }));

    const periodSelector = {
      title: lang.defaultS.period.title,
      placeholder: lang.defaultS.period.placeholder,
      selectValues: periodData,
    };

    const species = await Prices_1.aggregate("species", "DISTINCT", {
      plain: false,
      // where: query,
    });

    const speciesCodesAndNames = await Species.findAll({
      attributes: ["code", [langName, "name"]],
      where: { code: species.map((s) => s.DISTINCT) },
      order: [["code", "ASC"]],
    });

    const speciesSelector = {
      title: lang.price.title,
      placeholder: lang.price.placeholder,
      selectValues: speciesCodesAndNames,
    };

    const responseObj = {};

    // if (section == 4 || section == 5) {
    responseObj.periodSelector = periodSelector;
    responseObj.speciesSelector = speciesSelector;

    res.json(responseObj);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getSectionDataPrice,
  getSelectTextsPrice,
  getTitleTextsPrice,
  getSectionDataPrice_2,
  getSelectsTextsPrice_2,
};
