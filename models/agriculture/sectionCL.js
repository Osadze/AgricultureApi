const { DataTypes } = require("sequelize");
const sequelize = require("../../util/agriDb");


const Section = sequelize.define("cl_section", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  name_ka: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  code: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name_en: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
},
{
  tableName: "cl_section",
  timestamps: false,
});

module.exports = Section;
