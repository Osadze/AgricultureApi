
const express = require("express");

const router = express.Router();
const {
    getTradeData,

} = require("../controllers/tradeData");

router.route("/test").get(getTradeData);


module.exports = router;
