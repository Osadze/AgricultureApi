const { DataTypes } = require("sequelize");
const sequelize = require("../../util/agriDb");
const Species = require("./speciesCL");
const Indicator = require("./indicatorCL");
const Section = require("./sectionCL");

const Prices = sequelize.define(
  "prices",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    section: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    indicator: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    species: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quarter: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "prices",
    timestamps: false,
  }
);

Prices.belongsTo(Section, { foreignKey: "section" });
Prices.belongsTo(Indicator, { foreignKey: "indicator" });
Prices.belongsTo(Species, { foreignKey: "species" });

module.exports = Prices;
