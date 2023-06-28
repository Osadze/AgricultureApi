
const express = require("express");

const router = express.Router();
const {
    getFdiData,getSelectText,getTitleText

} = require("../controllers/fdi");

router.route("/data").get(getFdiData);
router.route("/text/select").get(getSelectText);
router.route("/text/title").get(getTitleText);


module.exports = router;
