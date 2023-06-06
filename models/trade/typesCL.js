const { DataTypes } = require("sequelize");
const sequelize = require("../../util/tradeDb");


const TypesModel = sequelize.define("types", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
    type_flow: {
    type: DataTypes.STRING,
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
  tableName: "types",
  timestamps: false,
});

module.exports = TypesModel;
