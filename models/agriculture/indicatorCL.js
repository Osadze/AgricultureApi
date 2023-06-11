const { DataTypes } = require("sequelize");
const sequelize = require("../../util/agriDb");


const Indicator = sequelize.define("cl_indicator", {
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
  sort_Id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

},
{
  tableName: "cl_indicator",
  timestamps: false,
});

module.exports = Indicator;
