const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const Region = sequelize.define("cl_region", {
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
  tableName: "cl_region",
  timestamps: false,
});

module.exports = Region;
