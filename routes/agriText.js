const express = require("express");

const router = express.Router();
const { getSelectTexts, getTitleTexts, getSelectTextsMap } = require("../controllers/agriText");

const { getSelectTextsPrice ,getTitleTextsPrice,getSelectsTextsPrice_2} = require("../controllers/prices");

router.route("/selects").get(getSelectTexts);
router.route("/selects-map").get(getSelectTextsMap);
router.route("/titles").get(getTitleTexts);
router.route("/price/titles").get(getTitleTextsPrice);
router.route("/price/selects").get(getSelectTextsPrice);
router.route("/price-2/selects").get(getSelectsTextsPrice_2);
router.route("/price-2/titles").get(getSelectsTextsPrice_2);

module.exports = router;
