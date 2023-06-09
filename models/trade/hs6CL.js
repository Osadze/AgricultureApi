const { DataTypes } = require("sequelize");
const sequelize = require("../../util/tradeDb");
const TradeModel = require("./trade_model");


const Hs6 = sequelize.define("hs6_table", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  hs6_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name_ka: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name_en: {
    type: DataTypes.STRING,
    allowNull: true,
  }
},
{
  tableName: "hs6_table",
  timestamps: false,
});


module.exports = Hs6;
