const express = require('express')


const router = express.Router();
const {getAgriculture,getPlantText} = require("../controllers/agriculture")

router.route('/agriculture').get(getAgriculture)
router.route('/plants/text').get(getPlantText)

module.exports = router;
