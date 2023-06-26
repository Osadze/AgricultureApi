// const { DataTypes } = require("sequelize");
// const sequelize = require("../../util/agriDb");
// const Species = require("./speciesCL");
// const Indicator = require("./indicatorCL");
// const Section = require("./sectionCL");

// const Prices_1 = sequelize.define(
//   "prices_1",
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     name_ka: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     period: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     unit: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     year: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     quarter: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     value: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//   },
//   {
//     tableName: "prices_1",
//     timestamps: false,
//   }
// );

// Prices.belongsTo(Section, { foreignKey: "section" });
// Prices.belongsTo(Indicator, { foreignKey: "indicator" });
// Prices.belongsTo(Species, { foreignKey: "species" });

// module.exports = Prices_1;
