const express = require('express')


const router = express.Router();
const {getAgriculture} = require("../controllers/agriculture")

router.route('/agriculture').get(getAgriculture)

module.exports = router;
