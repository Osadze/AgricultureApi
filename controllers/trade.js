const { Sequelize, DataTypes, Op } = require("sequelize");
const TradeModel = require("../models/trade/trade_model");
const Types = require("../models/trade/typesCL");
const Hs6 = require("../models/trade/hs6CL");

const hs6ForAgri = [
  // hs6 items list for agriculture
  "010121",
  "010129",
  "010221",
  "010229",
  "010239",
  "010310",
  "010391",
  "010392",
  "010410",
  "010420",
  "010511",
  "010512",
  "010594",
  "010599",
  "010611",
  "010612",
  "010613",
  "010614",
  "010619",
  "010620",
  "010631",
  "010632",
  "010633",
  "010639",
  "010641",
  "010649",
  "010690",
  "020110",
  "020120",
  "020130",
  "020210",
  "020220",
  "020230",
  "020311",
  "020312",
  "020319",
  "020321",
  "020322",
  "020329",
  "020410",
  "020421",
  "020422",
  "020430",
  "020442",
  "020443",
  "020450",
  "020610",
  "020621",
  "020622",
  "020629",
  "020641",
  "020649",
  "020690",
  "020711",
  "020712",
  "020713",
  "020714",
  "020725",
  "020726",
  "020727",
  "020741",
  "020742",
  "020743",
  "020744",
  "020745",
  "020752",
  "020755",
  "020760",
  "020810",
  "020890",
  "020910",
  "020990",
  "021011",
  "021012",
  "021019",
  "021020",
  "021099",
  "030111",
  "030119",
  "030191",
  "030192",
  "030199",
  "030211",
  "030213",
  "030214",
  "030219",
  "030221",
  "030222",
  "030223",
  "030224",
  "030229",
  "030231",
  "030232",
  "030233",
  "030234",
  "030235",
  "030236",
  "030239",
  "030241",
  "030242",
  "030243",
  "030244",
  "030245",
  "030246",
  "030247",
  "030249",
  "030251",
  "030253",
  "030254",
  "030259",
  "030271",
  "030272",
  "030274",
  "030279",
  "030281",
  "030282",
  "030284",
  "030285",
  "030289",
  "030311",
  "030312",
  "030313",
  "030314",
  "030319",
  "030323",
  "030324",
  "030325",
  "030329",
  "030331",
  "030332",
  "030333",
  "030334",
  "030339",
  "030342",
  "030344",
  "030349",
  "030351",
  "030353",
  "030354",
  "030355",
  "030357",
  "030359",
  "030363",
  "030364",
  "030365",
  "030366",
  "030367",
  "030368",
  "030369",
  "030381",
  "030383",
  "030384",
  "030389",
  "030391",
  "030399",
  "030431",
  "030432",
  "030433",
  "030439",
  "030441",
  "030442",
  "030443",
  "030444",
  "030445",
  "030447",
  "030449",
  "030451",
  "030452",
  "030454",
  "030459",
  "030461",
  "030462",
  "030463",
  "030469",
  "030471",
  "030472",
  "030473",
  "030474",
  "030475",
  "030479",
  "030481",
  "030482",
  "030483",
  "030484",
  "030486",
  "030487",
  "030489",
  "030493",
  "030494",
  "030495",
  "030499",
  "030510",
  "030520",
  "030532",
  "030539",
  "030541",
  "030542",
  "030543",
  "030544",
  "030549",
  "030553",
  "030554",
  "030559",
  "030561",
  "030562",
  "030563",
  "030569",
  "030611",
  "030612",
  "030614",
  "030615",
  "030616",
  "030617",
  "030619",
  "030631",
  "030632",
  "030633",
  "030634",
  "030635",
  "030636",
  "030639",
  "030691",
  "030693",
  "030694",
  "030695",
  "030699",
  "030711",
  "030712",
  "030719",
  "030721",
  "030722",
  "030729",
  "030731",
  "030732",
  "030739",
  "030742",
  "030743",
  "030749",
  "030751",
  "030752",
  "030759",
  "030760",
  "030771",
  "030772",
  "030779",
  "030781",
  "030784",
  "030791",
  "030792",
  "030799",
  "030812",
  "030819",
  "030821",
  "030829",
  "030890",
  "040110",
  "040120",
  "040140",
  "040150",
  "040210",
  "040221",
  "040229",
  "040291",
  "040299",
  "040310",
  "040390",
  "040410",
  "040490",
  "040510",
  "040520",
  "040590",
  "040610",
  "040620",
  "040630",
  "040640",
  "040690",
  "040711",
  "040719",
  "040721",
  "040729",
  "040811",
  "040819",
  "040891",
  "040899",
  "040900",
  "041000",
  "050100",
  "050400",
  "050510",
  "050590",
  "050610",
  "050690",
  "050790",
  "050800",
  "051110",
  "051191",
  "051199",
  "060110",
  "060120",
  "060210",
  "060220",
  "060230",
  "060240",
  "060290",
  "060311",
  "060312",
  "060313",
  "060314",
  "060315",
  "060319",
  "060390",
  "060420",
  "060490",
  "070110",
  "070190",
  "070200",
  "070310",
  "070320",
  "070390",
  "070410",
  "070420",
  "070490",
  "070511",
  "070519",
  "070521",
  "070529",
  "070610",
  "070690",
  "070700",
  "070810",
  "070820",
  "070890",
  "070920",
  "070930",
  "070940",
  "070951",
  "070959",
  "070960",
  "070970",
  "070991",
  "070992",
  "070993",
  "070999",
  "071010",
  "071021",
  "071022",
  "071029",
  "071030",
  "071040",
  "071080",
  "071090",
  "071120",
  "071140",
  "071151",
  "071159",
  "071190",
  "071220",
  "071231",
  "071232",
  "071233",
  "071239",
  "071290",
  "071310",
  "071320",
  "071331",
  "071332",
  "071333",
  "071335",
  "071339",
  "071340",
  "071350",
  "071360",
  "071390",
  "071410",
  "071420",
  "071430",
  "071440",
  "071490",
  "080111",
  "080112",
  "080119",
  "080121",
  "080122",
  "080131",
  "080132",
  "080211",
  "080212",
  "080221",
  "080222",
  "080231",
  "080232",
  "080241",
  "080242",
  "080251",
  "080252",
  "080262",
  "080270",
  "080280",
  "080290",
  "080310",
  "080390",
  "080410",
  "080420",
  "080430",
  "080440",
  "080450",
  "080510",
  "080521",
  "080522",
  "080529",
  "080540",
  "080550",
  "080590",
  "080610",
  "080620",
  "080711",
  "080719",
  "080720",
  "080810",
  "080830",
  "080840",
  "080910",
  "080921",
  "080929",
  "080930",
  "080940",
  "081010",
  "081020",
  "081030",
  "081040",
  "081050",
  "081060",
  "081070",
  "081090",
  "081110",
  "081120",
  "081190",
  "081210",
  "081290",
  "081310",
  "081320",
  "081330",
  "081340",
  "081350",
  "081400",
  "090111",
  "090112",
  "090121",
  "090122",
  "090190",
  "090210",
  "090220",
  "090230",
  "090240",
  "090300",
  "090411",
  "090412",
  "090421",
  "090422",
  "090510",
  "090520",
  "090611",
  "090619",
  "090620",
  "090710",
  "090720",
  "090811",
  "090812",
  "090821",
  "090822",
  "090831",
  "090832",
  "090921",
  "090922",
  "090931",
  "090932",
  "090961",
  "090962",
  "091011",
  "091012",
  "091020",
  "091030",
  "091091",
  "091099",
  "100111",
  "100119",
  "100191",
  "100199",
  "100210",
  "100290",
  "100310",
  "100390",
  "100410",
  "100490",
  "100510",
  "100590",
  "100610",
  "100620",
  "100630",
  "100640",
  "100710",
  "100790",
  "100810",
  "100821",
  "100829",
  "100850",
  "100860",
  "100890",
  "110100",
  "110220",
  "110290",
  "110311",
  "110313",
  "110319",
  "110320",
  "110412",
  "110419",
  "110422",
  "110423",
  "110429",
  "110430",
  "110510",
  "110520",
  "110610",
  "110620",
  "110630",
  "110710",
  "110720",
  "110811",
  "110812",
  "110813",
  "110814",
  "110819",
  "110820",
  "110900",
  "120110",
  "120190",
  "120230",
  "120241",
  "120242",
  "120400",
  "120510",
  "120590",
  "120600",
  "120721",
  "120729",
  "120730",
  "120740",
  "120750",
  "120760",
  "120770",
  "120791",
  "120799",
  "120810",
  "120890",
  "120910",
  "120921",
  "120922",
  "120923",
  "120924",
  "120925",
  "120929",
  "120930",
  "120991",
  "120999",
  "121010",
  "121020",
  "121120",
  "121190",
  "121221",
  "121229",
  "121292",
  "121293",
  "121294",
  "121299",
  "121300",
  "121410",
  "121490",
  "130120",
  "130190",
  "130212",
  "130213",
  "130219",
  "130220",
  "130231",
  "130232",
  "130239",
  "140110",
  "140120",
  "140190",
  "140420",
  "140490",
  "150110",
  "150120",
  "150190",
  "150210",
  "150290",
  "150420",
  "150500",
  "150600",
  "150710",
  "150790",
  "150810",
  "150890",
  "150910",
  "150990",
  "151000",
  "151110",
  "151190",
  "151211",
  "151219",
  "151221",
  "151229",
  "151311",
  "151319",
  "151321",
  "151329",
  "151411",
  "151419",
  "151491",
  "151499",
  "151511",
  "151519",
  "151521",
  "151529",
  "151530",
  "151550",
  "151590",
  "151610",
  "151620",
  "151710",
  "151790",
  "151800",
  "152000",
  "152110",
  "152190",
  "152200",
  "160100",
  "160210",
  "160220",
  "160231",
  "160232",
  "160239",
  "160241",
  "160242",
  "160249",
  "160250",
  "160290",
  "160300",
  "160411",
  "160412",
  "160413",
  "160414",
  "160415",
  "160416",
  "160417",
  "160419",
  "160420",
  "160431",
  "160432",
  "160510",
  "160521",
  "160529",
  "160530",
  "160540",
  "160551",
  "160552",
  "160553",
  "160554",
  "160555",
  "160556",
  "160557",
  "160558",
  "160559",
  "160563",
  "160569",
  "170112",
  "170113",
  "170114",
  "170191",
  "170199",
  "170211",
  "170219",
  "170220",
  "170230",
  "170240",
  "170250",
  "170260",
  "170290",
  "170310",
  "170390",
  "170410",
  "170490",
  "180100",
  "180200",
  "180310",
  "180320",
  "180400",
  "180500",
  "180610",
  "180620",
  "180631",
  "180632",
  "180690",
  "190110",
  "190120",
  "190190",
  "190211",
  "190219",
  "190220",
  "190230",
  "190240",
  "190300",
  "190410",
  "190420",
  "190430",
  "190490",
  "190510",
  "190520",
  "190531",
  "190532",
  "190540",
  "190590",
  "200110",
  "200190",
  "200210",
  "200290",
  "200310",
  "200390",
  "200410",
  "200490",
  "200510",
  "200520",
  "200540",
  "200551",
  "200559",
  "200560",
  "200570",
  "200580",
  "200591",
  "200599",
  "200600",
  "200710",
  "200791",
  "200799",
  "200811",
  "200819",
  "200820",
  "200830",
  "200840",
  "200850",
  "200860",
  "200870",
  "200880",
  "200891",
  "200893",
  "200897",
  "200899",
  "200911",
  "200912",
  "200919",
  "200921",
  "200929",
  "200931",
  "200939",
  "200941",
  "200949",
  "200950",
  "200961",
  "200969",
  "200971",
  "200979",
  "200981",
  "200989",
  "200990",
  "210111",
  "210112",
  "210120",
  "210130",
  "210210",
  "210220",
  "210230",
  "210310",
  "210320",
  "210330",
  "210390",
  "210410",
  "210420",
  "210500",
  "210610",
  "210690",
  "220110",
  "220190",
  "220210",
  "220291",
  "220299",
  "220300",
  "220410",
  "220421",
  "220422",
  "220429",
  "220430",
  "220510",
  "220590",
  "220600",
  "220710",
  "220720",
  "220820",
  "220830",
  "220840",
  "220850",
  "220860",
  "220870",
  "220890",
  "220900",
  "230110",
  "230120",
  "230210",
  "230230",
  "230240",
  "230250",
  "230310",
  "230320",
  "230330",
  "230400",
  "230500",
  "230620",
  "230630",
  "230641",
  "230650",
  "230690",
  "230800",
  "230910",
  "230990",
  "240110",
  "240120",
  "240130",
  "240210",
  "240220",
  "240290",
  "240311",
  "240319",
  "240391",
  "240399",
];

const getTradeData = async (req, res) => {
  const langName = req.langName;
  const langjson = req.langTranslations;

  let { type, year, hs6, unit } = req.query;
  const query = {};

  if (!type) {
    query.type = "E";
  } else {
    const sectionArray = String(type).split(",");
    query.type = {
      [Op.in]: sectionArray,
    };
  }

  if (!hs6) {
   query.hs6 = "010121"
  } else {
    const indicatorArray = String(hs6).split(",");
    query.hs6 = {
      [Op.in]: indicatorArray,
    };
  }

  if (unit == 2) {
    query.tons = {
      [Op.gt]: 0,
    };
  } else if (unit == 3) {
    query.suppu = {
      [Op.gt]: 0,
    };
  } else {
    unit = 1;
    query.usd1000 = {
      [Op.gt]: 0,
    };
  }

  try {
    if (!year) {
      const maxYearResult = await TradeModel.findOne({
        attributes: [[Sequelize.fn("MAX", Sequelize.col("year")), "maxPeriod"]],
      });
      query.year = maxYearResult.dataValues.maxPeriod - 1;
    } else {
      const periodArray = String(year).split(",");
      query.year = {
        [Op.in]: periodArray,
      };
    }

    const attributes = ["type", ["year", "period"]];

    if (unit === "3") {
      attributes.push([Sequelize.fn("SUM", Sequelize.col("suppu")), "value"]);
    } else if (unit === "2") {
      // Show Tons
      attributes.push([Sequelize.fn("SUM", Sequelize.col("tons")), "value"]);
    } else {
      attributes.push([Sequelize.fn("SUM", Sequelize.col("usd1000")), "value"]);
    }

    const result = await TradeModel.findAll({
      where: query,
      // limit: 20,
      attributes,
      group: ["type", "year", "hs6"],
      include: [
        {
          model: Hs6,
          as: "hs6cl",
          attributes: [
            [langName, "name"],
            ["hs6_id", "code"],
          ],
        },
      ],
    });

    // Add unit with its corresponding name to each result object
    const modifiedResult = result.map((item) => ({
      ...item.toJSON(),
      unit: {
        name: langjson.trade.unitNames[unit],
        code: unit,
      },
    }));

    res.json({ result: modifiedResult });
  } catch (error) {
    console.log(error);
  }
};

const getSelectText = async (req, res) => {
  const langName = req.langName;
  const langjson = req.langTranslations;

  let { type, year, unit } = req.query;
  const query = {};
  const filter = {};

  if (!type) {
    // res.status(400).send("Missing section parameter");
    // return;
  } else {
    const sectionArray = String(type).split(",");
    query.type = {
      [Op.in]: sectionArray,
    };
  }

  // if (!hs6) {
  //   // res.status(400).send("Missing indicator parameter");
  //   // return;
  // } else {
  //   const indicatorArray = String(hs6).split(",");
  //   filter.hs6 = {
  //     [Op.in]: indicatorArray,
  //   };
  // }
  query.hs6 = [
    // hs6 items list for agriculture
    "010121",
    "010129",
    "010221",
    "010229",
    "010239",
    "010310",
    "010391",
    "010392",
    "010410",
    "010420",
    "010511",
    "010512",
    "010594",
    "010599",
    "010611",
    "010612",
    "010613",
    "010614",
    "010619",
    "010620",
    "010631",
    "010632",
    "010633",
    "010639",
    "010641",
    "010649",
    "010690",
    "020110",
    "020120",
    "020130",
    "020210",
    "020220",
    "020230",
    "020311",
    "020312",
    "020319",
    "020321",
    "020322",
    "020329",
    "020410",
    "020421",
    "020422",
    "020430",
    "020442",
    "020443",
    "020450",
    "020610",
    "020621",
    "020622",
    "020629",
    "020641",
    "020649",
    "020690",
    "020711",
    "020712",
    "020713",
    "020714",
    "020725",
    "020726",
    "020727",
    "020741",
    "020742",
    "020743",
    "020744",
    "020745",
    "020752",
    "020755",
    "020760",
    "020810",
    "020890",
    "020910",
    "020990",
    "021011",
    "021012",
    "021019",
    "021020",
    "021099",
    "030111",
    "030119",
    "030191",
    "030192",
    "030199",
    "030211",
    "030213",
    "030214",
    "030219",
    "030221",
    "030222",
    "030223",
    "030224",
    "030229",
    "030231",
    "030232",
    "030233",
    "030234",
    "030235",
    "030236",
    "030239",
    "030241",
    "030242",
    "030243",
    "030244",
    "030245",
    "030246",
    "030247",
    "030249",
    "030251",
    "030253",
    "030254",
    "030259",
    "030271",
    "030272",
    "030274",
    "030279",
    "030281",
    "030282",
    "030284",
    "030285",
    "030289",
    "030311",
    "030312",
    "030313",
    "030314",
    "030319",
    "030323",
    "030324",
    "030325",
    "030329",
    "030331",
    "030332",
    "030333",
    "030334",
    "030339",
    "030342",
    "030344",
    "030349",
    "030351",
    "030353",
    "030354",
    "030355",
    "030357",
    "030359",
    "030363",
    "030364",
    "030365",
    "030366",
    "030367",
    "030368",
    "030369",
    "030381",
    "030383",
    "030384",
    "030389",
    "030391",
    "030399",
    "030431",
    "030432",
    "030433",
    "030439",
    "030441",
    "030442",
    "030443",
    "030444",
    "030445",
    "030447",
    "030449",
    "030451",
    "030452",
    "030454",
    "030459",
    "030461",
    "030462",
    "030463",
    "030469",
    "030471",
    "030472",
    "030473",
    "030474",
    "030475",
    "030479",
    "030481",
    "030482",
    "030483",
    "030484",
    "030486",
    "030487",
    "030489",
    "030493",
    "030494",
    "030495",
    "030499",
    "030510",
    "030520",
    "030532",
    "030539",
    "030541",
    "030542",
    "030543",
    "030544",
    "030549",
    "030553",
    "030554",
    "030559",
    "030561",
    "030562",
    "030563",
    "030569",
    "030611",
    "030612",
    "030614",
    "030615",
    "030616",
    "030617",
    "030619",
    "030631",
    "030632",
    "030633",
    "030634",
    "030635",
    "030636",
    "030639",
    "030691",
    "030693",
    "030694",
    "030695",
    "030699",
    "030711",
    "030712",
    "030719",
    "030721",
    "030722",
    "030729",
    "030731",
    "030732",
    "030739",
    "030742",
    "030743",
    "030749",
    "030751",
    "030752",
    "030759",
    "030760",
    "030771",
    "030772",
    "030779",
    "030781",
    "030784",
    "030791",
    "030792",
    "030799",
    "030812",
    "030819",
    "030821",
    "030829",
    "030890",
    "040110",
    "040120",
    "040140",
    "040150",
    "040210",
    "040221",
    "040229",
    "040291",
    "040299",
    "040310",
    "040390",
    "040410",
    "040490",
    "040510",
    "040520",
    "040590",
    "040610",
    "040620",
    "040630",
    "040640",
    "040690",
    "040711",
    "040719",
    "040721",
    "040729",
    "040811",
    "040819",
    "040891",
    "040899",
    "040900",
    "041000",
    "050100",
    "050400",
    "050510",
    "050590",
    "050610",
    "050690",
    "050790",
    "050800",
    "051110",
    "051191",
    "051199",
    "060110",
    "060120",
    "060210",
    "060220",
    "060230",
    "060240",
    "060290",
    "060311",
    "060312",
    "060313",
    "060314",
    "060315",
    "060319",
    "060390",
    "060420",
    "060490",
    "070110",
    "070190",
    "070200",
    "070310",
    "070320",
    "070390",
    "070410",
    "070420",
    "070490",
    "070511",
    "070519",
    "070521",
    "070529",
    "070610",
    "070690",
    "070700",
    "070810",
    "070820",
    "070890",
    "070920",
    "070930",
    "070940",
    "070951",
    "070959",
    "070960",
    "070970",
    "070991",
    "070992",
    "070993",
    "070999",
    "071010",
    "071021",
    "071022",
    "071029",
    "071030",
    "071040",
    "071080",
    "071090",
    "071120",
    "071140",
    "071151",
    "071159",
    "071190",
    "071220",
    "071231",
    "071232",
    "071233",
    "071239",
    "071290",
    "071310",
    "071320",
    "071331",
    "071332",
    "071333",
    "071335",
    "071339",
    "071340",
    "071350",
    "071360",
    "071390",
    "071410",
    "071420",
    "071430",
    "071440",
    "071490",
    "080111",
    "080112",
    "080119",
    "080121",
    "080122",
    "080131",
    "080132",
    "080211",
    "080212",
    "080221",
    "080222",
    "080231",
    "080232",
    "080241",
    "080242",
    "080251",
    "080252",
    "080262",
    "080270",
    "080280",
    "080290",
    "080310",
    "080390",
    "080410",
    "080420",
    "080430",
    "080440",
    "080450",
    "080510",
    "080521",
    "080522",
    "080529",
    "080540",
    "080550",
    "080590",
    "080610",
    "080620",
    "080711",
    "080719",
    "080720",
    "080810",
    "080830",
    "080840",
    "080910",
    "080921",
    "080929",
    "080930",
    "080940",
    "081010",
    "081020",
    "081030",
    "081040",
    "081050",
    "081060",
    "081070",
    "081090",
    "081110",
    "081120",
    "081190",
    "081210",
    "081290",
    "081310",
    "081320",
    "081330",
    "081340",
    "081350",
    "081400",
    "090111",
    "090112",
    "090121",
    "090122",
    "090190",
    "090210",
    "090220",
    "090230",
    "090240",
    "090300",
    "090411",
    "090412",
    "090421",
    "090422",
    "090510",
    "090520",
    "090611",
    "090619",
    "090620",
    "090710",
    "090720",
    "090811",
    "090812",
    "090821",
    "090822",
    "090831",
    "090832",
    "090921",
    "090922",
    "090931",
    "090932",
    "090961",
    "090962",
    "091011",
    "091012",
    "091020",
    "091030",
    "091091",
    "091099",
    "100111",
    "100119",
    "100191",
    "100199",
    "100210",
    "100290",
    "100310",
    "100390",
    "100410",
    "100490",
    "100510",
    "100590",
    "100610",
    "100620",
    "100630",
    "100640",
    "100710",
    "100790",
    "100810",
    "100821",
    "100829",
    "100850",
    "100860",
    "100890",
    "110100",
    "110220",
    "110290",
    "110311",
    "110313",
    "110319",
    "110320",
    "110412",
    "110419",
    "110422",
    "110423",
    "110429",
    "110430",
    "110510",
    "110520",
    "110610",
    "110620",
    "110630",
    "110710",
    "110720",
    "110811",
    "110812",
    "110813",
    "110814",
    "110819",
    "110820",
    "110900",
    "120110",
    "120190",
    "120230",
    "120241",
    "120242",
    "120400",
    "120510",
    "120590",
    "120600",
    "120721",
    "120729",
    "120730",
    "120740",
    "120750",
    "120760",
    "120770",
    "120791",
    "120799",
    "120810",
    "120890",
    "120910",
    "120921",
    "120922",
    "120923",
    "120924",
    "120925",
    "120929",
    "120930",
    "120991",
    "120999",
    "121010",
    "121020",
    "121120",
    "121190",
    "121221",
    "121229",
    "121292",
    "121293",
    "121294",
    "121299",
    "121300",
    "121410",
    "121490",
    "130120",
    "130190",
    "130212",
    "130213",
    "130219",
    "130220",
    "130231",
    "130232",
    "130239",
    "140110",
    "140120",
    "140190",
    "140420",
    "140490",
    "150110",
    "150120",
    "150190",
    "150210",
    "150290",
    "150420",
    "150500",
    "150600",
    "150710",
    "150790",
    "150810",
    "150890",
    "150910",
    "150990",
    "151000",
    "151110",
    "151190",
    "151211",
    "151219",
    "151221",
    "151229",
    "151311",
    "151319",
    "151321",
    "151329",
    "151411",
    "151419",
    "151491",
    "151499",
    "151511",
    "151519",
    "151521",
    "151529",
    "151530",
    "151550",
    "151590",
    "151610",
    "151620",
    "151710",
    "151790",
    "151800",
    "152000",
    "152110",
    "152190",
    "152200",
    "160100",
    "160210",
    "160220",
    "160231",
    "160232",
    "160239",
    "160241",
    "160242",
    "160249",
    "160250",
    "160290",
    "160300",
    "160411",
    "160412",
    "160413",
    "160414",
    "160415",
    "160416",
    "160417",
    "160419",
    "160420",
    "160431",
    "160432",
    "160510",
    "160521",
    "160529",
    "160530",
    "160540",
    "160551",
    "160552",
    "160553",
    "160554",
    "160555",
    "160556",
    "160557",
    "160558",
    "160559",
    "160563",
    "160569",
    "170112",
    "170113",
    "170114",
    "170191",
    "170199",
    "170211",
    "170219",
    "170220",
    "170230",
    "170240",
    "170250",
    "170260",
    "170290",
    "170310",
    "170390",
    "170410",
    "170490",
    "180100",
    "180200",
    "180310",
    "180320",
    "180400",
    "180500",
    "180610",
    "180620",
    "180631",
    "180632",
    "180690",
    "190110",
    "190120",
    "190190",
    "190211",
    "190219",
    "190220",
    "190230",
    "190240",
    "190300",
    "190410",
    "190420",
    "190430",
    "190490",
    "190510",
    "190520",
    "190531",
    "190532",
    "190540",
    "190590",
    "200110",
    "200190",
    "200210",
    "200290",
    "200310",
    "200390",
    "200410",
    "200490",
    "200510",
    "200520",
    "200540",
    "200551",
    "200559",
    "200560",
    "200570",
    "200580",
    "200591",
    "200599",
    "200600",
    "200710",
    "200791",
    "200799",
    "200811",
    "200819",
    "200820",
    "200830",
    "200840",
    "200850",
    "200860",
    "200870",
    "200880",
    "200891",
    "200893",
    "200897",
    "200899",
    "200911",
    "200912",
    "200919",
    "200921",
    "200929",
    "200931",
    "200939",
    "200941",
    "200949",
    "200950",
    "200961",
    "200969",
    "200971",
    "200979",
    "200981",
    "200989",
    "200990",
    "210111",
    "210112",
    "210120",
    "210130",
    "210210",
    "210220",
    "210230",
    "210310",
    "210320",
    "210330",
    "210390",
    "210410",
    "210420",
    "210500",
    "210610",
    "210690",
    "220110",
    "220190",
    "220210",
    "220291",
    "220299",
    "220300",
    "220410",
    "220421",
    "220422",
    "220429",
    "220430",
    "220510",
    "220590",
    "220600",
    "220710",
    "220720",
    "220820",
    "220830",
    "220840",
    "220850",
    "220860",
    "220870",
    "220890",
    "220900",
    "230110",
    "230120",
    "230210",
    "230230",
    "230240",
    "230250",
    "230310",
    "230320",
    "230330",
    "230400",
    "230500",
    "230620",
    "230630",
    "230641",
    "230650",
    "230690",
    "230800",
    "230910",
    "230990",
    "240110",
    "240120",
    "240130",
    "240210",
    "240220",
    "240290",
    "240311",
    "240319",
    "240391",
    "240399",
  ];

  // if (!unit) {
  //   // res.status(400).send("Missing indicator parameter");
  //   // return;
  // } else {
  //   query.unit = unit;
  // }

  // if (!year) {
  //   const maxYearResult = await TradeModel.findOne({
  //     attributes: [[Sequelize.fn("MAX", Sequelize.col("year")), "maxPeriod"]],
  //   });
  //   query.year = maxYearResult.dataValues.maxPeriod - 1;
  // } else {
  //   const periodArray = String(year).split(",");
  //   query.year = {
  //     [Op.in]: periodArray,
  //   };
  // }

  try {
    const years = await TradeModel.findAll({
      where: query,
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("year")), "year"]],
      // where: {
      //   year: {
      //     [Sequelize.Op.gte]: 2014,
      //   },
      // },
      order: [["year", "ASC"]],
    });

    const periodData = years.map((year) => ({
      name: year.dataValues.year,
      code: year.dataValues.year,
    }));

    const periodSelector = {
      title: langjson.defaultS.period.title,
      placeholder: langjson.defaultS.period.placeholder,
      selectValues: periodData,
    };

    const species = await TradeModel.aggregate("hs6", "DISTINCT", {
      where: query,
      plain: false,
    });

    // // console.log(species,"speciesspeciesspeciesspeciesspecies");

    const speciesCodesAndNames = await Hs6.findAll({
      where: query,
      // limit: 10,
      attributes: [
        [langName, "name"],
        ["hs6_id", "code"],
      ],
      where: { hs6_id: species.map((s) => s.DISTINCT) },
      order: [["hs6_id", "ASC"]],
    });

    //can be improved
    const units = [
      { name: langjson.trade.unitNames[1], code: 1 },
      { name: langjson.trade.unitNames[2], code: 2 },
      { name: langjson.trade.unitNames[3], code: 3 },
    ];

    const unitSelector = {
      title: langjson.trade.unitS.title,
      placeholder: langjson.trade.unitS.placeholder,
      selectValues: units,
    };

    const speciesSelector = {
      title: langjson.trade.speciesS.title,
      placeholder: langjson.trade.speciesS.placeholder,
      selectValues: speciesCodesAndNames,
    };

    res.json({
      periodSelector,
      speciesSelector,
      unitSelector,
    });

    // res.json(responseObj);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
};

const getTitleText = async (req, res) => {
  const langjson = req.langTranslations;

  const langName = req.langName;

  try {
    const cards = {
      card1: langjson.trade.card1,
      card2: langjson.trade.card2,
    };

    res.json({ cards });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTradeData,
  getSelectText,
  getTitleText,
};
