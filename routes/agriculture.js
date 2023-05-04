const express = require('express')


const router = express.Router();
const {getAgriculture , getVegetationsText, getVegetations} = require("../controllers/agriculture")

router.route('/agriculture').get(getAgriculture)
router.route('/vegetations/text').get(getVegetationsText)
router.route('/vegetations').get(getVegetations)


module.exports = router;
