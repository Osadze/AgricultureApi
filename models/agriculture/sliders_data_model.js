const { DataTypes } = require("sequelize");
const sequelize = require("../../util/agriDb");
const Unit = require("./unitCL");
const Pages = require("./PagesCL");

const SlidersData = sequelize.define(
  "sliders_data",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    pages: {
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
    },
    unit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "sliders_data",
    timestamps: false,
  }
);

SlidersData.belongsTo(Unit, { foreignKey: "unit" });
SlidersData.belongsTo(Pages, { foreignKey: "pages", as: "cl_pages" });

module.exports = SlidersData;
