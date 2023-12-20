const express = require('express')
const salesRouter = express.Router()
const salesCtrl = require('../controllers/sales.controller')
const { getAllProductsPageParams } = require('../middlewares/getPageParams')
const getDateRangeParams = require('../middlewares/getDateRangeParams')

// Route Views
/* GET all cost and retail price for all products. */
salesRouter.get('/', getAllProductsPageParams, getDateRangeParams, salesCtrl.allSales)
salesRouter.get('/registers', salesCtrl.allRegisterClosures)

module.exports = salesRouter
