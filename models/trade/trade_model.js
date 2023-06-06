const { DataTypes } = require("sequelize");
const sequelize = require("../../util/tradeDb");
const Hs6 = require("./hs6CL");
const Types = require("./typesCL");
const Country = require("./countryCL");

const TradeModel = sequelize.define(
  "trade_data",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hs6: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    country: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    usd1000: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tons: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    suppu: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "trade_data",
    timestamps: false,
  }
);

TradeModel.belongsTo(Hs6, { foreignKey: "hs6" });
TradeModel.belongsTo(Types, { foreignKey: "type", as: "typecl" });
TradeModel.belongsTo(Country, { foreignKey: "country", as: "countrycl"  }); // Changed alias to 'tradeCountry'

module.exports = TradeModel;
