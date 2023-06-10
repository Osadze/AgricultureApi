const { DataTypes } = require("sequelize");
const sequelize = require("../../util/fdiDb");


const FdiModel = sequelize.define(
  "fdi_sector",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sector: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    usd: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    
  },
  {
    tableName: "fdi_sector",
    timestamps: false,
  }
);


module.exports = FdiModel;
