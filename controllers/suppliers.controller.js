'use strict'
/* eslint-disable camelcase */
const fs = require('fs/promises')
const url = require('url')
const axios = require('axios').default
const createError = require('http-errors')
// const { google } = require('googleapis')
// const authSheets = require('../middlewares/authSheets')
const Sheet = require('../middlewares/authSheets')
const WORKSHEETS = require('../config/worksheets')
const ProviderModel = require('../models/provider.model')
const { defaultConfirmationPassword } = require('../config/default-values')

class Supplier {
  static getAllUrl = 'https://api.hikeup.com/api/v1/suppliers/get_all'
  static getAllProductsUrl = 'https://api.hikeup.com/api/v1/products/get_all'
  static suppliersLimit = 200

  static async allHikeSuppliers(req, res, next) {
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

  // OBTENER UN RESUMEN PROVEEDOR POR ID
  static async getSupplierSummaryById(req, res, next) {
    const { id } = req.params
    // console.log(id);
    try {      
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
      const rows = await sheet.getRows()
      let providerToFind = rows.filter(r => {
        if (r.toObject().ID === id) return r
      })

      if (!providerToFind.length || !providerToFind) return next(createError(404, `Proveedor con ID: ${id} no encontrado!`))

      // Destructure object
      providerToFind = providerToFind[0].toObject()
      return res.status(200).json(providerToFind)

      // return res.end()
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      if (error.response) {
        if (error.response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      }
      // const { response } = error
      // console.log(response)
      return next(error)
    }
  }

  // OBTENER UN PROVEEDOR POR ID
  static async getSupplierById(req, res, next) {
    const { id } = req.params
    console.log(id);
    try {      
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
      const rows = await sheet.getRows()
      let providerToFind = rows.filter(r => {
        if (r.toObject().ID === id) return r
      })
      if (!providerToFind.length || !providerToFind) return next(createError(404, `Proveedor con ID: ${id} no encontrado!`))

      providerToFind = providerToFind[0].toObject()

      // console.log(JSON.stringify(data))
      let jsonResponse = JSON.stringify(providerToFind)
      // // // jsonResponse = jsonResponse.replace(/\s+/g," ")
      console.log(jsonResponse)
      return res.render('pages/suppliers/edit-supplier', {
        jsonResponse,
      })
      // return res.end()
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      if (error.response) {
        if (error.response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      }
      // const { response } = error
      // console.log(response)
      return next(error)
    }
  }

  /**
   * GET ALL SUPPLIERS FROM 'DATOS PROVEEDORES'
   */
  static async allSuppliers(req, res, next) {

    try {      
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
      const rows = await sheet.getRows()
      const data = rows.map(r => r.toObject())
      // console.log(data[0])
      // console.log(JSON.stringify(data))
      let jsonResponse = JSON.stringify({providersData: data})
      // // jsonResponse = jsonResponse.replace(/\s+/g," ")
      // // console.log(jsonResponse)
      return res.render('pages/suppliers/all', {
        jsonResponse,
      })
      // return res.json(data)

      // res.locals.totalCountSuppliers = rows.length
      // return res.end()

    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

  /**
   * OBTENER LAS ULTIMAS 10 COMPRAS POR PROVEEDOR
   */
  static async allPurchasesByProvider(req, res, next) {

    const { providerName } = req.query
    console.log(`PROVEEDOR: ${providerName}`);
    try {      
      // await Sheet.loadInfo()

      // const sheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      // const rows = await sheet.getRows()

 // Get total amount of note number
//  " $ - "
 let totalAmount = " $ 605.00 ".split('$')[1].trim().split(',').join('');
 console.log(totalAmount)
//  totalAmount = totalAmount === '-' ? parseFloat('0.00') : parseFloat(totalAmount);

      // OBTENER ULTIMAS 10 COMPRAS
      const data = res.locals.purchases.filter(r => {
        return (r.toObject().Proveedor === providerName && 
        (r.toObject()['Monto Total'].split('$')[1].trim().split(',').join('') > 0 && r.toObject()['Monto Pagado'].split('$')[1].trim().split(',').join('') === '-'))
        }).map(r => r.toObject())
        .sort((a,b) => new Date(b['Fecha Recibido']) - new Date(a['Fecha Recibido']))
        .slice(0, 10)

        // console.log(data)
      // console.log(JSON.stringify(data))
      let jsonResponse = JSON.stringify({
        pendingResume: {
          totalBalance: res.locals.totalBalance,
          totalDueAmount: res.locals.totalDueAmount,
          notesToPayCount: res.locals.notesToPayCount,
          pendingNotes: res.locals.noteNumbersObject,
        },
        lastPurchases: {
          purchases: data,
          purchasesCount: data.length
        },
        averageResume: {
          yearPurchasesCount: res.locals.yearPurchasesCount,
          totalPurchaseYearAmount: res.locals.totalPurchaseYearAmount,
          averagePurchaseAmount: res.locals.averagePurchaseAmount
        }
      })

      // return res.status(200).send(jsonResponse)

      return res.render('pages/suppliers/supplier-report', {
        jsonResponse,
      })

      // res.locals.totalCountSuppliers = rows.length
      // return res.end()

    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

  /** GUARDAR NUEVO PROVEEDOR */
  static async newSupplier(req, res, next) {
    console.log(req.body)
    let newID = res.locals.newID
    const { 
      id = newID,
      providerName,
      seller,
      phone,
      agreement,
      category,
      isInvoice,
      paymentMethodProvider,
      retirementAccountProvider,
      numberOfNotesAllow,
      daysToPayCredit,
      email,
      supplierDetails,
      bankname,
      recipient,
      clabeAccount,
      cardnumber 
    } = req.body
    console.log(id)
    

    try {      
      
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
      
      const newProvider = await sheet.addRow(ProviderModel.newProviderModel(
        id, 
        providerName, 
        seller, 
        phone,
        agreement,
        category,
        isInvoice,
        paymentMethodProvider,
        retirementAccountProvider,
        numberOfNotesAllow,
        daysToPayCredit,
        email,
        supplierDetails,
        bankname,
        recipient,
        clabeAccount,
        cardnumber ))
      console.log(newProvider)
      if (!newProvider) return next(createError(409, 'Ups, no se pudo crear el proveedor'))

      return res.status(201).json({message: `😉 Proveedor ${newProvider.toObject().Proveedor} agregado exitosamente!`})

    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response.data)
      if (response.status === 400) return res.status(400).json({message: `😕Ups, hubo un error: ${response.data.error.message}`})
      return next(error)
    }
  }

  /**
   * UPDATE ONE SUPPLIER
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
  static async updateSupplier(req, res, next) {
    // const data = req.body
    console.log('updateSupplier...')
    // console.log(req.body)
    // console.log(req.params)
    const { id } = req.params
    console.log(id)
    const { 
      providerName,
      seller,
      phone,
      email,
      isInvoice,
      category,
      agreement,
      paymentMethodProvider,
      retirementAccountProvider,
      numberOfNotesAllow,
      daysToPayCredit,
      supplierDetails,
      bankname,
      recipient,
      clabeAccount,
      cardnumber 
    } = req.body
    // console.log(req.body)

    try {      
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
      const rows = await sheet.getRows()
      let providerIndex = rows.findIndex(r => {
        return Number(r.toObject().ID) === Number(id)
      })
      // return
      // console.log(providerIndex)
      // GUARD STATEMENT
      if (providerIndex < 0) return next(createError(404, `Proveedor con ID: ${id} no encontrado!`))

      // set new values
      rows[providerIndex].assign(ProviderModel.updateProviderModel(
        providerName,
        seller,
        phone,
        agreement,
        category,
        isInvoice,
        paymentMethodProvider,
        retirementAccountProvider,
        numberOfNotesAllow,
        daysToPayCredit,
        email,
        supplierDetails,
        bankname,
        recipient,
        clabeAccount,
        cardnumber
      ))
      
      // Save row data
      await rows[providerIndex].save();
      return res.status(201).json({message: `😉 Proveedor ${providerName} actualizado exitosamente!`})

    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response.data)
      if (response.status === 400) return res.status(400).json({message: `😕Ups, hubo un error: ${response.data.error.message}`})
      return next(error)
    }
  }

   /**
   * REMOVE ONE SUPPLIER
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   * @returns 
   */
   static async removeSupplier(req, res, next) {
    // const data = req.body
    console.log('remove...')
    // console.log(req.body)
    // console.log(req.params)
    const { id } = req.params
    // const { passwordConfirm } = req.body
    console.log(id)
    try {

      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
      const rows = await sheet.getRows()
      let providerIndex = rows.findIndex(r => {
        return Number(r.toObject().ID) === Number(id)
      })
      console.log(providerIndex)
      if (providerIndex < 0) return next(createError(404, `Proveedor con ID: ${id} no encontrado!`))
      
      // get provider name
      const providerName = rows[providerIndex].get('Proveedor')
      // delete row data
      await rows[providerIndex].delete()
      return res.status(201).json({message: `😉 Proveedor: ${providerName} eliminado exitosamente!`})

    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response.data)
      if (response.status === 400) return res.status(400).json({message: `😕Ups, hubo un error: ${response.data.error.message}`})
      return next(error)
    }
  }

  // REMOVE MANY SUPPLIERS
  // static async removeManySuppliers(req, res, next) {
  //   // const data = req.body
  //   console.log('removeMANY...')
  //   // console.log(req.body)
  //   // console.log(req.params)
  //   const { supplierIds } = req.body
  //   console.log(supplierIds)

  //   try {      
  //     await Sheet.loadInfo()

  //     const sheet = Sheet.sheetsByTitle[WORKSHEETS.datosProveedoresSheet.SHEETNAME]
  //     const rows = await sheet.getRows()
  //     let providersIndex = supplierIds.filter(id => {
  //       return rows.filter(r => Number(r.toObject().ID) === Number(id))
  //     })
  //     console.log(providersIndex)
  //     if (!providersIndex || !providersIndex.length) return next(createError(404, `Proveedor con IDs: ${supplierIds.toString()} no encontrados!`))
      
  //     // get provider name
  //     // const providerName = rows[providerIndex].get('Proveedor')
  //     // delete row data
      
  //     providersIndex.forEach(async id => await rows[id].delete())
  //     // await rows[providerIndex].delete()
  //     return res.status(201).json({message: `😉 Proveedores: ${supplierIds.toString()} eliminados exitosamente!`})

  //   } catch (error) {
  //     console.log(`Hubo un error: ${error}`)
  //     const { response } = error
  //     console.log(response.data)
  //     if (response.status === 400) return res.status(400).json({message: `😕Ups, hubo un error: ${response.data.error.message}`})
  //     return next(error)
  //   }
  // }

  static async allProductsBySupplier(req, res, next) {
    const { supplierId, supplierName } = req.query
    const sorting = 'name'
    // const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }

    try {
      return res.render('pages/suppliers/price-list', {
        supplierName,
        supplierId,
        successMessage: '',
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

  static async getAllCompras(req, res, next) {
    const resultsPerPage = 100
    const skipCount = 0
    const { supplierId, supplierName } = req.query

    // Get auth client
    const authClient = await authSheets()

    // Instance of google sheets api
    const googleSheets = google.sheets({ version: 'v4', auth: authClient})

    // Sheetname and range to be updated
    const sheetName = 'Compras'
    const range = '!A12:L'

    // Set options to send request
    let options = {
      auth: authClient,
      spreadsheetId: Supplier.spreadsheetId,
      range: sheetName + range,
      valueRenderOption: 'FORMATTED_VALUE'
    }

    // const searchFilter = 'CS0'
    try {
      

      // Get rows from spreadsheet
      const response = (await googleSheets.spreadsheets.values.get(options)).data;
      // console.log(response)
      // console.log(JSON.stringify(response))
      let jsonResponse = JSON.stringify({purchasesData: response.values})
      // jsonResponse = jsonResponse.replace("\n", "\\n");
      // console.log(jsonResponse)
      return res.render('pages/suppliers/purchases', {
        jsonResponse,
        // successMessage: `Se actualizaron ${response.data.updatedRows} productos exitosamente!`, 
      })

      // return res.end()
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }



  // static async updateProducts(req, res, next) {
  //   const resultsPerPage = 1500
  //   const skipCount = 0
  //   const { supplierId, supplierName } = req.query

  //   // Get auth client
  //   const authClient = await authSheets()

  //   // Instance of google sheets api
  //   const googleSheets = google.sheets({ version: 'v4', auth: authClient})

  //   // Sheetname and range to be updated
  //   const sheetName = supplierName
  //   const range = '!D2:L'

  //   // Set options to send request
  //   let options = {
  //     auth: authClient,
  //     spreadsheetId: Supplier.spreadsheetId,
  //     range: sheetName + range,
  //     resource: {
  //       values: undefined
  //     },
  //     valueInputOption: 'USER_ENTERED',
  //   }

  //   // Get products from Hike API
  //   const sorting = 'name'
  //   const opts = { headers: { accept: 'application/json', Authorization: `Bearer ${req.session.accessToken}` } }
  //   // const searchFilter = 'CS0'
  //   try {
  //     // Call API to get all products
  //     const data = await axios.get(`${Supplier.getAllProductsUrl}?page_size=${resultsPerPage}&Skip_count=${skipCount}&sorting=${sorting}&supplierIds=${supplierId}`, opts)

  //     const products = data.data
  //     // Omit parent product line
  //     const filterProducts = products.items.reduce((names, product) => {
  //       if (!product.has_variants) {
  //         names.push([
  //           product.name,
  //           product.sku, 
  //           product.barcode, 
  //           product.product_type.length > 0 ? product.product_type[0].type_name : 'n/a', 
  //           product.product_suppliers.length > 0 ? product.product_suppliers.map(supp => supp.supplier_name).join(',') : 'n/a',
  //           product.product_outlets.length > 0 ? product.product_outlets[0].tax_name : 'n/a',
  //           product.product_outlets.length > 0 ? product.product_outlets[0].cost_price : 'n/a',
  //           product.product_outlets.length > 0 ? product.product_outlets[0].price_inc_tax : 'n/a',
  //           product.product_outlets.length > 0 ? product.product_outlets[0].price_ex_tax : 'n/a'
  //         ])
  //       }
  //       return names
  //     }, [])

  //     options.resource.values = filterProducts

  //     // Read rows from spreadsheet
  //     const response = await googleSheets.spreadsheets.values.update(options);

  //     return res.render('pages/suppliers/price-list', {
  //       supplierName,
  //       supplierId,
  //       successMessage: `Se actualizaron ${response.data.updatedRows} productos exitosamente!`, 
  //     })
  //   } catch (error) {
  //     console.log(error)
  //     const { response } = error
  //     console.log(response)
  //     if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
  //     return next(error)
  //   }
  // }
}

module.exports = Supplier
