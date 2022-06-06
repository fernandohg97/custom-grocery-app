/* eslint-disable camelcase */
const fs = require('fs/promises')
const url = require('url')
const axios = require('axios').default
const createError = require('http-errors')
const { google } = require('googleapis')
const authSheets = require('../middlewares/authSheets')

class Supplier {
  static getAllUrl = 'https://api.hikeup.com/api/v1/suppliers/get_all'
  static getAllProductsUrl = 'https://api.hikeup.com/api/v1/products/get_all'
  static suppliersLimit = 200

  // SPREADSHEET ID OF LISTA DE PRODUCTOS
  static spreadsheetId = '1G2_8KuVDJwXBo7fUuOni2y7FWVU-Zc_vTO8VnUprO1s'

  static async allSuppliers(req, res, next) {
    // Options for this request
    const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }
    // const searchFilter = 'CS0'
    try {
      // Call API to get all products
      const data = await axios.get(`${Supplier.getAllUrl}?page_size=${Supplier.suppliersLimit}&Skip_count=${0}`, opts)

      const suppliers = data.data
      const totalCount = suppliers.totalCount

      // console.log(totalCount, numberOfPages, suppliers.items.length)
      return res.render('pages/suppliers/supplier-checker', {
        suppliers: suppliers.items,
        totalCount
      })
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

  static async allProductsBySupplier(req, res, next) {
    const { supplierId, supplierName } = req.query
    const sorting = 'name'
    // const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }

    try {
      return res.render('pages/suppliers/price-list', {
        supplierName,
        supplierId,
        token: req.session.accessToken
      })
      // // Call API to get all products
      // const data = await axios.get(`${Supplier.getAllProductsUrl}?page_size=${res.locals.resultsPerPage}&Skip_count=${res.locals.skipCount}&sorting=${sorting}&supplierIds=${supplierId}`, opts)

      // const products = data.data
      // // Omit parent product line
      // // const filterProducts = products.items.filter(product => !product.has_variants)

      // // Set total products after omitting parent products
      // const totalCount = products.totalCount
      // const numberOfPages = Math.ceil(totalCount / res.locals.resultsPerPage)
      // // console.log(totalCount, numberOfPages, res.locals.resultsPerPage, res.locals.currentPage)
      // // return res.send(products)
      // return res.render('pages/suppliers/price-list', {
      //   supplierName,
      //   supplierId,
      //   products: products.items,
      //   totalCount,
      //   apiUrl: res.locals.apiUrl,
      //   resultsPerPage: res.locals.resultsPerPage,
      //   currentPage: res.locals.currentPage,
      //   numPages: numberOfPages
      // })
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

  // static async updateProductData(req, res, next) {
  //   // const data = req.body
  //   const { supplierId } = req.query
  //   const sorting = 'name'
  //   const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }
  //   // const searchFilter = 'CS0'
  //   try {
  //     // Call API to get all products
  //     const data = await axios.get(`${Supplier.getAllProductsUrl}?page_size=${res.locals.resultsPerPage}&Skip_count=${res.locals.skipCount}&sorting=${sorting}&supplierIds=${supplierId}`, opts)

  //     const products = data.data
  //     // Omit parent product line
  //     // const filterProducts = products.items.filter(product => !product.has_variants)
  //     return res.status(201).send({message: 'Products successfully uploaded!'})
  //   } catch (error) {
  //     console.log(error)
  //     const { response } = error
  //     console.log(response)
  //     if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
  //     return next(error)
  //   }
  // }

  static async updateProducts(req, res, next) {
    const resultsPerPage = 1500
    const skipCount = 0
    const { supplierId, supplierName } = req.query

    // Get auth client
    const authClient = await authSheets()

    // Instance of google sheets api
    const googleSheets = google.sheets({ version: 'v4', auth: authClient})

    // Sheetname and range to be updated
    const sheetName = supplierName
    const range = '!D2:L'

    // Set options to send request
    let options = {
      auth: authClient,
      spreadsheetId: Supplier.spreadsheetId,
      range: sheetName + range,
      resource: {
        values: undefined
      },
      valueInputOption: 'USER_ENTERED',
    }

    // Get products from Hike API
    const sorting = 'name'
    const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }
    // const searchFilter = 'CS0'
    try {
      // Call API to get all products
      const data = await axios.get(`${Supplier.getAllProductsUrl}?page_size=${resultsPerPage}&Skip_count=${skipCount}&sorting=${sorting}&supplierIds=${supplierId}`, opts)

      const products = data.data
      // Omit parent product line
      const filterProducts = products.items.reduce((names, product) => {
        if (!product.has_variants) {
          names.push([
            product.name,
            product.sku, 
            product.barcode, 
            product.product_type.length > 0 ? product.product_type[0].type_name : 'n/a', 
            product.product_suppliers.length > 0 ? product.product_suppliers.map(supp => supp.supplier_name).join(',') : 'n/a',
            product.product_outlets.length > 0 ? product.product_outlets[0].tax_name : 'n/a',
            product.product_outlets.length > 0 ? product.product_outlets[0].cost_price : 'n/a',
            product.product_outlets.length > 0 ? product.product_outlets[0].price_inc_tax : 'n/a',
            product.product_outlets.length > 0 ? product.product_outlets[0].price_ex_tax : 'n/a'
          ])
        }
        return names
      }, [])

      options.resource.values = filterProducts

      // Read rows from spreadsheet
      const response = await googleSheets.spreadsheets.values.update(options);

      return res.status(201).send({message: `Se actualizaron ${response.data.updatedRows} productos exitosamente!`, sheetData: response.data})
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }
}

module.exports = Supplier
