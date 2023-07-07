const express = require("express");

const router = express.Router();
const {
  getSectionData,
  getMainData,
  getFoodBalance,
  getSelfSufficiencyRatio,
  getMainDataNew
} = require("../controllers/agriData");

const {
  getSectionDataPrice,
  getSectionDataPrice_2
} = require('../controllers/prices')

router.route("/sections").get(getSectionData);
router.route("/main").get(getMainData);
router.route("/main-new").get(getMainDataNew);
router.route("/balance").get(getFoodBalance);
router.route("/self-sufficiency-ratio").get(getSelfSufficiencyRatio);
router.route("/price").get(getSectionDataPrice);
router.route("/price-2").get(getSectionDataPrice_2);

module.exports = router;
