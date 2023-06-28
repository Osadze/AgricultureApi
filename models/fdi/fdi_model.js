const { DataTypes } = require("sequelize");
const sequelize = require("../../util/fdiDb");

const FdiModel = sequelize.define(
  "fdi_sector",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quarter: {
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

FdiModel.sync({ alter: false })
  .then(() => {
    console.log("Model synchronized successfully");
  })
  .catch((error) => {
    console.error("Error synchronizing model:", error);
  });

module.exports = FdiModel;
