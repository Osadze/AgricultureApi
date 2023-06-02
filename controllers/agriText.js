const Agriculture = require("../models/agriculture_model");
const Region = require("../models/regionCL");
const Species = require("../models/speciesCL");
const Unit = require("../models/unitCL");
const indicator = require("../models/indicatorCL");
const { Sequelize, Op } = require("sequelize");
const sequelize = require("../util/database");
const languageMiddleware = require("../middleware/language");
const Indicator = require("../models/indicatorCL");

const getSelectTexts = async (req, res) => {
  const langName = req.langName;
  const lang = req.langTranslations;

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
    const speciesArray = String(species).split(",");
    query.species = {
      [Op.in]: speciesArray,
    };
  }

  if (period) {
    const periodArray = String(period).split(",");
    query.period = {
      [Op.in]: periodArray,
    };
  }

  if (region) {
    const regionArray = String(region).split(",");
    query.region = {
      [Op.in]: regionArray,
    };
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
      title: lang.defaultS.period.title,
      placeholder: lang.defaultS.period.placeholder,
      selectValues: periodData,
    };

    const species = await Agriculture.aggregate("species", "DISTINCT", {
      plain: false,
      where: query,
    });

    // console.log(species,"speciesspeciesspeciesspeciesspecies");

    const speciesCodesAndNames = await Species.findAll({
      attributes: ["code", [langName, "name"], "parentId"],
      where: { code: species.map((s) => s.DISTINCT) },
      order: [["code", "ASC"]],
    });
    const result = await Agriculture.findAll({
      where: query,
      attributes: ["id", "value", "period", "species", "region", "indicator"],
      include: [
        { model: Region, attributes: [langName, "code"] },
        { model: Indicator, attributes: [langName, "code"] },
      ],
    });

    // console.log(result);

    if (!result || result.length === 0) {
      // Handle the case when the result is empty
      res.status(400).send("No data found");
      return;
    }

    // Group species by parent id

    const speciesByParentId = speciesCodesAndNames.reduce((acc, curr) => {
      const parentId = curr.parentId || "null";
      acc[parentId] = acc[parentId] || [];
      acc[parentId].push(curr);
      return acc;
    }, {});

    let speciesWithChildren;

    // NEEDS CHANGE

    if (indicator == 14) {
      speciesWithChildren = Object.values(speciesByParentId).reduce(
        (acc, parentSpecies) => {
          parentSpecies.forEach((species) => {
            const { _previousDataValues, ...dataValues } = species.dataValues;
            const speciesItem = {
              ...dataValues,
              childrens: speciesByParentId[species.code] || [],
            };

            if (section == 1 && species.code >= 21 && species.code <= 99) {
              acc.species1.push(speciesItem);
            } else if (
              indicator == [23, 24] &&
              (species.code == 30 || species.code == 35)
            ) {
              acc.species1.push(speciesItem);
            } else if (indicator == [52, 53] && species.code == 530) {
              acc.species1.push(speciesItem);
            } else {
              acc.species.push(speciesItem);
            }
          });

          return acc;
        },
        { species: [], species1: [] }
      );
    } else {
      speciesWithChildren = speciesByParentId["null"].reduce(
        (acc, parentSpecies) => {
          const { _previousDataValues, ...dataValues } =
            parentSpecies.dataValues;
          const species = {
            ...dataValues,
            childrens: speciesByParentId[parentSpecies.code] || [],
          };

          if (section == 1 && species.code >= 21 && species.code <= 99) {
            acc.species1.push(species);
          } else if (
            indicator == [23, 24] &&
            (species.code == 30 || species.code == 35)
          ) {
            acc.species1.push(species);
          } else if (indicator == [52, 53] && species.code == 530) {
            acc.species1.push(species);
          } else {
            acc.species.push(species);
          }

          return acc;
        },
        { species: [], species1: [] }
      );
    }

    // const speciesWithChildren = speciesByParentId["null"].reduce(
    //   (acc, parentSpecies) => {
    //     const { _previousDataValues, ...dataValues } = parentSpecies.dataValues;
    //     const species = {
    //       ...dataValues,
    //       childrens: speciesByParentId[parentSpecies.code] || [],
    //     };

    //     if (section == 1 && species.code >= 21) {
    //       acc.species1.push(species);
    //     } else if (
    //       indicator == [23, 24] &&
    //       (species.code == 30 || species.code == 35)
    //     ) {
    //       // needs change in future
    //       acc.species1.push(species);

    //       // console.log("dummy dev");
    //     } else if (indicator == [52, 53] && species.code == 530) {
    //       // needs change in future
    //       acc.species1.push(species);

    //       // console.log("dummy dev");
    //     } else {
    //       acc.species.push(species);
    //     }
    //     return acc;
    //   },
    //   { species: [], species1: [] }
    // );

    let speciesSTitle = "";
    let speciesSPlaceholder = "";

    switch (true) {
      case section == 1:
        speciesSTitle = lang.vegi.ertwlianiS.title;
        speciesSPlaceholder = lang.vegi.ertwlianiS.placeholder;
        break;
      case section == 2 && indicator != [23, 24]:
        speciesSTitle = lang.animal.indicatorS.title;
        speciesSPlaceholder = lang.animal.indicatorS.placeholder;
        break;
      case indicator == [23, 24]:
        speciesSTitle = lang.animal.LitterS.title;
        speciesSPlaceholder = lang.animal.LitterS.placeholder;
        break;
      case indicator == [52, 53]:
        speciesSTitle = lang.salary.avarage.title;
        speciesSPlaceholder = lang.salary.avarage.placeholder;
        break;
      case section == 3:
        speciesSTitle = lang.aqua.indicatorS.title;
        speciesSPlaceholder = lang.aqua.indicatorS.placeholder;
        break;
      case section == 4:
        speciesSTitle = "";
        speciesSPlaceholder = lang.foodBalance.indicatorS.placeholder;
        break;
      case section == 5 && !indicator == [52, 53]:
        speciesSTitle = lang.employment.indicatorS.title;
        speciesSPlaceholder = lang.employment.indicatorS.placeholder;
        break;
      case section == 6:
        speciesSTitle = lang.business.speciesSelector.title;
        speciesSPlaceholder = lang.business.speciesSelector.placeholder;
        indicatorTitle = lang.business.indicatorS.title
        indicatorPlaceholder = lang.business.indicatorS.placeholder
        break;

      default:
        console.log("Something Is Not Right! No Title (Or Placeholder) Found");
        break;
    }

    const speciesSelector = {
      title: speciesSTitle,
      placeholder: speciesSPlaceholder,
      selectValues: speciesWithChildren.species,
    };

    let speciesSelector2 = undefined;
    if (speciesWithChildren.species1.length && section == 1) {
      speciesSelector2 = {
        title: lang.vegi.mravalwlovaniS.title,
        placeholder: lang.vegi.mravalwlovaniS.placeholder,
        selectValues: speciesWithChildren.species1,
      };
    } else if (speciesWithChildren.species1.length && indicator == [23, 24]) {
      speciesSelector2 = {
        title: lang.animal.lossesS.title,
        placeholder: lang.animal.lossesS.placeholder,
        selectValues: speciesWithChildren.species1,
      };
    } else if (speciesWithChildren.species1.length && indicator == [52, 53]) {
      speciesSelector2 = {
        title: lang.salary.median.title,
        placeholder: undefined,
        selectValues: undefined,
      };
    }

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

    let indicatorSelector;

    if (section == 6) {
      const indicatorSet = new Set();

      const indicatorNameAndCode = result.reduce((acc, indicator) => {
        const code = indicator.cl_indicator.code;
        const name = indicator.cl_indicator[`${langName}`];

        const indicatorKey = `${name}_${code}`;
        if (!indicatorSet.has(indicatorKey)) {
          indicatorSet.add(indicatorKey);
          const item = { name: name, code, childrens: [] };
          acc.push(item);
        }
        return acc;
      }, []);

      // Find the item with code 61
      const itemWithCode61 = indicatorNameAndCode.find(
        (item) => item.code === "61"
      );

      // Push items with codes 62, 63, and 64 into the childrens list of item with code 61
      indicatorNameAndCode.forEach((item) => {
        if (["62", "63", "64"].includes(item.code)) {
          itemWithCode61.childrens.push(item);
        }
      });

      // Remove items with codes 62, 63, and 64 from outside the childrens list
      const filteredResult = indicatorNameAndCode.filter(
        (item) => !["62", "63", "64"].includes(item.code)
      );

      indicatorSelector = {
        title: indicatorTitle,
        placeholder: indicatorPlaceholder,
        selectValues: filteredResult,
      };

      // console.log(filteredResult);
    }

    const regionSelector = {
      title: lang.defaultS.region.title,
      placeholder: lang.defaultS.region.placeholder,
      selectValues: regionNameAndCode,
    };

    // console.log(query);

    const responseObj = {};

    if (section == 4 || section == 5) {
      responseObj.periodSelector = periodSelector;
      responseObj.speciesSelector = speciesSelector;
      responseObj.speciesSelector2 = speciesSelector2;
    } else if (section == 6) {
      responseObj.periodSelector = periodSelector;
      responseObj.indicatorSelector = indicatorSelector;
      responseObj.speciesSelector = speciesSelector;
    } else if (!query.species && !query.period && !query.region) {
      responseObj.periodSelector = periodSelector;
      responseObj.speciesSelector = speciesSelector;
      responseObj.speciesSelector2 = speciesSelector2;
      responseObj.regionSelector = regionSelector;
    } else if (!query.region && query.species && query.period) {
      responseObj.regionSelector = regionSelector;
    } else if (query.region && query.period && !query.species) {
      responseObj.speciesSelector = speciesSelector;
      responseObj.speciesSelector2 = speciesSelector2;
    } else if (query.region && query.species && !query.period) {
      responseObj.periodSelector = periodSelector;
    } else if (!query.region && query.species && !query.period) {
      responseObj.periodSelector = periodSelector;
      responseObj.regionSelector = regionSelector;
    } else if (!query.region && !query.species && query.period) {
      responseObj.speciesSelector = speciesSelector;
      responseObj.speciesSelector2 = speciesSelector2;
      responseObj.regionSelector = regionSelector;
    } else if (query.region && !query.species && !query.period) {
      responseObj.periodSelector = periodSelector;
      responseObj.speciesSelector = speciesSelector;
      responseObj.speciesSelector2 = speciesSelector2;
    } else {
      res.json("def");
      return;
    }

    res.json(responseObj);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getTitleTexts = async (req, res) => {
  const lang = req.langTranslations;

  const langName = req.langName;
  const { section } = req.query;

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

  try {
    const result = await Agriculture.findAll({
      where: query,
      attributes: ["indicator"],
      include: [
        {
          model: Indicator,
          attributes: [langName, "code", "sort_Id"],
        },
      ],
    });

    const indicatorSet = new Set();
    const uniqueIndicators = result.reduce((acc, item) => {
      const code = item.cl_indicator.code;
      const title = item.cl_indicator[langName];
      const indicatorKey = `${title}_${code}`;
      if (!indicatorSet.has(indicatorKey)) {
        indicatorSet.add(indicatorKey);
        acc.push({ title, code, sort_Id: item.cl_indicator.sort_Id });
      }
      return acc;
    }, []);

    // Sort the uniqueIndicators array based on the sort_Id attribute
    uniqueIndicators.sort((a, b) => a.sort_Id - b.sort_Id);

    const cards = uniqueIndicators.reduce((acc, item, index) => {
      const cardName = `card${index + 1}`;
      // console.log(lang[`${section}`][cardName]?.chartTitle);
      const choosenCard = lang[`${section}`][cardName];

      const chartTitle = choosenCard?.chartTitle;
      const chartTitle2 = choosenCard?.chartTitle2;
      const chartTitle3 = choosenCard?.chartTitle3;

      if (section === "5" && cardName == "card2") {
        item.title = lang.salary.indicatorTitle; // Modify title for card2 in section 5
        // console.log("cardName", cardName);
      }

      if (section === "5" && cardName === "card3") {
        // console.log("cardName", cardName);

        return acc; // Skip adding card3 to the cards object
      }
      if (
        section === "6" &&
        (cardName === "card2" || cardName === "card3" || cardName === "card4")
      ) {
        // console.log("cardName", cardName);

        return acc; // Skip adding card3 to the cards object
      }
      if (section === "6" && cardName == "card1") {
        item.title = undefined;
        // console.log("cardName", cardName);
      }

      // OLD CODE START

      // Modify chartTitle based on the card

      // switch (cardName) {
      //   case "card1":
      //     chartTitle = lang[`${section}`].card1.chartTitle;
      //     chartTitle2 = lang[`${section}`].card1.chartTitle2;
      //     chartTitle3 = lang[`${section}`].card1.chartTitle3;
      //     break;
      //   case "card2":
      //     if (section === "5") {
      //       item.title = "test"; // Modify title for card2 in section 5
      //     }
      //     chartTitle = lang[`${section}`].card2.chartTitle;
      //     chartTitle2 = lang[`${section}`].card2.chartTitle2;
      //     chartTitle3 = lang[`${section}`].card2.chartTitle3;
      //     break;
      //   case "card3":
      //     if (section === "5") {
      //       return acc; // Skip adding card3 to the cards object
      //     } else {
      //       chartTitle = lang[`${section}`].card3.chartTitle;
      //       chartTitle2 = lang[`${section}`].card3.chartTitle2;
      //       chartTitle3 = lang[`${section}`].card3.chartTitle3;
      //     }
      //     break;
      //   case "card4":
      //     console.log(cardName);
      //     chartTitle = lang[`${section}`].card4.chartTitle;
      //     chartTitle2 = lang[`${section}`].card4.chartTitle2;
      //     chartTitle3 = lang[`${section}`].card4.chartTitle3;
      //     break;
      //   default:
      //     // console.log("def");
      //     break;
      // }

      // OLD CODE END

      // Add more conditions to modify chartTitle for other cards

      acc[cardName] = {
        title: item.title,
        code: parseInt(item.code),
        chartTitle: chartTitle,
        chartTitle2: chartTitle2,
        chartTitle3: chartTitle3,
      };
      return acc;
    }, {});

    // Remove card4 and add its title to card3
    if (section === "2") {
      const card4 = cards.card4;
      if (card4) {
        const card3 = cards.card3;
        if (card3) {
          card3.title = `${card4.title} და ${card3.title}`;
        }
        delete cards.card4;
      }
      // Change card5 to card4
      const card5 = cards.card5;
      if (card5) {
        cards.card4 = {
          title: card5.title,
          code: card5.code,
          chartTitle: card4.chartTitle,
          chartTitle2: card4.chartTitle2,
          chartTitle3: card4.chartTitle3,
        };
        delete cards.card5;
      }
    }
    res.json({ cards });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// const getTitleTexts = async (req, res) => {
//   const langName = req.langName;
//   const { section } = req.query;

//   const query = {};

//   if (!section) {
//     res.status(400).send("Missing section parameter");
//     return;
//   } else {
//     const sectionArray = String(section).split(",");
//     query.section = {
//       [Op.in]: sectionArray,
//     };
//   }

//   try {
//     const result = await Agriculture.findAll({
//       where: query,
//       attributes: ["indicator"],
//       include: [
//         {
//           model: Indicator,
//           attributes: [langName, "code", "sort_Id"],
//         },
//       ],
//     });

//     const indicatorSet = new Set();
//     const uniqueIndicators = result.reduce((acc, item) => {
//       const code = item.cl_indicator.code;
//       const title = item.cl_indicator[langName];

//       const indicatorKey = `${title}_${code}`;
//       if (!indicatorSet.has(indicatorKey)) {
//         indicatorSet.add(indicatorKey);
//         acc.push({ title, code, sort_Id: item.cl_indicator.sort_Id });
//       }
//       return acc;
//     }, []);

//     // Sort the uniqueIndicators array based on the sort_Id attribute
//     uniqueIndicators.sort((a, b) => a.sort_Id - b.sort_Id);

//     const cards = uniqueIndicators.reduce((acc, item, index) => {
//       const cardName = `card${index + 1}`;
//       acc[cardName] = { title: item.title, code: parseInt(item.code) };
//       return acc;
//     }, {});

//     // Remove card4 and add its title to card3
//     if (section === "2") {
//       const card4 = cards.card4;
//       if (card4) {
//         const card3 = cards.card3;
//         if (card3) {
//           card3.title = `${card4.title} და ${card3.title}`;
//         }
//         delete cards.card4;
//       }
//       // Change card5 to card4
//       const card5 = cards.card5;
//       if (card5) {
//         cards.card4 = { title: card5.title, code: card5.code };
//         delete cards.card5;
//       }
//     }

// res.json({ cards });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const getSelectTextsv1 = async (req, res) => {
//   let { section, indicator, species, period, region } = req.query;

//   const query = {};

//   if (!section) {
//     res.status(400).send("Missing section parameter");
//     return;
//   } else {
//     const sectionArray = String(section).split(",");
//     query.section = {
//       [Op.in]: sectionArray,
//     };
//   }

//   if (!indicator) {
//     res.status(400).send("Missing indicator parameter");
//     return;
//   } else {
//     const indicatorArray = String(indicator).split(",");
//     query.indicator = {
//       [Op.in]: indicatorArray,
//     };
//   }

//   if (species) {
//     query.species = species;
//   }

//   if (period) {
//     query.period = period;
//   }

//   if (region) {
//     query.region = region;
//   }

//   try {
//     const species = await Agriculture.aggregate("species", "DISTINCT", {
//       plain: false,
//       where: query,
//     });

//     const speciesCodesAndNames = await Species.findAll({
//       attributes: ["code", "nameKa", "parentId"],
//       where: { code: species.map((s) => s.DISTINCT) },
//       order: [["code", "ASC"]],
//     });

//     // Group species by parent id
//     const speciesByParentId = speciesCodesAndNames.reduce((acc, curr) => {
//       const parentId = curr.parentId || "null";
//       if (!acc[parentId]) {
//         acc[parentId] = [];
//       }
//       acc[parentId].push(curr);
//       return acc;
//     }, {});

//     // Map species to include children property
//     const speciesWithChildren = speciesByParentId["null"].reduce(
//       (acc, parentSpecies) => {
//         // Create a copy of the dataValues object without the _previousDataValues property
//         const { _previousDataValues, ...dataValues } = parentSpecies.dataValues;
//         const species = {
//           ...dataValues,
//           childrens: speciesByParentId[parentSpecies.code] || [],
//         };
//         // If section = 1 , vegetation, then split it into two arrays
//         // vegetatins with code under 21 are Annual crops and 21 or more than 21 Perennial cultivars
//         if (section == 1 && species.code < 21) {
//           acc.species1.push(species);
//         } else {
//           acc.species.push(species);
//         }
//         return acc;
//       },
//       { species: [], species1: [] }
//     );

//     const years = await Agriculture.findAll({
//       attributes: [
//         [Sequelize.fn("DISTINCT", Sequelize.col("period")), "nameKa"],
//       ],
//       where: query,
//       order: [["period", "ASC"]],
//     });

//     const regions = await Region.findAll({
//       attributes: ["code", "nameKa"],
//       order: [["code", "ASC"]],
//     });

//     if (section == 1) {
//       res.json({
//         species1: speciesWithChildren.species1,
//         species2: speciesWithChildren.species,
//         years,
//         regions,
//       });
//     } else {
//       res.json({
//         species1: speciesWithChildren.species,
//         years,
//         regions,
//       });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// };

// const getAgricultureText = async (req, res) => {
//   let { section, indicator } = req.query;

//   const query = {};

//   if (!section) {
//     res.status(400).send("Missing section parameter");
//     return;
//   } else {
//     const sectionArray = String(section).split(",");
//     query.section = {
//       [Op.in]: sectionArray,
//     };
//   }

//   if (!indicator) {
//     res.status(400).send("Missing indicator parameter");
//     return;
//   } else {
//     const indicatorArray = String(indicator).split(",");
//     query.indicator = {
//       [Op.in]: indicatorArray,
//     };
//   }

//   try {
//     const species = await Agriculture.aggregate("species", "DISTINCT", {
//       plain: false,
//       where: query,
//     });

//     const speciesCodesAndNames = await Species.findAll({
//       attributes: ["code", "nameKa", "parentId"],
//       where: { code: species.map((s) => s.DISTINCT) },
//       order: [["code", "ASC"]],
//     });

//     // Group species by parent id
//     const speciesByParentId = speciesCodesAndNames.reduce((acc, curr) => {
//       const parentId = curr.parentId || "null";
//       if (!acc[parentId]) {
//         acc[parentId] = [];
//       }
//       acc[parentId].push(curr);
//       return acc;
//     }, {});

//     // Map species to include children property
//     const speciesWithChildren = speciesByParentId["null"].reduce(
//       (acc, parentSpecies) => {
//         // Create a copy of the dataValues object without the _previousDataValues property
//         const { _previousDataValues, ...dataValues } = parentSpecies.dataValues;
//         const species = {
//           ...dataValues,
//           childrens: speciesByParentId[parentSpecies.code] || [],
//         };
//         // If section = 1 , vegetation, then split it into two arrays
//         // vegetatins with code under 21 are Annual crops and 21 or more than 21 Perennial cultivars
//         if (section == 1 && species.code < 21) {
//           acc.species1.push(species);
//         } else {
//           acc.species.push(species);
//         }
//         return acc;
//       },
//       { species: [], species1: [] }
//     );

//     const years = await Agriculture.findAll({
//       attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("period")), "nameKa"]],
//       where: query,
//       order: [["period", "ASC"]],
//     });

//     const regions = await Region.findAll({
//       attributes: ["code", "nameKa"],
//       order: [["code", "ASC"]],
//     });

//     if (section == 1) {
//       res.json({
//         species1: speciesWithChildren.species1,
//         species2: speciesWithChildren.species,
//         years,
//         regions,
//       });
//     } else {
//       res.json({
//         species1: speciesWithChildren.species,
//         years,
//         regions,
//       });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Internal Server Error");
//   }
// };

// const getAgricultures = async (req, res) => {
//   let { indicator, period, species, region } = req.query;

//   const query = {};

//   if (indicator) {
//     query.indicator = indicator;
//   } else {
//     query.indicator = 1;
//   }

//   if (period) {
//     const periodArray = String(period).split(",");
//     query.period = {
//       [Op.in]: periodArray,
//     };
//   } else {
//     const maxYearResult = await Agriculture.findOne({
//       attributes: [[Sequelize.fn("MAX", Sequelize.col("period")), "maxPeriod"]],
//     });
//     period = maxYearResult.dataValues.maxPeriod - 1;
//     query.period = period;
//   }

//   if (species) {
//     const speciesArray = String(species).split(",");
//     query.species = {
//       [Op.in]: speciesArray,
//     };
//   } else {
//     query.species = 10;
//   }

//   if (region) {
//     const regionArray = String(region).split(",");
//     query.region = {
//       [Op.in]: regionArray,
//     };
//   } else {
//     query.region = 1;
//   }

//   try {
//     const result = await Agriculture.findAll({
//       where: query,
//       attributes: ["id", "value", "period"],
//       include: [
//         { model: Species, attributes: ["nameKa", "code"] },
//         { model: Unit, attributes: ["nameKa", "code"] },
//         { model: Region, attributes: ["nameKa", "code"] },
//       ],
//     });

//     res.json(result);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

module.exports = {
  getSelectTexts,
  getTitleTexts,
};
