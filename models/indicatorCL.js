const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const indicator = sequelize.define("cl_indicator", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  nameKa: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nameEn: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  code: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

},
{
  tableName: "cl_indicator",
  timestamps: false,
});

module.exports = indicator;
