const express = require('express')
const offerRouter = express.Router()
const offerCtrl = require('../controllers/offers.controller')
// const validateProduct = require('../middlewares/productValidation')

// Route Views
// Get all active offers
offerRouter.get('/', offerCtrl.allOffers)
// Get all offer products of one offer id
offerRouter.get('/:id', offerCtrl.allProductsOffer)

module.exports = offerRouter
