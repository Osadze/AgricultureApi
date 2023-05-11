const Agriculture = require("../models/agriculture_model");
const Region = require("../models/regionCL");
const Species = require("../models/speciesCL");
const Unit = require("../models/unitCL");
const { Sequelize, Op } = require("sequelize");
const sequelize = require("../util/database")


const getMainStats = async (req, res) => {
  res.json("yo")
}




const getAgricultureText = async (req, res) => {
  let { section, indicator } = req.query;


  const query = {};

  if (!section) {
    res.status(400).send("Missing section parameter");
    return;
  } else {
    query.section = section;
  }

  if (!indicator) {
    res.status(400).send("Missing indicator parameter");
    return;
  } else {
    query.indicator = indicator;
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

  console.log("indicator:", indicator);
  console.log("period:", period);
  console.log("species:", species);
  console.log("region:", region);

  const query = {};

  if (indicator) {
    query.indicator = indicator;
  } else {
    indicator = 1;
  }

  if (period) {
    const periodArray = String(period).split(",");
    query.period = {
      [Op.in]: periodArray,
    };
  } else {
    const maxYearResult = await Agriculture.findOne({
      attributes: [[Sequelize.fn("MAX", Sequelize.col("period")), "maxPeriod"]],
    });
    period = maxYearResult.dataValues.maxPeriod - 1;
    query.period = period;
  }

  if (species) {
    const speciesArray = String(species).split(",");
    query.species = {
      [Op.in]: speciesArray,
    };
  }

  if (region) {
    const regionArray = String(region).split(",");
    query.region = {
      [Op.in]: regionArray,
    };
  } else {
    region = 1;
  }

  try {
    const result = await Agriculture.findAll({
      where: query,
      attributes: ["id", "value", "period"],
      include: [
        { model: Species, attributes: ["name", "code"] },
        { model: Unit, attributes: ["name", "code"] },
        { model: Region, attributes: ["name", "code"] },
      ],
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const agricultureV1_1 = async (req, res) => {
  let { indicator, period, species, region } = req.query;



  const query = {};

  if (indicator) {
    query.indicator = indicator;
  } else {
    indicator = 1;
  }

  if (period) {
    const periodArray = String(period).split(",");
    query.period = {
      [Op.in]: periodArray,
    };
  } else {
    const maxYearResult = await Agriculture.findOne({
      attributes: [[Sequelize.fn("MAX", Sequelize.col("period")), "maxPeriod"]],
    });
    query.period  = maxYearResult.dataValues.maxPeriod - 1;
  }

  if (species) {
    const speciesArray = String(species).split(",");
    query.species = {
      [Op.in]: speciesArray,
    };
  }

  if (region) {
    const regionArray = String(region).split(",");
    query.region = {
      [Op.in]: regionArray,
    };
  } else {
    region = 1;
  }

  try {
    const result = await Agriculture.findAll({
      where: query,
      attributes: ["id", "value", "period", "species", "region"],
      include: [
        { model: Species, attributes: ["name", "code"] },
        { model: Unit, attributes: ["name", "code"] },
        { model: Region, attributes: ["name", "code"] },
      ],
      order: [["period", "ASC"], ["species", "ASC"], ["region", "ASC"]],
    });


    const speciesByYearAndRegion = {};
    

    result.forEach(agriculture => {
      const year = agriculture.period;
      const speciesId = agriculture.species;
      const speciesValue = agriculture.value;
      const regionId = agriculture.region;

      if (!speciesByYearAndRegion[year]) {
        speciesByYearAndRegion[year] = {};
      }

      if (!speciesByYearAndRegion[year][regionId]) {
        speciesByYearAndRegion[year][regionId] = {};
      }

      if (!speciesByYearAndRegion[year][regionId][speciesId]) {
        speciesByYearAndRegion[year][regionId][speciesId] = [];
      }



      speciesByYearAndRegion[year][regionId][speciesId] = parseFloat(speciesValue) ;
    });

    const speciesByYearAndRegionArray = [];

    for (let year = 2015; year <= 2021; year++) {
      if (speciesByYearAndRegion[year]) {
        const regionsArray = Object.keys(speciesByYearAndRegion[year]);

        const speciesObjectsArray = regionsArray.map(regionId => {
          const speciesObjects = [];

          Object.keys(speciesByYearAndRegion[year][regionId]).forEach(speciesId => {
            const speciesValues = speciesByYearAndRegion[year][regionId][speciesId];
            // const speciesValue = speciesValues.reduce((a, b) => a + b, 0);
            speciesObjects.push({ speciesId: speciesId,  value: speciesValues });
          });

          return { region: regionId, species: speciesObjects };
        });

        speciesByYearAndRegionArray.push({ year: year, values: speciesObjectsArray });
      }
    }


    res.json(speciesByYearAndRegionArray);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  getMainStats,
  getAgricultureText,
  getAgricultures,
  agricultureV1_1
};
