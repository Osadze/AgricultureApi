const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const Unit = sequelize.define("cl_unit", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
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
},
{
  tableName: "cl_unit",
  timestamps: false,
});

module.exports = Unit;
