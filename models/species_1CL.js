const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const Species_1 = sequelize.define("cl_species_1", {
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
  tableName: "cl_species_1",
  timestamps: false,
});

module.exports = Species_1;
