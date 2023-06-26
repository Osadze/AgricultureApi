const { DataTypes } = require("sequelize");
const sequelize = require("../../util/agriDb");
const Unit = require("./unitCL");
const Species = require('./speciesCL')


const Prices_1 = sequelize.define(
  "prices_1",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    species: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    period: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "prices_1",
    timestamps: false,
  }
);

Prices_1.belongsTo(Unit, { foreignKey: "unit" });
Prices_1.belongsTo(Species, { foreignKey: "species" });

module.exports = Prices_1;
