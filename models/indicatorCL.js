const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const indicator = sequelize.define("cl_indicator", {
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

},
{
  tableName: "cl_indicator",
  timestamps: false,
});

module.exports = indicator;
