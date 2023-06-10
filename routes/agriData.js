const express = require("express");

const router = express.Router();
const {
  getSectionData,
  getMainData,
  getFoodBalance,
  getSelfSufficiency
} = require("../controllers/agriData");

router.route("/sections").get(getSectionData);
router.route("/main").get(getMainData);
router.route("/balance").get(getFoodBalance);
router.route("/self-sufficiency").get(getSelfSufficiency);

module.exports = router;
