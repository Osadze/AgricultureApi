const Agriculture = require("../models/agriculture_model");
const Section = require("../models/sectionCL");
const Indicator = require("../models/indicatorCL");
const Region = require("../models/regionCL");
const Species = require("../models/speciesCL");
const Species_1 = require("../models/species_1CL");
const Unit = require("../models/unitCL");
const { Sequelize } = require("sequelize");
const indicator = require("../models/indicatorCL");

const getAgriculture = async (req, res) => {
  try {
    const data = await Agriculture.findAll();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getVegetationsText = async (req, res) => {
  try {
    const sectionId = 1;

    const species = await Agriculture.aggregate("species", "DISTINCT", {
      plain: false,
      where: { section: sectionId },
    });

    const speciesCodesAndNames = await Species.findAll({
      attributes: ["code", "name", "parentId"],
      where: { code: species.map((s) => s.DISTINCT) },
      order: [["code", "ASC"]],
    });

    // Group species by parent id
    const speciesByParentId = speciesCodesAndNames.reduce((acc, curr) => {
      const parentId = curr.parentId || "null";
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push(curr);
      return acc;
    }, {});

    // Map species to include children property
    const speciesWithChildren = speciesByParentId["null"].reduce(
      (acc, parentSpecies) => {
        // Create a copy of the dataValues object without the _previousDataValues property
        const { _previousDataValues, ...dataValues } = parentSpecies.dataValues;
        const species = {
          ...dataValues,
          childrens: speciesByParentId[parentSpecies.code] || [],
        };
        if (species.code < 21) {
          acc.species1.push(species);
        } else {
          acc.species2.push(species);
        }
        return acc;
      },
      { species1: [], species2: [] }
    );

    const years = await Agriculture.findAll({
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("period")), "name"]],
      where: { section: sectionId },
      order: [["period", "ASC"]],
    });

    const regions = await Region.findAll({
      attributes: ["code", "name"],
      order: [["code", "ASC"]],
    });

    res.json({
      species1: speciesWithChildren.species1,
      species2: speciesWithChildren.species2,
      years,
      regions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getVegetations = async (req, res) => {
  let { indicator, period, species, region } = req.query;

  const query = {};

  if (indicator) {
    query.indicator = indicator;
  } else {
    indicator = 1;
  }
  if (period) {
    query.period = period;
  } else {
    const maxYearResult = await Agriculture.findOne({
      attributes: [[Sequelize.fn("MAX", Sequelize.col("period")), "maxPeriod"]],
    });
    period = maxYearResult.dataValues.maxPeriod - 1;
    query.period = period;
  }
  //   console.log(query.year);

  if (species) {
    query.species = species;
  }

  if (region) {
    query.region = region;
  } else {
    region = 1;
  }

  try {
    const result = await Agriculture.findAll({
      where: query,
      attributes: ['id', 'value'],
      include: [
        { model: Unit, attributes: ['name', 'code'] },
      ],
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
  




module.exports = {
  getAgriculture,
  getVegetationsText,
  getVegetations,
};
