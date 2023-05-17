const Agriculture = require("../models/agriculture_model");
const Region = require("../models/regionCL");
const Species = require("../models/speciesCL");
const Unit = require("../models/unitCL");
const { Sequelize, Op } = require("sequelize");
const sequelize = require("../util/database");
const languageMiddleware = require("../middleware/language");

const getSelectTexts = async (req, res) => {
  const langName = req.langName;

  let { section, indicator, species, period, region } = req.query;

  if (!section || !indicator) {
    res.status(400).send("Missing section or indicator parameter");
    return;
  }

  const query = {
    section: { [Op.in]: String(section).split(",") },
    indicator: { [Op.in]: String(indicator).split(",") },
  };

  if (species) {
    query.species = species;
  }

  if (period) {
    query.period = period;
  }

  if (region) {
    query.region = region;
  }

  try {
    const years = await Agriculture.findAll({
      where: query,
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("period")), "year"]],
      order: [["period", "ASC"]],
    });

    const periodData = years.map((year) => ({
      name: year.dataValues.year,
      code: year.dataValues.year,
    }));

    const periodSelector = {
      title: "წელი",
      placeholder: "აირჩიეთ წელი",
      selectValues: periodData,
    };

    const species = await Agriculture.aggregate("species", "DISTINCT", {
      plain: false,
      where: query,
    });

    const speciesCodesAndNames = await Species.findAll({
      attributes: ["code", langName, "parentId"],
      where: { code: species.map((s) => s.DISTINCT) },
      order: [["code", "ASC"]],
    });

    // Group species by parent id

    const speciesByParentId = speciesCodesAndNames.reduce((acc, curr) => {
      const parentId = curr.parentId || "null";
      acc[parentId] = acc[parentId] || [];
      acc[parentId].push(curr);
      return acc;
    }, {});

    const speciesWithChildren = speciesByParentId["null"].reduce(
      (acc, parentSpecies) => {
        const { _previousDataValues, ...dataValues } = parentSpecies.dataValues;
        const species = {
          ...dataValues,
          childrens: speciesByParentId[parentSpecies.code] || [],
        };

        if (section == 1 && species.code >= 21) {
          acc.species1.push(species);
        } else {
          acc.species.push(species);
        }
        return acc;
      },
      { species: [], species1: [] }
    );
    const speciesSelector = {
      title: "სათაური",
      placeholder: "აირჩიეთ სახეობა",
      selectValues: speciesWithChildren.species,
    };

    const speciesSelector2 = speciesWithChildren.species1.length
      ? {
          title: "სათაური",
          placeholder: "აირჩიეთ სახეობა",
          selectValues: speciesWithChildren.species1,
        }
      : {};

    // const result = await Agriculture.findAll({
    //   where: query,
    //   attributes: ["id", "value", "period", "species", "region"],
    //   include: [
    //     { model: Species, attributes: ["nameKa", "code"] },
    //     { model: Unit, attributes: ["nameKa", "code"] },
    //     { model: Region, attributes: ["nameKa", "code"] },
    //   ],
    // });

    // const regionNameAndCode = result.map((region) => ({
    //   name: region.cl_region.nameKa,
    //   code: region.cl_region.code,
    // }));

    // const regionSelector = {
    //   title: "region selector",
    //   placeholder: "choose region",
    //   regionNameAndCode,
    // };
    const result = await Agriculture.findAll({
      where: query,
      attributes: ["id", "value", "period", "species", "region"],
      include: [{ model: Region, attributes: [langName, "code"] }],
    });

    const regionSet = new Set();

    const regionNameAndCode = result.reduce((acc, region) => {
      const code = region.cl_region.code;
      const name = region.cl_region[`${langName}`];

      const regionKey = `${name}_${code}`;
      if (!regionSet.has(regionKey)) {
        regionSet.add(regionKey);
        acc.push({ name: name, code });
      }
      return acc;
    }, []);

    const regionSelector = {
      title: "region selector",
      placeholder: "choose region",
      regionNameAndCode,
    };

    switch (true) {
      case !query.species && !query.period && !query.region:
        res.json({
          periodSelector,
          speciesSelector,
          speciesSelector2,
          regionSelector,
        });
        break;

      case query.species && query.period && !query.region:
        res.json({
          regionSelector,
        });
        break;

      case !query.species && query.period && query.region:
        res.json({
          speciesSelector,
          speciesSelector2,
        });
        break;

      case query.species && !query.period && query.region:
        res.json({
          periodSelector,
        });
        break;
      case query.species && !query.period && !query.region:
        res.json({
          periodSelector,
          regionSelector,
        });
        break;
      case !query.species && query.period && !query.region:
        res.json({
          speciesSelector,
          speciesSelector2,
          regionSelector,
        });
        break;
      case !query.species && !query.period && query.region:
        res.json({
          periodSelector,
          speciesSelector,
          speciesSelector2,
        });
        break;
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};
// const getSelectTexts = async (req, res) => {
//     let { section, indicator, species, period, region} = req.query;

//     const query = {};

//     if (!section) {
//       res.status(400).send("Missing section parameter");
//       return;
//     } else {
//       const sectionArray = String(section).split(",");
//       query.section = {
//         [Op.in]: sectionArray,
//       };
//     }

//     if (!indicator) {
//       res.status(400).send("Missing indicator parameter");
//       return;
//     } else {
//       const indicatorArray = String(indicator).split(",");
//       query.indicator = {
//         [Op.in]: indicatorArray,
//       };
//     }

//     if(species) {
//         query.species = species
//     }

//     if(period) {
//         query.period = period
//     }

//     if(region) {
//         query.region = region
//     }

//     try {
//       const species = await Agriculture.aggregate("species", "DISTINCT", {
//         plain: false,
//         where: query,
//       });

//       const speciesCodesAndNames = await Species.findAll({
//         attributes: ["code", "nameKa", "parentId"],
//         where: { code: species.map((s) => s.DISTINCT) },
//         order: [["code", "ASC"]],
//       });

//       // Group species by parent id
//       const speciesByParentId = speciesCodesAndNames.reduce((acc, curr) => {
//         const parentId = curr.parentId || "null";
//         if (!acc[parentId]) {
//           acc[parentId] = [];
//         }
//         acc[parentId].push(curr);
//         return acc;
//       }, {});

//       // Map species to include children property
//       const speciesWithChildren = speciesByParentId["null"].reduce(
//         (acc, parentSpecies) => {
//           // Create a copy of the dataValues object without the _previousDataValues property
//           const { _previousDataValues, ...dataValues } = parentSpecies.dataValues;
//           const species = {
//             ...dataValues,
//             childrens: speciesByParentId[parentSpecies.code] || [],
//           };
//           // If section = 1 , vegetation, then split it into two arrays
//           // vegetatins with code under 21 are Annual crops and 21 or more than 21 Perennial cultivars
//           if (section == 1 && species.code < 21) {
//             acc.species1.push(species);
//           } else {
//             acc.species.push(species);
//           }
//           return acc;
//         },
//         { species: [], species1: [] }
//       );

//       const years = await Agriculture.findAll({
//         attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("period")), "nameKa"]],
//         where: query,
//         order: [["period", "ASC"]],
//       });

//       const regions = await Region.findAll({
//         attributes: ["code", "nameKa"],
//         order: [["code", "ASC"]],
//       });

//       if (section == 1) {
//         res.json({
//           species1: speciesWithChildren.species1,
//           species2: speciesWithChildren.species,
//           years,
//           regions,
//         });
//       } else {
//         res.json({
//           species1: speciesWithChildren.species,
//           years,
//           regions,
//         });
//       }
//     } catch (err) {
//       console.error(err);
//       res.status(500).send("Internal Server Error");
//     }
//   };

const getTitleTexts = (req, res) => {
  res.json("getTitleTexts");
};

module.exports = {
  getSelectTexts,
  getTitleTexts,
};
