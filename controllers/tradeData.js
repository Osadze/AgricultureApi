const Trade = require("../models/trade/trade_model");
const Country = require("../models/trade/countryCL");
const Types = require("../models/trade/typesCL");
const Hs6 = require("../models/trade/hs6CL");

const getTradeData = async (req, res) => {
  try {
    const result = await Trade.findAll({
      // attributes: ["value", "indicator", "species"],
      // include: [{ model: Species, attributes: [langName] }],
    });
    res.json(result);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getTradeData,
};
