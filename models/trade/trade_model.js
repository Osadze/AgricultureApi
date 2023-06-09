const { DataTypes } = require("sequelize");
const sequelize = require("../../util/tradeDb");
const Hs6 = require("./hs6CL");
const Types = require("./typesCL");

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

TradeModel.belongsTo(Hs6, { foreignKey: "hs6", targetKey: "hs6_id", as: "hs6cl" });

TradeModel.belongsTo(Types, { foreignKey: "type", targetKey: "type_flow",as: "typecl" });

module.exports = TradeModel;
