const { DataTypes } = require("sequelize");
const sequelize = require("../../util/registerDb");

const Register = sequelize.define(
  "DocMain",
  {
    Stat_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    Legal_Code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    Full_Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Region_Name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    X: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Y: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Activity_Code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    
  },
  {
    tableName: "DocMain",
    timestamps: false,
  }
);


module.exports = Register;
