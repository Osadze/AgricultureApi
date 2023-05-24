const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const Species = sequelize.define("cl_species", {
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
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
},
{
  tableName: "cl_species",
  timestamps: false,
});

module.exports = Species;
