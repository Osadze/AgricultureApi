const Agriculture = require("../models/agriculture_model");
const Region = require("../models/regionCL");
const Species = require("../models/speciesCL");
const Unit = require("../models/unitCL");
const { Sequelize } = require("sequelize");

const getAgricultureText = async (req, res) => {
  let { section } = req.query;

  const query = {};

  if (!section) {
    res.status(400).send("Missing section parameter");
    return;
  } else {
    query.section = section;
  }

  try {
    const species = await Agriculture.aggregate("species", "DISTINCT", {
      plain: false,
      where: query,
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
        // If section = 1 , vegetation, then split it into two arrays
        // vegetatins with code under 21 are Annual crops and 21 or more than 21 Perennial cultivars
        if (section == 1 && species.code < 21) {
          acc.species1.push(species);
        } else {
          acc.species.push(species);
        }
        return acc;
      },
      { species: [], species1: [] }
    );

    const years = await Agriculture.findAll({
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("period")), "name"]],
      where: query,
      order: [["period", "ASC"]],
    });

    const regions = await Region.findAll({
      attributes: ["code", "name"],
      order: [["code", "ASC"]],
    });

    if (section == 1) {
      res.json({
        species1: speciesWithChildren.species1,
        species2: speciesWithChildren.species,
        years,
        regions,
      });
    } else {
      res.json({
        species1: speciesWithChildren.species,
        years,
        regions,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
    
  }
};


const getAgricultures = async (req, res) => {
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
      attributes: ["id", "value"],
      include: [
        { model: Species, attributes: ["name", "code"] },
        { model: Unit, attributes: ["name", "code"] },
      ],
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAgricultureText,
  getAgricultures,
};
