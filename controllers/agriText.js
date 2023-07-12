const Agriculture = require("../models/agriculture/agriculture_model");
const Region = require("../models/agriculture/regionCL");
const Species = require("../models/agriculture/speciesCL");
const Species_1 = require("../models/agriculture/species_1CL");
const Unit = require("../models/agriculture/unitCL");
const Indicator = require("../models/agriculture/indicatorCL");
const { Sequelize, Op } = require("sequelize");
const sequelize = require("../util/agriDb");
const languageMiddleware = require("../middleware/language");

// needs biiig cleanup hereeeee

const getSelectTexts = async (req, res) => {
  const langName = req.langName;
  const langjson = req.langTranslations;

  let { section, indicator, species, period, region } = req.query;

  if (!section || !indicator) {
    res.status(400).send("Missing section or indicator parameter");
    return;
  }

  const query = {
    section: { [Op.in]: String(section).split(",") },
    indicator: { [Op.in]: String(indicator).split(",") },
  };

  const filter = {};

  // if (species) {
  //   const speciesArray = String(species).split(",");
  //   query.species = {
  //     [Op.in]: speciesArray,
  //   };
  // }
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
    let periodSelector;

    if (!query.period) {
      const years = await Agriculture.findAll({
        where: query,
        attributes: [
          [Sequelize.fn("DISTINCT", Sequelize.col("period")), "year"],
        ],
        order: [["period", "ASC"]],
      });

      const periodData = years.map((year) => ({
        name: year.dataValues.year,
        code: year.dataValues.year,
      }));

      periodSelector = {
        title: langjson.defaultS.period.title,
        placeholder: langjson.defaultS.period.placeholder,
        selectValues: periodData,
      };
    }

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

    let speciesWithChildren;

    let speciesSelector;
    let speciesSelector2 = undefined;

    if (!query.species) {
      const speciesByParentId = speciesCodesAndNames.reduce((acc, curr) => {
        const parentId = curr.parentId || "null";
        acc[parentId] = acc[parentId] || [];
        acc[parentId].push(curr);
        return acc;
      }, {});

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

              if (
                (section == 1 && species.code >= 21 && species.code <= 99) ||
                (section == 1 && species.code >= 2100 && species.code <= 9999)
              ) {
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
          speciesSTitle = langjson.vegi.ertwlianiS.title;
          speciesSPlaceholder = langjson.vegi.ertwlianiS.placeholder;
          break;
        case section == 2 && indicator != [23, 24]:
          speciesSTitle = langjson.animal.indicatorS.title;
          speciesSPlaceholder = langjson.animal.indicatorS.placeholder;
          break;
        case indicator == [23, 24]:
          speciesSTitle = langjson.animal.LitterS.title;
          speciesSPlaceholder = langjson.animal.LitterS.placeholder;
          break;
        case indicator == [52, 53]:
          speciesSTitle = langjson.salary.avarage.title;
          speciesSPlaceholder = langjson.salary.avarage.placeholder;
          break;
        case section == 3:
          speciesSTitle = langjson.aqua.indicatorS.title;
          speciesSPlaceholder = langjson.aqua.indicatorS.placeholder;
          break;
        case section == 4:
          speciesSTitle = "";
          speciesSPlaceholder = langjson.foodBalance.indicatorS.placeholder;
          break;
        case section == 5 && indicator != [52, 53]:
          speciesSTitle = langjson.employment.indicatorS.title;
          speciesSPlaceholder = langjson.employment.indicatorS.placeholder;
          break;
        case section == 6:
          speciesSTitle = langjson.business.speciesSelector.title;
          speciesSPlaceholder = langjson.business.speciesSelector.placeholder;
          indicatorTitle = langjson.business.indicatorS.title;
          indicatorPlaceholder = langjson.business.indicatorS.placeholder;
          break;

        default:
          console.log(
            "Something Is Not Right! No Title (Or Placeholder) Found"
          );
          break;
      }

      speciesSelector = {
        title: speciesSTitle,
        placeholder: speciesSPlaceholder,
        selectValues: speciesWithChildren.species,
      };

      if (speciesWithChildren.species1.length && section == 1) {
        speciesSelector2 = {
          title: langjson.vegi.mravalwlovaniS.title,
          placeholder: langjson.vegi.mravalwlovaniS.placeholder,
          selectValues: speciesWithChildren.species1,
        };
      } else if (speciesWithChildren.species1.length && indicator == [23, 24]) {
        speciesSelector2 = {
          title: langjson.animal.lossesS.title,
          placeholder: langjson.animal.lossesS.placeholder,
          selectValues: speciesWithChildren.species1,
        };
      } else if (speciesWithChildren.species1.length && indicator == [52, 53]) {
        speciesSelector2 = {
          title: langjson.salary.median.title,
          placeholder: undefined,
          selectValues: undefined,
        };
      }
    }

    let regionSelector;

    if (!query.region) {
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

      regionSelector = {
        title: langjson.defaultS.region.title,
        placeholder: langjson.defaultS.region.placeholder,
        selectValues: regionNameAndCode,
      };
    }

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

    // console.log(query);

    const responseObj = {};

    // if (section == 4 || section == 5) {
    responseObj.periodSelector = periodSelector;
    responseObj.speciesSelector = speciesSelector;
    responseObj.indicatorSelector = indicatorSelector;
    responseObj.speciesSelector2 = speciesSelector2;
    responseObj.regionSelector = regionSelector;

    res.json(responseObj);

    // } else if (section == 6) {
    //   responseObj.periodSelector = periodSelector;
    //   responseObj.indicatorSelector = indicatorSelector;
    //   responseObj.speciesSelector = speciesSelector;
    // } else if (!query.species && !query.period && !query.region) {
    //   responseObj.periodSelector = periodSelector;
    //   responseObj.speciesSelector = speciesSelector;
    //   responseObj.speciesSelector2 = speciesSelector2;
    //   responseObj.regionSelector = regionSelector;
    // } else if (!query.region && query.species && query.period) {
    //   responseObj.regionSelector = regionSelector;
    // } else if (query.region && query.period && !query.species) {
    //   responseObj.speciesSelector = speciesSelector;
    //   responseObj.speciesSelector2 = speciesSelector2;
    // } else if (query.region && query.species && !query.period) {
    //   responseObj.periodSelector = periodSelector;
    // } else if (!query.region && query.species && !query.period) {
    //   responseObj.periodSelector = periodSelector;
    //   responseObj.regionSelector = regionSelector;
    // } else if (!query.region && !query.species && query.period) {
    //   responseObj.speciesSelector = speciesSelector;
    //   responseObj.speciesSelector2 = speciesSelector2;
    //   responseObj.regionSelector = regionSelector;
    // } else if (query.region && !query.species && !query.period) {
    //   responseObj.periodSelector = periodSelector;
    //   responseObj.speciesSelector = speciesSelector;
    //   responseObj.speciesSelector2 = speciesSelector2;
    // } else {
    //   res.json("def");
    //   return;
    // }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getSelectTextsMap = async (req, res) => {
  const langName = req.langName;
  const langjson = req.langTranslations;

  let { section, indicator, species, period } = req.query;

  if (!section || !indicator) {
    res.status(400).send("Missing section or indicator parameter");
    return;
  }

  const query = {
    section: { [Op.in]: String(section).split(",") },
    indicator: { [Op.in]: String(indicator).split(",") },
  };

  const filter = {};

  // if (species) {
  //   const speciesArray = String(species).split(",");
  //   query.species = {
  //     [Op.in]: speciesArray,
  //   };
  // }
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

  try {
    let periodSelector;

    if (!query.period) {
      const years = await Agriculture.findAll({
        where: query,
        attributes: [
          [Sequelize.fn("DISTINCT", Sequelize.col("period")), "year"],
        ],
        order: [["period", "ASC"]],
      });

      const periodData = years.map((year) => ({
        name: year.dataValues.year,
        code: year.dataValues.year,
      }));

      periodSelector = {
        title: langjson.defaultS.period.title,
        placeholder: langjson.defaultS.period.placeholder,
        selectValues: periodData,
      };
    }

    const species = await Agriculture.aggregate("species", "DISTINCT", {
      plain: false,
      where: {
        ...query,
        region: {
          [Op.not]: 1,
        },
      },
      order: [["species", "ASC"]],
    });

    const speciesCodesAndNames = await Species.findAll({
      attributes: ["code", [langName, "name"], "parentId"],
      where: { code: species.map((s) => s.DISTINCT) },
      order: [["code", "ASC"]],
    });

    // Iterate over the species and check the parentId
    for (const speciesItem of speciesCodesAndNames) {
      const { parentId } = speciesItem;
      if (parentId !== null) {
        const parentItem = speciesCodesAndNames.find(
          (item) => parseInt(item.code) === parentId
        );
        if (!parentItem) {
          speciesItem.parentId = null;
        }
      }
    }
    const result = await Agriculture.findAll({
      where: query,
      attributes: ["id", "value", "period", "species", "region", "indicator"],
      include: [
        { model: Region, attributes: [langName, "code"] },
        { model: Indicator, attributes: [langName, "code"] },
      ],
    });

    if (!result || result.length === 0) {
      // Handle the case when the result is empty
      res.status(400).send("No data found");
      return;
    }

    // Group species by parent id

    let speciesWithChildren;

    let speciesSelector;
    let speciesSelector2 = undefined;

    if (!query.species) {
      const speciesByParentId = speciesCodesAndNames.reduce((acc, curr) => {
        const parentId = curr.parentId || "null";
        acc[parentId] = acc[parentId] || [];
        acc[parentId].push(curr);
        return acc;
      }, {});

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

              if (
                (section == 1 && species.code >= 21 && species.code <= 99) ||
                (section == 1 && species.code >= 2100 && species.code <= 9999)
              ) {
                acc.species1.push(speciesItem);
              } else if (
                indicator == [23, 24] &&
                (species.code == 30 || species.code == 35)
              ) {
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

            if (
              (section == 1 && species.code >= 21 && species.code <= 99) ||
              (section == 1 && species.code >= 2100 && species.code <= 9999)
            ) {
              acc.species1.push(species);
            } else if (
              indicator == [23, 24] &&
              (species.code == 30 || species.code == 35)
            ) {
              acc.species1.push(species);
            } else {
              acc.species.push(species);
            }

            return acc;
          },
          { species: [], species1: [] }
        );
      }

      let speciesSTitle = "";
      let speciesSPlaceholder = "";

      switch (true) {
        case section == 1:
          speciesSTitle = langjson.vegi.ertwlianiS.title;
          speciesSPlaceholder = langjson.vegi.ertwlianiS.placeholder;
          break;
        case section == 2 && indicator != [23, 24]:
          speciesSTitle = langjson.animal.indicatorS.title;
          speciesSPlaceholder = langjson.animal.indicatorS.placeholder;
          break;
        case indicator == [23, 24]:
          speciesSTitle = langjson.animal.LitterS.title;
          speciesSPlaceholder = langjson.animal.LitterS.placeholder;
          break;
        case section == 3:
          speciesSTitle = langjson.aqua.indicatorS.title;
          speciesSPlaceholder = langjson.aqua.indicatorS.placeholder;
          break;

        default:
          console.log(
            "Something Is Not Right! No Title (Or Placeholder) Found"
          );
          break;
      }

      speciesSelector = {
        title: speciesSTitle,
        placeholder: speciesSPlaceholder,
        selectValues: speciesWithChildren.species,
      };

      if (speciesWithChildren.species1.length && section == 1) {
        speciesSelector2 = {
          title: langjson.vegi.mravalwlovaniS.title,
          placeholder: langjson.vegi.mravalwlovaniS.placeholder,
          selectValues: speciesWithChildren.species1,
        };
      } else if (speciesWithChildren.species1.length && indicator == [23, 24]) {
        speciesSelector2 = {
          title: langjson.animal.lossesS.title,
          placeholder: langjson.animal.lossesS.placeholder,
          selectValues: speciesWithChildren.species1,
        };
      }
    }

    const responseObj = {};
    responseObj.periodSelector = periodSelector;
    responseObj.speciesSelector = speciesSelector;
    responseObj.speciesSelector2 = speciesSelector2;

    res.json(responseObj);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getIndicatorsTexts = async (req, res) => {
  const langjson = req.langTranslations;

  const langName = req.langName;
  const { section } = req.query;

  const query = {};

  if (!section) {
    res.status(400).send("Missing section parameter");
    return;
  } else {
    query.section = section;
  }

  try {
    const result = await Agriculture.findAll({
      where: query,
      attributes: ["indicator", "species"],
      include: [
        {
          model: Indicator,
          attributes: [langName, "code", "sort_Id"],
        },
        {
          model: Unit,
          attributes: [langName, "code"],
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
      // console.log(langjson[`${section}`][cardName]?.chartTitle);
      const choosenCard = langjson[`${section}`][cardName];

      const code = item.code;

      if (section === "5" && cardName == "card2") {
        item.title = langjson.salary.indicatorTitle; // Modify title for card2 in section 5
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

      // Add more conditions to modify chartTitle for other cards
      acc[cardName] = {
        title: item.title,
        code: parseInt(item.code),
      };
      return acc;
    }, {});

    // Remove card4 and add its title to card3
    if (section === "2") {
      const card4 = cards.card4;
      if (card4) {
        const card3 = cards.card3;
        if (card3) {
          card3.title = `${card4.title} ${langjson.defaultS.or} ${card3.title}`;
        }
        delete cards.card4;
      }
      // Change card5 to card4
      const card5 = cards.card5;
      if (card5) {
        cards.card4 = {
          title: card5.title,
          code: card5.code,
        };
        delete cards.card5;
      }
    }
    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getChartTitleTexts = async (req, res) => {
  const langjson = req.langTranslations;
  const langName = req.langName;
  const langName1 = req.langName1;
  const { section, indicator, species, lang } = req.query;
  const query = {};

  let speciesArray = {};
  let indicatorArray = {};

  if (!indicator) {
    res.status(400).send("Missing indicator parameter");
  } else {
    indicatorArray = String(indicator).split(",");
    query.indicator = {
      [Op.in]: indicatorArray,
    };
  }

  if (!section) {
    res.status(400).send("Missing section parameter");
  } else {
    query.section = section;
  }

  if (!species) {
    // res.status(400).send("Missing species parameter");
  } else {
    speciesArray = String(species).split(",");
    query.species = {
      [Op.in]: speciesArray,
    };
  }

  try {
    const result = await Agriculture.findOne({
      where: query,
      attributes: [],
      include: [
        {
          model: Indicator,
          attributes: [langName, langName1, "code"],
        },
        {
          model: Species,
          attributes: [langName, langName1],
        },
        {
          model: Species_1,
          attributes: [langName],
          as: "cl_species_1",
        },
        {
          model: Unit,
          attributes: [langName],
        },
      ],
    });

    if (!result) {
      return res.status(404).json({ message: "Chart title not found" });
    }

    const speciesName = result.cl_specy[langName];
    const speciesName1 = result.cl_specy[langName1];
    const indicatorName = result.cl_indicator[langName];
    const indicatorName1 = result.cl_indicator[langName1];
    const indicatorCode = result.cl_indicator.code;
    const unitName = result.cl_unit[langName];
    const species1name = result.cl_species_1[langName];

    const response = {};

    // this switch case is for every exeption for charttitles, first of all we are spliting it into two groups, first group is where we have more than one species selected(speciesArray.length > 1), in that case charttitle should be recived from json file, charttitles.forMany and unit is not needed, other group is where we have only one specy, in this case we should get title from chartTitles.forOne with names.ka1 from db for georgian and for english just name.en and also we need units from db based on specy that is selected.
    switch (true) {
      case speciesArray.length === undefined:
        response.chartTitle = null;
        break;
      case speciesArray.length > 1 &&
        section === "1" &&
        (indicator === "12" || indicator === "14"):
        response.chartTitle = `${langjson.chartTitles.forMany[indicatorCode].annual}`;
        response.chartTitle1 = `${langjson.chartTitles.forMany[indicatorCode].perma}`;
        response.unit = `${unitName}`;
        break;
      case speciesArray.length > 1 && section === "2" && indicator === "14":
        response.chartTitle = `${langjson.chartTitles.forMany[indicatorCode].animal}`;
        response.unit = `${unitName}`;
        break;
      case speciesArray.length === 1 &&
        (indicator === "23" || indicator === "24") &&
        lang !== "en":
        response.chartTitle = `${speciesName1} ${langjson.chartTitles.forMany[indicator]}`;
        response.unit = `${unitName}`;
        break;
      case speciesArray.length === 1 &&
        (indicator === "23" || indicator === "24") &&
        lang === "en":
        response.chartTitle = `${langjson.chartTitles.forMany[indicatorCode]} of ${speciesName1} `;
        response.unit = `${unitName}`;
        break;
      case speciesArray.length > 1 && section === "3" && indicator === "14":
        response.chartTitle = `${langjson.chartTitles.forMany[indicatorCode].aqua}`;
        response.unit = `${unitName}`;
        break;
      case speciesArray.length === 1 &&
        section === "3" &&
        indicator === "33" &&
        lang !== "en":
        response.chartTitle = `${langjson.chartTitles.forOne[indicatorCode]} ${speciesName1} ${langjson.chartTitles.forOne[331]}`;
        response.unit = `${unitName}`;
        break;
      //business ->
      case lang !== "en" &&
        section === "6" &&
        ["6101", "6102", "6103", "6104", "6112"].includes(species):
        response.chartTitle = `${langjson.chartTitles.forOne[61]} ${speciesName}`;
        response.unit = `${unitName}`;
        break;
      case lang !== "en" && section === "6":
        response.chartTitle = `${langjson.chartTitles.forOne[611]} ${speciesName}`;
        response.unit = `${unitName}`;
        break;
      case lang === "en" &&
        section === "6" &&
        ["6101", "6102", "6103", "6104", "6112"].includes(species):
        response.chartTitle = `${speciesName} of ${langjson.chartTitles.forOne[61]}`;
        response.unit = `${unitName}`;
        break;
      case lang === "en" && section === "6":
        response.chartTitle = `${speciesName} in ${langjson.chartTitles.forOne[61]}`;

        response.unit = `${unitName}`;
        break;
      // <-
      case speciesArray.length > 1:
        response.chartTitle = `${langjson.chartTitles.forMany[indicatorCode]}`;
        response.unit = `${unitName}`;

        break;
      case speciesArray.length > 1:
        response.chartTitle = `${langjson.chartTitles.forMany[indicatorCode]}`;
        response.unit = `${unitName}`;

        break;
      case speciesArray.length <= 1 && (lang !== "en" || indicator === "32"):
        response.chartTitle = `${speciesName1} ${langjson.chartTitles.forOne[indicatorCode]}`;
        response.unit = `${unitName}`;
        break;
      default:
        response.chartTitle = `${langjson.chartTitles.forOne[indicatorCode]} ${speciesName1}`;
        response.unit = `${unitName}`;
        console.log("default");

        break;
    }

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
const getChartTitlesSupply = async (req, res) => {
  const langjson = req.langTranslations;
  const langName = req.langName;
  const langName1 = req.langName1;
  const { species, lang } = req.query;
  const query = {};

  query.indicator = 41;
  query.period = 2021;
  // query.indicator = 41;

  if (!species) {
    // res.status(400).send("Missing species parameter");
  } else {
    query.species = species;

    try {
      const result = await Agriculture.findAll({
        where: {
          ...query,
          species_1: {
            [Op.gt]: 1,
          },
        },

        attributes: ["species_1", "species", "unit", "indicator", "period"],
        include: [
          {
            model: Species,
            attributes: [langName, langName1],
          },
          {
            model: Species_1,
            attributes: [langName, "sort_id"],
            as: "cl_species_1",
          },
          {
            model: Unit,
            attributes: [langName],
          },
        ],
        order: [[{ model: Species_1, as: "cl_species_1" }, "sort_id", "ASC"]],
      });

      // Process the results to get distinct Species_1 values

      if (!result) {
        return res.status(404).json({ message: "Chart title not found" });
      }

      let species_1;
      let speciesName;
      let speciesName1;
      let unitName;
      let species1name;

      const processedResult = result.map((item) => {
        let chartTitle;

        species_1 = item.species_1;
        speciesName = item.cl_specy[langName];
        speciesName1 = item.cl_specy[langName1];
        unitName = item.cl_unit[langName];
        species1name = item.cl_species_1[langName];

        switch (true) {
          case lang === "ka" && species_1 >= 4104 && species_1 <= 4106:
            chartTitle = `${speciesName} ${species1name}`;
            break;
          case lang === "ka":
            chartTitle = `${speciesName1} ${species1name}`;
            break;
          case lang === "en" && species_1 >= 4104 && species_1 <= 4106:
            chartTitle = `${speciesName} for ${species1name}`;
            break;
          case lang === "en":
            chartTitle = `${species1name} of ${speciesName}`;
            break;
          default:
            chartTitle = `${speciesName1} ${species1name}`;
            console.log("default");
            break;
        }

        return {
          chartTitle: chartTitle,
          unit: unitName,
          // Include any other necessary attributes from the result
        };
      });

      let maintitle;
      if (lang === "ka") {
        maintitle = `${speciesName1} ${langjson.defaultS.balance}`;
      } else {
        maintitle = `${langjson.defaultS.balance} for ${speciesName1}`;
      }

      const response = {
        maintitle: maintitle,
        unit: unitName, // Modify the format of the main title as per your requirements
        data: processedResult,
      };

      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
};

// const getChartTitleTexts = async (req, res) => {
//   const langjson = req.langTranslations;
//   const langName = req.langName;
//   const langName1 = req.langName1;
//   const { section, indicator, species } = req.query;
//   const query = {};

//   if (!indicator) {
//     res.status(400).send("Missing indicator parameter");
//   } else {
//     query.indicator = indicator;
//   }

//   if (!section) {
//     res.status(400).send("Missing section parameter");
//   } else {
//     query.section = section;
//   }

//   let speciesArray = {};

//   if (!species) {
//     // res.status(400).send("Missing species parameter");
//   } else {
//     speciesArray = String(species).split(",");
//     query.species = {
//       [Op.in]: speciesArray,
//     };
//   }

//   try {
//     const result = await Agriculture.findOne({
//       where: query,
//       attributes: [],
//       include: [
//         {
//           model: Indicator,
//           attributes: [langName, "code"],
//         },
//         {
//           model: Species,
//           attributes: [langName, langName1],
//         },
//         {
//           model: Unit,
//           attributes: [langName],
//         },
//       ],
//     });

//     if (!result) {
//       return res.status(404).json({ message: "Chart title not found" });
//     }

//     const speciesName = result.cl_specy[langName];
//     const speciesName1 = result.cl_specy[langName1];
//     const indicatorName = result.cl_indicator[langName];
//     const indicatorCode = result.cl_indicator.code;
//     const unitName = result.cl_unit[langName];

//     const response = {};
//     console.log(speciesArray);

//     switch (true) {
//       case speciesArray.length === undefined:
//         response.chartTitle = null;
//         break;
//       case speciesArray.length > 1 &&
//         section === "1" &&
//         (indicator === "12" || indicator === "14"):
//         response.chartTitle = `${langjson.chartTitles.forMany[indicatorCode].annual}`;
//         response.chartTitle1 = `${langjson.chartTitles.forMany[indicatorCode].perma}`;
//         break;
//       case speciesArray.length > 1 && section === "2" && indicator === "14":
//         response.chartTitle = `${langjson.chartTitles.forMany[indicatorCode].animal}`;
//         break;
//       case speciesArray.length > 1 && section === "3" && indicator === "14":
//         response.chartTitle = `${langjson.chartTitles.forMany[indicatorCode].aqua}`;
//         break;
//       case speciesArray.length > 1:
//         response.chartTitle = `${langjson.chartTitles.forMany[indicatorCode]}`;
//         break;
//       case speciesArray.length > 1:
//         response.chartTitle = `${langjson.chartTitles.forMany[indicatorCode]}`;
//         break;
//       case speciesArray.length <= 1 && (langjson === "ka" || indicator === "32"):
//         response.chartTitle = `${speciesName1} ${langjson.chartTitles.forOne[indicatorCode]}`;
//         response.unit = `${unitName}`;
//         break;
//       default:
//         response.chartTitle = `${langjson.chartTitles.forOne[indicatorCode]} ${speciesName1}`;
//         response.unit = `${unitName}`;
//         break;
//     }

//     res.json(response);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

const getTitleTexts = async (req, res) => {
  const langjson = req.langTranslations;

  const langName = req.langName;
  const { section } = req.query;

  const query = {};

  if (!section) {
    res.status(400).send("Missing section parameter");
    return;
  } else {
    query.section = section;
  }

  try {
    const result = await Agriculture.findAll({
      where: query,
      attributes: ["indicator", "species"],
      include: [
        {
          model: Indicator,
          attributes: [langName, "code", "sort_Id"],
        },
        {
          model: Unit,
          attributes: [langName, "code"],
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
      // console.log(langjson[`${section}`][cardName]?.chartTitle);
      const choosenCard = langjson[`${section}`][cardName];

      const chartTitle = choosenCard?.chartTitle;
      const chartTitle2 = choosenCard?.chartTitle2;
      const chartTitle3 = choosenCard?.chartTitle3;
      const code = item.code;

      if (section === "5" && cardName == "card2") {
        item.title = langjson.salary.indicatorTitle; // Modify title for card2 in section 5
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

      // Add more conditions to modify chartTitle for other cards
      if (section == 3) {
        acc[cardName] = {
          title: item.title,
          code: parseInt(item.code),
          chartTitle: chartTitle !== undefined ? chartTitle : undefined,
          chartTitle2: chartTitle2 !== undefined ? chartTitle2 : undefined,
          chartTitle3: chartTitle3 !== undefined ? chartTitle3 : undefined,
        };
        return acc;
      } else {
        acc[cardName] = {
          title: item.title,
          code: parseInt(item.code),
          chartTitle: chartTitle !== undefined ? chartTitle : undefined,
          chartTitle2: chartTitle2 !== undefined ? chartTitle2 : undefined,
          chartTitle3: chartTitle3 !== undefined ? chartTitle3 : undefined,
        };
        return acc;
      }
    }, {});

    // Remove card4 and add its title to card3
    if (section === "2") {
      const card4 = cards.card4;
      if (card4) {
        const card3 = cards.card3;
        if (card3) {
          card3.title = `${card4.title} ${langjson.defaultS.or} ${card3.title}`;
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

module.exports = {
  getSelectTexts,
  getChartTitleTexts,
  getSelectTextsMap,
  getIndicatorsTexts,
  getTitleTexts,
  getChartTitlesSupply,
};
