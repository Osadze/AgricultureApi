const { DataTypes } = require("sequelize");
const sequelize = require("../../util/tradeDb");
const Hs6 = require('./hs6CL');
const Types = require('./typesCL');
const Country = require('./countryCL');


const Trade = sequelize.define(
  "trade_data",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    tradeType: { 
      // Error: Unknown column 'tradeType' in 'field list'
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
    tradeCountry: { // Renamed 'country' attribute to 'tradeCountry'
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

Trade.belongsTo(Hs6, { foreignKey: 'hs6' });
Trade.belongsTo(Types, { foreignKey: 'tradeType', as: 'trade' });
Trade.belongsTo(Country, { foreignKey: 'tradeCountry' }); // Changed alias to 'tradeCountry'

module.exports = Trade;
