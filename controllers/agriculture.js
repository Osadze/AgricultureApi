const Agriculture = require("../models/agriculture_model");
const Section = require("../models/sectionCL");
const Indicator = require("../models/indicatorCL");
const Region = require("../models/regionCL");
const Species = require("../models/speciesCL");
const Species_1 = require("../models/species_1CL");
const Unit = require("../models/unitCL");
const { Sequelize } = require("sequelize");

const getAgriculture = async (req, res) => {
  try {
    const data = await Agriculture.findAll();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getPlantText = async (req, res) => {
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
    const speciesWithChildren = speciesByParentId["null"].map(
        (parentSpecies) => {
          // Create a copy of the dataValues object without the _previousDataValues property
          const { _previousDataValues, ...dataValues } = parentSpecies.dataValues;
          return {
            ...dataValues,
            childrens: speciesByParentId[parentSpecies.code] || [],
          };
        }
      );

    const years = await Agriculture.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("period")), "period"],
      ],
      where: { section: sectionId },
      order: [["period", "ASC"]],
    });

    const regions = await Region.findAll({
      attributes: ["code", "name"],
      order: [["code", "ASC"]],
    });

    res.json({ species: speciesWithChildren, years, regions });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getAgriculture,
  getPlantText,
};
