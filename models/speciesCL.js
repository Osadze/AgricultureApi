const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const Species = sequelize.define("cl_species", {
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
