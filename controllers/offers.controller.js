const fs = require('fs/promises')
const url = require('url')
const getAllOffersUrl = 'https://api.hikeup.com/api/v1/offers/get_all'
const getOneOfferUrl = 'https://api.hikeup.com/api/v1/offers/get'
const axios = require('axios').default
const getOfferProducts = require('../middlewares/getOfferProducts')

class Offer {
  static async allOffers (req, res, next) {
    let { pageSize, skipCount } = req.query

    // In case query params are not sent
    if (!pageSize || !skipCount) {
      pageSize = 10
      skipCount = 0
    }

    // Set option headers
    const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }

    try {
      // Fetch data
      const data = await axios.get(`${getAllOffersUrl}?page_size=${pageSize}&Skip_count=${skipCount}`, opts)
      // Get the product
      // const offers = data.data

      // Destructure to get all items
      const { items } = data.data

      // Get total count of offers that are Active
      const activeOffers = items.filter(item => item.isActive ? item : null)
      console.log(activeOffers.length)

      // console.log(offerProducts)
      // return res.status(200).send({ offers: activeOffers })
      // Successfully render product price view
      return res.render('pages/offers/offers', { offers: activeOffers })
    } catch (error) {
      return next(error)
    }
  }

  static async allProductsOffer (req, res, next) {
    // Get offer id
    const { id } = req.params
    let { offerValue } = req.query
    offerValue = offerValue / 100
    // Set option headers
    const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }

    try {
      const offer = await axios.get(`${getOneOfferUrl}/${id}`, opts)

      const offerProducts = await getOfferProducts(offer.data.offerItems, req.session.accessToken)

      if (!offerProducts) return next({ status: 404, message: `Los productos de la oferta: ${offer.data.name} no se encontraron` })

      return res.render('pages/offers/offer-products', { products: offerProducts, discount: offerValue })
    } catch (error) {
      return next(error)
    }
  }
}

module.exports = Offer
