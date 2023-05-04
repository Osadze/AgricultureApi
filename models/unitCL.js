const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const Unit = sequelize.define("cl_unit", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: false,
    primaryKey: true,
  },
  nameKa: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
},
{
  tableName: "cl_unit",
  timestamps: false,
});

module.exports = Unit;
