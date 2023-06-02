const { DataTypes } = require("sequelize");
const sequelize = require("../../util/tradeDb");


const Country = sequelize.define("country", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  country_id: {
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
  }
},
{
  tableName: "country",
  timestamps: false,
});

module.exports = Country;
