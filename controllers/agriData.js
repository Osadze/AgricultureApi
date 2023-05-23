const Agriculture = require("../models/agriculture_model");
const Region = require("../models/regionCL");
const Species = require("../models/speciesCL");
const Unit = require("../models/unitCL");
const { Sequelize, Op } = require("sequelize");
const sequelize = require("../util/database");
const languageMiddleware = require("../middleware/language");

const getMainData = async (req, res) => {
  const langName = req.langName;
  const query = {};
  const defaultRegion = 1;

  const maxYearResult = await Agriculture.findOne({
    attributes: [[Sequelize.fn("MAX", Sequelize.col("period")), "maxPeriod"]],
  });

  const lastYear = maxYearResult.dataValues.maxPeriod - 1;

  query.region = defaultRegion;
  query.period = lastYear;
  query.species = [
    10, 13, 16, 17, 30, 32, 35, 3801, 26, 39, 40, 41, 42, 2901, 2902, 2903,
    2904,
  ];
  query.indicator = [12, 21, 31, 43];

  try {
    const result = await Agriculture.findAll({
      where: query,
      attributes: ["value", "indicator", "species"],
      include: [{ model: Species, attributes: [langName] }],
    });
    const filteredResult = result.reduce(
      (obj, item) => {
        switch (item.indicator) {
          case 12:
            if (item.species != 26) {
              obj.firstSlide.data.push({
                name: item.cl_specy[`${langName}`],
                value: parseInt(item.value),
              });
            }
            break;
          case 21:
            obj.secondSlide.data.push({
              name: item.cl_specy[`${langName}`],
              value: parseInt(item.value),
            });
            break;
          case 31:
            obj.thirdSlide.data.push({
              name: item.cl_specy[`${langName}`],
              value: parseInt(item.value),
            });
            break;
          case 43:
            obj.fourthSlide.data.push({
              name: item.cl_specy[`${langName}`],
              value: parseInt(item.value),
            });
            break;
        }
        return obj;
      },
      {
        firstSlide: { title: "წარმოება, 2021 წელი (ათასი ტონა)", data: [] },
        secondSlide: { title: "სულადობა 2021 წელი (ათასი ერთეული)", data: [] },
        thirdSlide: { title: "თევზის წარმოება, 2021 წელი (ტონა)", data: [] },
        fourthSlide: {
          title: "თვითუზრუნველყოფის კოეფიციენტი, 2021 წელი (%)",
          data: [],
        },
        fifthSlide: {
          //Todo: needs update after db
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


const getSectionDatav1 = async (req, res) => {
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
  } else {
    query.species = 10;
  }

  if (region) {
    query.region = region;
  } else {
    query.region = 1;
  }

  try {
    const result = await Agriculture.findAll({
      where: query,
      attributes: ["id", "value", "period"],
      include: [
        { model: Unit, attributes: [langName, "code"] },
        { model: Species, attributes: [langName, "code"] },
        { model: Region, attributes: [langName, "code"] },
      ],
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getSectionData = async (req, res) => {
  const langName = req.langName;

  let { section, indicator, period, species, region } = req.query;

  console.log(req.query, "req.query");

  const query = {};

  if (!section) {
    res.status(400).send("Missing section parameter");
    return;
  } else {
    const sectionArray = String(section).split(",");
    query.section = {
      [Op.in]: sectionArray,
    };
  }

  if (!indicator) {
    res.status(400).send("Missing indicator parameter");
    return;
  } else {
    const indicatorArray = String(indicator).split(",");
    query.indicator = {
      [Op.in]: indicatorArray,
    };
  }

  if (!period) {
    const maxYearResult = await Agriculture.findOne({
      attributes: [[Sequelize.fn("MAX", Sequelize.col("period")), "maxPeriod"]],
    });
    query.period = maxYearResult.dataValues.maxPeriod - 1;
  } else {
    const periodArray = String(period).split(",");
    query.period = {
      [Op.in]: periodArray,
    };
  }

  if (!species) {
    // query.species = 10;
  } else {
    const speciesArray = String(species).split(",");
    query.species = {
      [Op.in]: speciesArray,
    };
  }

  if (!region) {
    query.region = 1;
  } else {
    const regionArray = String(region).split(",");
    query.region = {
      [Op.in]: regionArray,
    };
  }

  try {
    const result = await Agriculture.findAll({
      where: query,
      attributes: ["id", "value", "period", "species", "region"],
      include: [
        { model: Species, attributes: [langName, "code"] },
        { model: Unit, attributes: [langName, "code"] },
        { model: Region, attributes: [langName, "code"] },
      ],
    });

    const speciesByYearAndRegion = {};

    result.forEach((agriculture) => {
      const year = agriculture.period;
      const name = agriculture.cl_specy[`${langName}`];
      const speciesValue = agriculture.value;
      const region = agriculture.cl_region[`${langName}`];

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
          unit: result[0].cl_unit[`${langName}`],
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
  getMainData,
  getSectionData,
  getSectionDatav1
};
