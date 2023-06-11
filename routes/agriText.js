const express = require("express");

const router = express.Router();
const { getSelectTexts, getTitleTexts } = require("../controllers/agriText");

const { getSelectTextsPrice ,getTitleTextsPrice} = require("../controllers/prices");

router.route("/selects").get(getSelectTexts);
router.route("/titles").get(getTitleTexts);
router.route("/price/titles").get(getTitleTextsPrice);
router.route("/price/selects").get(getSelectTextsPrice);

module.exports = router;
