const { Sequelize, DataTypes, Op } = require("sequelize");
const FdiModel = require("../models/fdi/fdi_model");

const getTradeData = async (req, res) => {
  let { year } = req.query;
  const query = {};

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
        [Sequelize.fn("SUM", Sequelize.col("usd")), "value"],
      ],
      group: "year",
    });

    // Add name: "investments" to each result object
    const modifiedResult = result.map((item) => ({
      ...item.dataValues,
      name: "investments",
    }));

    res.json(modifiedResult);
  } catch (error) {
    console.log(error);
  }
};

const getSelectText = async (req, res) => {
  const lang = req.langTranslations;

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
      title: "title",
      placeholder: "title",
      selectValues: periodData,
    };

    res.json(periodSelector);
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
        code: 881,
        chartTitle: "მოსაფიქრებელია_სათაური",
      }
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
