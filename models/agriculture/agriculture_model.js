const { DataTypes } = require("sequelize");
const sequelize = require("../../util/agriDb");
const Section = require('./sectionCL')
const Indicator = require('./indicatorCL')
const Region = require('./regionCL')
const Species = require('./speciesCL')
const Species_1 = require('./species_1CL')
const Unit = require('./unitCL')


const Agriculture = sequelize.define(
  "main",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    section: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    indicator: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    species: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    species_1: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    period: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    region: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "main",
    timestamps: false,
  }
);

Agriculture.belongsTo(Section, { foreignKey: 'section'});
Agriculture.belongsTo(Indicator, { foreignKey: 'indicator'});
Agriculture.belongsTo(Unit, { foreignKey: 'unit'});
Agriculture.belongsTo(Species, { foreignKey: 'species'});
Agriculture.belongsTo(Species_1, { foreignKey: 'species_1', as: 'cl_species_1' });
Agriculture.belongsTo(Region, { foreignKey: "region" });

module.exports = Agriculture;
