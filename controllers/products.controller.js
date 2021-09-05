/* eslint-disable camelcase */
const fs = require('fs/promises')
const url = require('url')
const getAllUrl = 'https://api.hikeup.com/api/v1/products/get_all'
const getOneByIdUrl = 'https://api.hikeup.com/api/v1/products/get'
const getOneBySkuUrl = 'https://api.hikeup.com/api/v1/products/by_sku'
const getAllProductTypesUrl = 'https://api.hikeup.com/api/v1/product_types/get_all'
const updateProductUrl = 'https://api.hikeup.com/api/v1/products/create'
const deleteProductUrl = 'https://api.hikeup.com/api/v1/products/delete'
const taxesUrl = 'https://api.hikeup.com/api/v1/taxes/get_all'
const axios = require('axios').default

class Product {
  static async oneProductBySku (req, res, next) {
    let { searchFilter, pageSize, skipCount } = req.query

    // In case query params are not sent
    if (!pageSize || !skipCount) {
      pageSize = 1
      skipCount = 0
    }

    // Set option headers
    const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }

    try {
      // Fetch data
      const data = await axios.get(`${getAllUrl}?page_size=${pageSize}&Skip_count=${skipCount}&Filter=${searchFilter}`, opts)
      // Get the product
      const product = data.data.items[0]
      console.log(product)

      // Successfully render product price view
      return res.render('pages/products/product-price', { product: product, criteria: searchFilter })
    } catch (error) {
      return next(error)
    }
  }

  static async oneProduct (req, res, next) {
    const { id } = req.params

    // Set option headers
    const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }

    try {
      // Fetch data
      const { data } = await axios.get(`${getOneByIdUrl}/${id}`, opts)
      const taxes = await axios.get(`${taxesUrl}`, opts)
      // Get the product
      const product = data
      // console.log(taxes.data.items)

      // return res.status(200).send(taxes.data.items)
      // Successfully render product price view
      return res.render('pages/products/edit-product', { product: product, taxes: taxes.data.items })
    } catch (error) {
      return next(error)
    }
  }

  static async updateProduct (req, res, next) {
    const { id } = req.params
    const {
      parentId,
      name,
      description,
      sku,
      barcode,
      primary_image,
      brand_id,
      bran_name,
      season_id,
      season_name,
      supplier_code,
      sales_code,
      purchase_code,
      inventory_asset_acc_code,
      customField,
      isPricingDifferentByOutlet,
      has_variants,
      track_inventory,
      continue_selling_no_inventory,
      additional_reward_points,
      created_date_time,
      last_modified,
      seO_feature,
      meta_title,
      meta_desc,
      meta_keywords,
      enable_unit_of_measure,
      product_outlets,
      isActive
    } = req.body

    console.log(req.body)

    // Set option headers
    const opts = { headers: { Accept: 'application/json', 'Content-Type': 'text/json', Authorization: `Bearer ${req.session.accessToken}` } }

    const params = {
      name: name || null,
      description: description || '',
      sku: sku || null,
      barcode: barcode || null,
      primary_image: primary_image || null,
      brand_id: brand_id || null,
      bran_name: bran_name || null,
      season_id: season_id || null,
      season_name: season_name || null,
      supplier_code: supplier_code || null,
      sales_code: sales_code || null,
      purchase_code: purchase_code || null,
      inventory_asset_acc_code: inventory_asset_acc_code || null,
      customField: customField || null,
      isPricingDifferentByOutlet: isPricingDifferentByOutlet || false,
      has_variants: has_variants || false,
      track_inventory: track_inventory || true,
      continue_selling_no_inventory: continue_selling_no_inventory || false,
      additional_reward_points: additional_reward_points || 0,
      created_date_time: created_date_time,
      last_modified: new Date(),
      seO_feature: seO_feature || false,
      meta_title: meta_title || null,
      meta_desc: meta_desc || null,
      meta_keywords: meta_keywords || null,
      enable_unit_of_measure: enable_unit_of_measure || false,
      product_tags: [],
      product_type: [],
      sales_channels: [{ sales_channels: '1' }],
      product_outlets: product_outlets,
      product_suppliers: [],
      product_attributes: [],
      product_variants: [],
      additional_images: [],
      product_extras: [],
      product_unit_of_measures: [],
      isActive: isActive || true,
      id: id
    }
    console.log(name)
    try {
      const productEdited = await axios.post(`${updateProductUrl}`, params, opts)
      // console.log(req.body)
      console.log(productEdited)
      // return res.send(req.body)
      return res.render('pages/welcome', { message: `${name} se actualizo correctamente!` })
    } catch (error) {
      return next(error)
    }
  }

  static async deleteProduct (req, res, next) {
    const { id } = req.params

    console.log('To delete', id)
    // Set option headers
    const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }
    try {
      await axios.delete(`${deleteProductUrl}/${id}`, opts)

      return res.render('pages/welcome', { message: `Producto con ID: ${id} eliminado satisfactoriamente!` })
    } catch (error) {
      return next(error)
    }
  }

  static async allProductTypes (req, res, next) {
    // Get required query params
    let { pageSize, skipCount } = req.query

    // In case query params are not sent
    if (!pageSize || !skipCount) {
      pageSize = 30
      skipCount = 0
    }

    // Set option headers
    const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }

    try {
      // Fetch data
      const { data } = await axios.get(`${getAllProductTypesUrl}?page_size=${pageSize}&Skip_count=${skipCount}`, opts)
      // Destructure total number of items and data
      let { totalCount, items: productTypes } = data

      // Filter product types that are Active
      productTypes = productTypes.filter(type => type.isActive)

      // Successfully render product types view
      return res.render('pages/products/product-types', { totalCount, productTypes })
    } catch (error) {
      return next(error)
    }
  }

  static async allProducts (req, res, next) {
    let { pageSize, skipCount } = req.query

    if (!pageSize || !skipCount) {
      pageSize = 1
      skipCount = 0
    }

    // Options for this request
    const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }

    try {
      const data = await axios.get(`${getAllUrl}?page_size=${pageSize}&skip_count=${skipCount}`, opts)
      const products = data.data

      console.log(products)
      return res.status(200).send(products)
    } catch (error) {
      return next(error)
    }
  }

  // static async recentProducts (req, res, next) {
  //   // Get required query params
  //   let { pageSize, skipCount } = req.query

  //   // In case query params are not sent
  //   if (!pageSize || !skipCount) {
  //     pageSize = 2
  //     skipCount = 0
  //   }

  //   // headers for the request
  //   const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }

  //   const createdDateTimeSort = (inputArr) => {
  //     const currentLength = inputArr.length
  //     console.log(inputArr[0].created_date_time)
  //     for (let i = 0; i < currentLength; i++) {
  //       for (let j = 0; j < currentLength; j++) {
  //         if (new Date(inputArr[j].created_date_time) < new Date(inputArr[j + 1].created_date_time)) {
  //           const tmp = inputArr[j]
  //           inputArr[j] = inputArr[j + 1]
  //           inputArr[j + 1] = tmp
  //         }
  //       }
  //     }
  //     return inputArr
  //   }

  //   try {
  //     // Fetch data from hike API
  //     const { data } = await axios.get(`${getAllUrl}?page_size=${pageSize}&skip_count=${skipCount}`, opts)
  //     const { next, totalCount, items: products } = data

  //     // Get number of pages based on total count items
  //     const totalPages = Math.ceil(totalCount / pageSize)

  //     // Create initial array to store first products
  //     const previousProducts = products
  //     // Create array to store after products
  //     let afterProducts

  //     let recentProducts
  //     // Initial counter
  //     let i = 0

  //     let nextPageParams = next
  //     // let recentProducts = products.sort((firstProduct, secondProduct) => new Date(secondProduct.created_date_time) - new Date(firstProduct.created_date_time))

  //     // Loop through all pages
  //     while (i < 3) {
  //       const { data } = await axios.get(`${getAllUrl}${nextPageParams}`, opts)
  //       const { next: nextPage, items: productos } = data
  //       nextPageParams = nextPage
  //       console.log(nextPageParams)
  //       console.log(productos)
  //       afterProducts = productos
  //       recentProducts = previousProducts.map(previousProduct => afterProducts.filter(afterProduct => previousProduct.created_date_time > afterProduct.created_date_time ? previousProduct : afterProduct))

  //       i++
  //     }

  //     // console.log(recentProducts)
  //     return res.status(200).json(recentProducts)
  //   } catch (error) {
  //     // return res.status(500).send(error.message)
  //     return next(error)
  //   }
  // }
}

module.exports = Product
