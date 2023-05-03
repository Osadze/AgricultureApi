const { Association } = require('sequelize')
const Agriculture = require('../models/agriculture_model')

const getAgriculture = async (req, res) => {
    res.send("yoo")
}

module.exports = {
    getAgriculture
}