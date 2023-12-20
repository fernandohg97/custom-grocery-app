const getProductByIdUrl = 'https://api.hikeup.com/api/v1/products/get'
const axios = require('axios').default

const getOfferProducts = async (offerItems, accessToken) => {
  // return new Promise((resolve, reject) => {
  const products = []
  try {
    for (const item of offerItems) {
      const { offerOn, offerOnId: productId, name, compositeQty, isActive, id } = item

      const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${accessToken}` } }

      const product = await axios.get(`${getProductByIdUrl}/${productId}`, opts)
      products.push(product.data)
    }
    return Promise.resolve(products)
  } catch (error) {
    throw new Error('An error occurs getting products from offer')
  }
  // })
}

module.exports = getOfferProducts
