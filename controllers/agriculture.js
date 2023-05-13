const Agriculture = require("../models/agriculture_model");
const Region = require("../models/regionCL");
const Species = require("../models/speciesCL");
const Unit = require("../models/unitCL");
const { Sequelize, Op } = require("sequelize");
const sequelize = require("../util/database");

const getMainStats = async (req, res) => {
  const query = {};

  const defaultRegion = 1;

  const maxYearResult = await Agriculture.findOne({
    attributes: [[Sequelize.fn("MAX", Sequelize.col("period")), "maxPeriod"]],
  });

  const lastYear = maxYearResult.dataValues.maxPeriod - 1;

  query.region = defaultRegion;
  query.period = lastYear;
  query.species = [
    10, 13, 16, 17, 30, 32, 35, 3801, 26, 39, 40, 42, 2901, 2902, 2903, 2904,
  ];
  query.indicator = [12, 21, 31, 43];

  try {
    const result = await Agriculture.findAll({
      where: query,
      attributes: ["value", "indicator", "species"],
      include: [{ model: Species, attributes: ["name"] }],
    });

    const filteredResult = result.reduce(
      (obj, item) => {
        switch (item.indicator) {
          case 12:
            if (item.species != 26) {
              obj.firstSlide.data.push({
                name: item.cl_specy.name,
                value: parseInt(item.value),
              });
            }
            break;
          case 21:
            obj.secondSlide.data.push({
              name: item.cl_specy.name,
              value: parseInt(item.value),
            });
            break;
          case 31:
            obj.thirdSlide.data.push({
              name: item.cl_specy.name,
              value: parseInt(item.value),
            });
            break;
          case 43:
            obj.fourthSlide.data.push({
              name: item.cl_specy.name,
              value: parseInt(item.value),
            });
            break;
        }
        return obj;
      },
      {
        firstSlide: { title: "წარმოება, 2021 წელი (ათასი ტონა)", data: [] },
        secondSlide: { title: "სულადობა 2021 წელი (ათასი ერთეული)", data: [] },
        thirdSlide: { title: " თევზის წარმოება, 2021 წელი (ტონა)", data: [] },
        fourthSlide: {
          title: "თვითუზრუნველყოფის კოეფიციენტი, 2021 წელი (%)",
          data: [],
        },
        fifthSlide: {
          title: "სოფლის, სატყეო და თევზის მეურნეობები. 2021 წელი",
          data: [
            {
              name: "მშპ",
              value: 7.4,
              unit: "%",
            },
            {
              name: "დასაქმება",
              value: 230.3,
              unit: "ათასი კაცი",
            },
            {
              name: "საშუალო ხელფასი",
              value: 950.3,
              unit: "ლარი",
            },
            {
              name: "მთლიანი გამოშვება",
              value: 6330.6,
              unit: "მლნ. ლარი",
            },
            {
              name: "ექსპორტი",
              value: 1141.6,
              unit: "მლნ. აშშ დოლარი",
            },
            {
              name: "მთლიანი გამოშვება",
              value: 1349.6,
              unit: "მლნ. აშშ დოლარი",
            },
          ],
        },
      }
    );

    res.json(filteredResult);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

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
    period = maxYearResult.dataValues.maxPeriod;
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
    query.period = maxYearResult.dataValues.maxPeriod;
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
      order: [
        ["period", "ASC"],
        ["species", "ASC"],
        ["region", "ASC"],
      ],
    });

    const speciesByYearAndRegion = {};

    result.forEach((agriculture) => {
      const year = agriculture.period;
      const name = agriculture.cl_specy.name;
      const speciesValue = agriculture.value;
      const region = agriculture.cl_region.name;

      if (!speciesByYearAndRegion[year]) {
        speciesByYearAndRegion[year] = {};
      }

      if (!speciesByYearAndRegion[year][region]) {
        speciesByYearAndRegion[year][region] = {};
      }

      if (!speciesByYearAndRegion[year][region][name]) {
        speciesByYearAndRegion[year][region][name] = [];
      }

      speciesByYearAndRegion[year][region][name] = parseFloat(speciesValue);
    });

    const speciesByYearAndRegionArray = [];

    const maxYearResult = await Agriculture.findOne({
      attributes: [[Sequelize.fn("MAX", Sequelize.col("period")), "maxPeriod"]],
    });
    let lastYear = maxYearResult.dataValues.maxPeriod;

    const minYearResult = await Agriculture.findOne({
      attributes: [[Sequelize.fn("Min", Sequelize.col("period")), "maxPeriod"]],
    });
    let firstYear = minYearResult.dataValues.maxPeriod;

    // console.log(firstYear,lastYear,"year");

    for (let year = firstYear; year <= lastYear; year++) {
      if (speciesByYearAndRegion[year]) {
        const regionsArray = Object.keys(speciesByYearAndRegion[year]);

        const speciesObjectsArray = regionsArray.map((region) => {
          const speciesObjects = [];

          Object.keys(speciesByYearAndRegion[year][region]).forEach((name) => {
            const speciesValues = speciesByYearAndRegion[year][region][name];
            // const speciesValue = speciesValues.reduce((a, b) => a + b, 0);
            speciesObjects.push({
              name: name,
              value: speciesValues,
            });
          });

          return { region: region, species: speciesObjects };
        });

        speciesByYearAndRegionArray.push({
          year: year,
          unit: result[0].cl_unit.name,
          values: speciesObjectsArray,
        });
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
  agricultureV1_1,
};
