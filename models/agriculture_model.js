const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const Agriculture = sequelize.define(
  "agriculture",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: false,
      primaryKey: true,
    },
    section: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[1, 2, 3, 4]],
      },
    },
    indicator: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[11, 12, 13, 14]],
      },
    },
    unit: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[1, 2, 3, 4]],
      },
    },
    species: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[10, 11, 12, 13]],
      },
    },
    species_1: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[4101, 4102, 4103, 4104]],
      },
    },
    period: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    region: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isIn: [[1, 11, 15, 23]],
      },
    },
    value: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false,
    },
  },
  {
    tableName: "Main",
    timestamps: false,
  }
);

module.exports = Agriculture;
