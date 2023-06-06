const { Sequelize, DataTypes, Op } = require("sequelize");
const TradeModel = require("../models/trade/trade_model");
const Country = require("../models/trade/countryCL");
const Types = require("../models/trade/typesCL");
const Hs6 = require("../models/trade/hs6CL");

const getTradeData = async (req, res) => {
  let { type, year, hs6, country } = req.query;
  const query = {};

  if (!type) {
    res.status(400).send("Missing section parameter");
    return;
  } else {
    const sectionArray = String(type).split(",");
    query.type = {
      [Op.in]: sectionArray,
    };
  }

  if (!hs6) {
    res.status(400).send("Missing indicator parameter");
    return;
    // } else if (indicator == 23 || indicator == 24) {
    //   query.indicator = [23,24];
  } else {
    const indicatorArray = String(hs6).split(",");
    query.hs6 = {
      [Op.in]: indicatorArray,
    };
  }

  if (!year) {
    const maxYearResult = await Agriculture.findOne({
      attributes: [[Sequelize.fn("MAX", Sequelize.col("period")), "maxPeriod"]],
    });
    query.year = maxYearResult.dataValues.maxPeriod - 1;
  } else {
    const periodArray = String(year).split(",");
    query.year = {
      [Op.in]: periodArray,
    };
  }

  if (!country) {
    query.country = 1;
  } else {
    const regionArray = String(country).split(",");
    query.country = {
      [Op.in]: regionArray,
    };
  }

  try {
    const result = await TradeModel.findAll({
      where: query,
      limit: 20,
      attributes: [
        "type",
        "year",
        "hs6",
        "country",
        [Sequelize.fn("SUM", Sequelize.col("usd1000")), "totalUsd100"],
        [Sequelize.fn("SUM", Sequelize.col("tons")), "totalTons"],
        [Sequelize.fn("SUM", Sequelize.col("suppu")), "totalSuppu"],
      ],
      group: ["type", "year", "hs6", "country"],
    });
    res.json(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getTradeData,
};
