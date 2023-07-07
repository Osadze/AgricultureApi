const { DataTypes } = require("sequelize");
const sequelize = require("../../util/agriDb");

const Pages = sequelize.define(
  "cl_pages",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    name_ka: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name_en: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    period: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "cl_pages",
    timestamps: false,
  }
);

module.exports = Pages;
