const Agriculture = require("../models/agriculture/agriculture_model");
const Region = require("../models/agriculture/regionCL");
const Species = require("../models/agriculture/speciesCL");
const Species_1 = require("../models/agriculture/species_1CL");
const Unit = require("../models/agriculture/unitCL");
const { Sequelize, Op } = require("sequelize");
const sequelize = require("../util/agriDb");
const languageMiddleware = require("../middleware/language");

const getAllPeriods = async () => {
  try {
    const periods = await Agriculture.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("period")), "period"],
      ],
      raw: true,
    });
    return periods.map((item) => item.period);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to retrieve periods from the database");
  }
};

const getMainData = async (req, res) => {
  const langName = req.langName;
  const lang = req.langTranslations;

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
            if (obj.fourthSlide.data.length < 4) {
              obj.fourthSlide.data.push({
                name: item.cl_specy[`${langName}`],
                value: parseInt(item.value),
              });
            } else {
              obj.fifthSlide.data.push({
                name: item.cl_specy[`${langName}`],
                value: parseInt(item.value),
              });
            }
            break;
        }
        return obj;
      },
      {
        firstSlide: { title: lang.mainDataSlides.firstSlide, data: [] },
        secondSlide: { title: lang.mainDataSlides.secondSlide, data: [] },
        thirdSlide: { title: lang.mainDataSlides.thirdSlide, data: [] },
        fourthSlide: {
          title: lang.mainDataSlides.fourthSlide,
          data: [],
        },
        fifthSlide: {
          title: lang.mainDataSlides.fifthSlide,
          data: [],
        },
        sixsthSlide: {
          //Todo: needs update after db
          title: lang.mainDataSlides.sixsthSlide,
          data: lang.mainDataSlides.sixsthSlideTemp,
        },
        seventhSlide: {
          //Todo: needs update after db
          title: lang.mainDataSlides.seventhSlide,
          data: lang.mainDataSlides.seventhSlideTemp,
        },
      }
    );

    res.json(filteredResult);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getSectionData = async (req, res) => {
  const langName = req.langName;

  let { section, indicator, period, species, region } = req.query;

  // console.log(req.query, "req.query");

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
    // } else if (indicator == 23 || indicator == 24) {
    //   query.indicator = [23,24];
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
    const data = await Agriculture.findAll({
      where: query,
      attributes: ["id", "value", "period", "indicator"],
      include: [
        { model: Unit, attributes: [[langName, "name"], "code"] },
        { model: Species, attributes: [[langName, "name"], "code"] },
        { model: Region, attributes: [[langName, "name"], "code"] },
      ],
    });

    const result = [];
    const result2 = [];

    // if (indicator == 23 || indicator == 24) {
    //   data.forEach((item) => {
    //     switch (item.indicator) {
    //       case 23:
    //         result.push(item);
    //         break;
    //       case 24:
    //         result2.push(item);
    //         break;
    //       default:
    //         break;
    //     }
    //   });
    //   res.json({ result, result2 });
    // }else {
    // console.log(data);
    res.json({ result: data });
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getSectionDataV1_1 = async (req, res) => {
  const langName = req.langName;

  let { section, indicator, period, species, region } = req.query;

  // console.log(req.query, "req.query");

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

const getFoodBalance = async (req, res) => {
  const langName = req.langName;

  let { period, species, indicator } = req.query;

  const query = {};
  query.section = 4;
  query.species_1 == [4101, 4102, 4110];

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
    query.species = 10;
  } else {
    const speciesArray = String(species).split(",");
    query.species = {
      [Op.in]: speciesArray,
    };
  }

  // if (indicator == [41, 43]){
  //   query.species_1 == [4101,4102,4110]
  //   console.log("test");
  // }

  try {
    const result = await Agriculture.findAll({
      where: query,
      attributes: ["id", "species", "species_1", "value", "period"],
      include: [
        {
          model: Species,
          attributes: [langName, "code"],
          as: "cl_specy",
        },
        {
          model: Species_1,
          attributes: [langName, "code"],
          as: "cl_species_1",
        },
        { model: Unit, attributes: [langName, "code"] },
      ],
      order: [["species_1", "ASC"]],
    });

    let finalResponse;
    if (indicator == 41) {
      const sankeyData = result.map((item) => {
        const from =
          item.species_1 > 4103
            ? item.cl_specy[`${langName}`]
            : item.cl_species_1[`${langName}`];
        const to =
          item.species_1 > 4103
            ? item.cl_species_1[`${langName}`]
            : item.cl_specy[`${langName}`];
        return { from: from, to: to, value: Math.abs(parseInt(item.value)) }; // this is for sankeychart visual purposes only
      });

      const otherData = await Agriculture.findAll({
        where: {
          ...query,
          period: await getAllPeriods(), // Exclude the period filter
        },
        attributes: ["id", "species", "species_1", "value", "period"],
        include: [
          {
            model: Species,
            attributes: [[langName, "name"], "code"],
            as: "cl_specy",
          },
          {
            model: Species_1,
            attributes: [[langName, "name"], "code"],
            as: "cl_species_1",
          },
          { model: Unit, attributes: [[langName, "name"], "code"] },
        ],
        order: [
          ["species_1", "ASC"],
          ["period", "ASC"],
        ],
      });

      const chartData = otherData.reduce((result, item) => {
        if (!result[`chart${item.species_1}`]) {
          result[`chart${item.species_1}`] = [];
        }
        result[`chart${item.species_1}`].push(item);
        return result;
      }, {});

      // Rename the chart keys
      let chartCount = 1;
      const renamedChartData = {};
      for (const key in chartData) {
        renamedChartData[`chart${chartCount}`] = chartData[key];
        chartCount++;
      }

      renamedChartData.sankeyChart = sankeyData;

      // Create the final response object
      finalResponse = {
        sankeyChart: sankeyData,
        ...renamedChartData,
      };
    } else {
      finalResponse = result;
    }

    res.json(finalResponse);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getSelfSufficiency = async (req, res) => {
  res.json("test");
  // food balance third indicator chart here
};

module.exports = {
  getMainData,
  getSectionData,
  getSectionDataV1_1,
  getFoodBalance,
  getSelfSufficiency,
};
