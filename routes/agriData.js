const express = require("express");

const router = express.Router();
const {
  getSectionData,
  getMainData,
  getFoodBalance,
  getSelfSufficiencyRatio
} = require("../controllers/agriData");

const {
  getSectionDataPrice
} = require('../controllers/prices')

router.route("/sections").get(getSectionData);
router.route("/main").get(getMainData);
router.route("/balance").get(getFoodBalance);
router.route("/self-sufficiency-ratio").get(getSelfSufficiencyRatio);
router.route("/price").get(getSectionDataPrice);

module.exports = router;
