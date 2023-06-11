const { Sequelize, DataTypes, Op } = require("sequelize");
const TradeModel = require("../models/trade/trade_model");
const Types = require("../models/trade/typesCL");
const Hs6 = require("../models/trade/hs6CL");

const getTradeData = async (req, res) => {
  const langName = req.langName;
  const lang = req.langTranslations;

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
    const attributes = ["type", ["year", "period"]];

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
      // limit: 20,
      attributes,
      group: ["type", "year", "hs6"],
      include: [
        {
          model: Hs6,
          as: "hs6cl",
          attributes: [
            [langName, "name"],
            ["hs6_id", "code"],
          ],
        },
      ],
    });

    // Add unit with its corresponding name to each result object
    const modifiedResult = result.map((item) => ({
      ...item.toJSON(),
      unit: {
        name: lang.trade.unitNames[unit],
        code: unit,
      },
    }));

    res.json({ result: modifiedResult });
  } catch (error) {
    console.log(error);
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
  // if (!unit) {
  //   // res.status(400).send("Missing indicator parameter");
  //   // return;
  // } else {
  //   query.unit = unit;
  // }

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
      title: lang.defaultS.period.title,
      placeholder: lang.defaultS.period.placeholder,
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
      attributes: [
        [langName, "name"],
        ["hs6_id", "code"],
      ],
      where: { hs6_id: species.map((s) => s.DISTINCT) },
      order: [["hs6_id", "ASC"]],
    });

    //can be improved
    const units = [
      { name: lang.trade.unitNames[1], code: 1 },
      { name: lang.trade.unitNames[2], code: 2 },
      { name: lang.trade.unitNames[3], code: 1 },
    ];

    const unitSelector = {
      title: lang.trade.unitS.title,
      placeholder: lang.trade.unitS.placeholder,
      selectValues: units,
    };

    const speciesSelector = {
      title: lang.trade.speciesS.title,
      placeholder: lang.trade.speciesS.placeholder,
      selectValues: speciesCodesAndNames,
    };

    res.json({
      periodSelector,
      speciesSelector,
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
      card1: lang.trade.card1,
      card2: lang.trade.card2,
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
