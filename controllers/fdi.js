const { Sequelize, DataTypes, Op } = require("sequelize");
const FdiModel = require("../models/fdi/fdi_model");

const getFdiData = async (req, res) => {
  const langName = req.langName;
  const langjson = req.langTranslations;
  let { year } = req.query;
  const query = {};

  query.sector = "A";
  // query.quarter = year; // for new

  if (!year) {
    // const maxYearResult = await FdiModel.findOne({
    //   attributes: [[Sequelize.fn("MAX", Sequelize.col("year")), "maxPeriod"]],
    // });
    // query.year = maxYearResult.dataValues.maxPeriod - 1;
  } else {
    const periodArray = String(year).split(",");
    query.year = {
      [Op.in]: periodArray,
    };
  }

  try {
    const result = await FdiModel.findAll({
      where: query,
      attributes: [
        "year",
        // ["usd","value"], // new
        [Sequelize.fn("SUM", Sequelize.col("usd")), "value"], // old
      ],
      group: "year", // old
    });

    // Divide the summed values by 2 and round up to millions
    const modifiedResult = result.map((item) => ({
      ...item.dataValues,
      value: parseFloat((item.dataValues.value / 1000000).toFixed(1)), // Round up to 2 decimal places
      name: langjson.fdi.investments,
    }));

    res.json(modifiedResult);
  } catch (error) {
    console.log(error);
  }
};

const getSelectText = async (req, res) => {
  const langjson = req.langTranslations;

  const langName = req.langName;
  try {
    const years = await FdiModel.findAll({
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
      title: langjson.defaultS.period.title,
      placeholder: langjson.defaultS.period.placeholder,
      selectValues: periodData,
    };

    res.json(periodSelector);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getTitleText = async (req, res) => {
  const langjson = req.langTranslations;

  const langName = req.langName;

  try {
    const cards = {
      card1: {
        code: 881,
        chartTitle: langjson.fdi.chartTitle,
      },
    };
    res.json({ cards });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getFdiData,
  getSelectText,
  getTitleText,
};
