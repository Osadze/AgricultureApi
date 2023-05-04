const express = require('express')


const router = express.Router();
const {getAgriculture , getVegetationText} = require("../controllers/agriculture")

router.route('/agriculture').get(getAgriculture)
router.route('/vegetations/text').get(getVegetationText)

module.exports = router;
