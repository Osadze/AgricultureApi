const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const Section = sequelize.define("cl_section", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  nameKa: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  code: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
},
{
  tableName: "cl_section",
  timestamps: false,
});

module.exports = Section;
