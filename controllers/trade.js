const { Sequelize, DataTypes, Op } = require("sequelize");
const TradeModel = require("../models/trade/trade_model");
const Types = require("../models/trade/typesCL");
const Hs6 = require("../models/trade/hs6CL");

const getTradeData = async (req, res) => {
  const langName = req.langName;
  let { type, year, hs6, unit } = req.query;
  const query = {};

  if (!type) {
    // res.status(400).send("Missing section parameter");
    // return;
  } else {
    const sectionArray = String(type).split(",");
    query.type = {
      [Op.in]: sectionArray,
    };
  }

  if (!hs6) {
    // res.status(400).send("Missing indicator parameter");
    // return;
  } else {
    const indicatorArray = String(hs6).split(",");
    query.hs6 = {
      [Op.in]: indicatorArray,
    };
  }

  if (unit) {
    query.suppu = {
      [Op.gt]: 0,
    };
    query.usd1000 = {
      [Op.gt]: 0,
    };
    query.tons = {
      [Op.gt]: 0,
    };
  }

  if (!year) {
    const maxYearResult = await TradeModel.findOne({
      attributes: [[Sequelize.fn("MAX", Sequelize.col("year")), "maxPeriod"]],
    });
    query.year = maxYearResult.dataValues.maxPeriod - 1;
  } else {
    const periodArray = String(year).split(",");
    query.year = {
      [Op.in]: periodArray,
    };
  }

  try {
    const attributes = ["type", "year"];

    if (unit === "3") {
      attributes.push([
        Sequelize.fn("SUM", Sequelize.col("suppu")),
        "totalvalueSuppu",
      ]);
    } else if (unit === "2") {
      // Show Tons
      attributes.push([Sequelize.fn("SUM", Sequelize.col("tons")), "value"]);
    } else {
      attributes.push([Sequelize.fn("SUM", Sequelize.col("usd1000")), "value"]);
    }

    const result = await TradeModel.findAll({
      where: query,
      limit: 20,
      attributes,
      group: ["type", "year", "hs6"],
      include: [
        {
          model: Hs6,
          as: "hs6cl",
          attributes: [
            ["name_ka", "name"],
            ["hs6_id", "code"],
          ],
        },
      ],
    });

    // Add unit with its corresponding name to each result object
    const modifiedResult = result.map((item) => ({
      ...item.toJSON(),
      unit: getUnitName(unit),
    }));

    res.json(modifiedResult);
  } catch (error) {
    console.log(error);
  }
};

// Helper function to get unit name based on its value
const getUnitName = (unit) => {
  if (unit === "1") {
    return { name: "ათასი დოლარი", code: 1 };
  } else if (unit === "2") {
    return { name: "ტონა", code: 2 };
  } else if (unit === "3") {
    return { name: "რაღაც", code: 3 };
  }
  
};


const getSelectText = async (req, res) => {
  const langName = req.langName;
  const lang = req.langTranslations;

  let { type, year, hs6, unit } = req.query;
  const query = {};
  const filter = {};

  if (!type) {
    // res.status(400).send("Missing section parameter");
    // return;
  } else {
    const sectionArray = String(type).split(",");
    query.type = {
      [Op.in]: sectionArray,
    };
  }

  if (!hs6) {
    // res.status(400).send("Missing indicator parameter");
    // return;
  } else {
    const indicatorArray = String(hs6).split(",");
    filter.hs6 = {
      [Op.in]: indicatorArray,
    };
  }
  if (!unit) {
    // res.status(400).send("Missing indicator parameter");
    // return;
  } else {
    query.unit = unit;
  }

  if (!year) {
    const maxYearResult = await TradeModel.findOne({
      attributes: [[Sequelize.fn("MAX", Sequelize.col("year")), "maxPeriod"]],
    });
    query.year = maxYearResult.dataValues.maxPeriod - 1;
  } else {
    const periodArray = String(year).split(",");
    query.year = {
      [Op.in]: periodArray,
    };
  }

  try {
    const years = await TradeModel.findAll({
      where: query,
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("year")), "year"]],
      where: {
        year: {
          [Sequelize.Op.gte]: 2014,
        },
      },
      order: [["year", "ASC"]],
    });

    const periodData = years.map((year) => ({
      name: year.dataValues.year,
      code: year.dataValues.year,
    }));

    const periodSelector = {
      title: "title",
      placeholder: "title",
      selectValues: periodData,
    };

    const species = await TradeModel.aggregate("hs6", "DISTINCT", {
      where: query,
      plain: false,
    });

    // // console.log(species,"speciesspeciesspeciesspeciesspecies");

    const speciesCodesAndNames = await Hs6.findAll({
      where: query,
      // limit: 10,
      attributes: ["hs6_id", "name_ka"],
      where: { hs6_id: species.map((s) => s.DISTINCT) },
      order: [["hs6_id", "ASC"]],
    });

    const unitSelector = {
      title: "title",
      placeholder: "title",
      selectValues: "needUnitSelectorHere",
    };

    // // console.log(result);

    // if (!result || result.length === 0) {
    //   // Handle the case when the result is empty
    //   res.status(400).send("No data found");
    //   return;
    // }

    // // Group species by parent id

    // let speciesSTitle = "";
    // let speciesSPlaceholder = "";

    const speciesSelector = {
      title: "title",
      placeholder: "title",
      selectValues: speciesCodesAndNames,
    };

    const speciesSelector2 = {
      title: "title",
      placeholder: "title",
      selectValues: speciesCodesAndNames,
    };

    // const responseObj = {};

    // if (!query.species && !query.year && !query.region) {
    //   responseObj.periodSelector = periodSelector;
    //   responseObj.speciesSelector = speciesSelector;
    //   responseObj.speciesSelector2 = speciesSelector2;
    //   responseObj.regionSelector = regionSelector;
    // } else if (!query.region && query.species && query.period) {
    //   responseObj.regionSelector = regionSelector;
    // } else if (query.region && query.period && !query.species) {
    //   responseObj.speciesSelector = speciesSelector;
    //   responseObj.speciesSelector2 = speciesSelector2;
    // } else if (query.region && query.species && !query.period) {
    //   responseObj.periodSelector = periodSelector;
    // } else if (!query.region && query.species && !query.period) {
    //   responseObj.periodSelector = periodSelector;
    //   responseObj.regionSelector = regionSelector;
    // } else if (!query.region && !query.species && query.period) {
    //   responseObj.speciesSelector = speciesSelector;
    //   responseObj.speciesSelector2 = speciesSelector2;
    //   responseObj.regionSelector = regionSelector;
    // } else if (query.region && !query.species && !query.period) {
    //   responseObj.periodSelector = periodSelector;
    //   responseObj.speciesSelector = speciesSelector;
    //   responseObj.speciesSelector2 = speciesSelector2;
    // } else {
    //   res.json("def");
    //   return;
    // }
    res.json({
      periodSelector,
      speciesSelector,
      speciesSelector2,
      unitSelector,
    });

    // res.json(responseObj);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getTitleText = async (req, res) => {
  const lang = req.langTranslations;

  const langName = req.langName;

  try {
    const cards = {
      card1: {
        title: "მოსაფიქრებელია_სათაური",
        code: 991,
        chartTitle: "მოსაფიქრებელია_სათაური",
      },
      card2: {
        title: "მოსაფიქრებელია_სათაური",
        code: 992,
        chartTitle: "მოსაფიქრებელია_სათაური",
      },
    };
    res.json({ cards });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTradeData,
  getSelectText,
  getTitleText,
};
