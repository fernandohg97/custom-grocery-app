/* eslint-disable camelcase */
const createError = require('http-errors')
const Sheet = require('../middlewares/authSheets')
const WORKSHEETS = require('../config/worksheets')
// Required package
const pdf = require('pdf-creator-node')
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const pdfOptions = require('../helpers/pdf-options')

// models
const PaymentModel = require('../models/payment.model')

// const { defaultPurchaseStatus, defaultMassiveAgainstReceiptValues } = require('../config/default-values')
const { defaultAgainstReceiptStatus, defaultPurchaseStatus } = require('../config/default-values')

// const { getDaysPassedFromDate } = require('../middlewares/defaultMonthRange')
const AgainstReceiptModel = require('../models/AgainstReceipt.model')
// const PurchaseModel = require('../models/purchase.model')

class AgainstReceipt {
  /** GET ALL CONTRA RECIBOS */
  static async getAllAgainstReceipts (req, res, next) {
    req.app.locals.defaultAgainstReceiptStatus = JSON.stringify(defaultAgainstReceiptStatus)
    try {
      await Sheet.loadInfo()

      const contraRecibosSheet = Sheet.sheetsByTitle[WORKSHEETS.contraRecibosSheet.SHEETNAME]
      const contraRecibosRows = await contraRecibosSheet.getRows()
      const data = contraRecibosRows.map(r => r.toObject())
      // console.log(data[0])
      // console.log(JSON.stringify(data))
      // return res.json(data)
      const jsonResponse = JSON.stringify({ againstReceiptsData: data })
      return res.render('pages/againstReceipts/against-receipts', {
        jsonResponse
      })
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

  /** GET DETAILS OF ONE CONTRARECIBO
   * OBTENER LAS NOTAS VINCULADAS A UN CONTRARECIBO POR FOLIOCR
   *
   * */
  static async getOneAgainstReceiptNotes (req, res, next) {
    const { folio } = req.params
    try {
      await Sheet.loadInfo()

      const detallesContraRecibosSheet = Sheet.sheetsByTitle[WORKSHEETS.detallesContraRecibosSheet.SHEETNAME]
      const detallesContraRecibosRows = await detallesContraRecibosSheet.getRows()
      const data = detallesContraRecibosRows.filter(detalleCR => detalleCR.toObject().Folio.toString() === folio.toString()).map(r => r.toObject())

      // GUARD STATEMENT
      if (!data || !data.length) return next(createError(404, `No se encontraron notas del contrarecibo: ${folio}`))
      // console.log(data[0])
      // console.log(JSON.stringify(data))
      return res.json(data)
      // const jsonResponse = JSON.stringify({ againstReceiptsData: data })
      // return res.render('pages/againstReceipts/against-receipts', {
      //   jsonResponse
      // })
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

  /** GET DETAILS OF ONE CONTRARECIBO
   * OBTENER LAS NOTAS VINCULADAS A UN CONTRARECIBO POR FOLIOCR
   *
   * */
  static async showPDFAgainstReceipt (req, res, next) {
    // initial vars
    const { folio } = req.params
    const htmlInvoicePage = fs.readFileSync(path.join(__dirname, '../libs/plantilla-contrarecibo.html'), 'utf-8')
    let filename

    try {
      await Sheet.loadInfo()

      // CONTRA RECIBO POR FOLIO
      const contraRecibosSheet = Sheet.sheetsByTitle[WORKSHEETS.contraRecibosSheet.SHEETNAME]
      const contraRecibosRows = await contraRecibosSheet.getRows()
      const oneContrareciboData = contraRecibosRows.filter(cr => cr.toObject().Folio === folio).map(r => r.toObject())

      // GUARD STATEMENT
      if (!oneContrareciboData || !oneContrareciboData.length) return next(createError(404, `No se encontro contrarecibo con folio: ${folio}`))
      // console.log(oneContrareciboData)
      const provider = oneContrareciboData[0].Proveedor

      // set nombre del archivo
      filename = `contrarecibo_${provider.toString().toUpperCase()}_${folio}_${moment().format('YYYY-MMM-DD_HH-mm-ss')}.pdf`

      // DETALLES
      const detallesContraRecibosSheet = Sheet.sheetsByTitle[WORKSHEETS.detallesContraRecibosSheet.SHEETNAME]
      const detallesContraRecibosRows = await detallesContraRecibosSheet.getRows()
      const notasCRData = detallesContraRecibosRows.filter(detalleCR => detalleCR.toObject().Folio.toString() === folio.toString()).map(r => r.toObject())

      // GUARD STATEMENT
      if (!notasCRData || !notasCRData.length) return next(createError(404, `No se encontraron notas del contrarecibo: ${folio}`))
      // console.log(JSON.stringify(data))
      // return res.json({ resume: oneContrareciboData[0], notas: notasCRData })
      // const jsonResponse = JSON.stringify({ resume: oneContrareciboData, notas: notasCRData })
      // return res.render('pages/againstReceipts/plantilla-contrarecibo', {
      //   jsonResponse
      // })

      // GENERATE PDF HTML INVOICE
      const pdfInvoice = {
        html: htmlInvoicePage,
        data: {
          resume: oneContrareciboData[0],
          notes: notasCRData
        },
        path: './invoices/' + filename
      }
      // CREATE PDF
      pdf.create(pdfInvoice, pdfOptions)
        .then(res => {
          console.log('archivo pdf')
          console.log(res)
          const filepath = 'http://localhost:3000/invoices/' + filename
          // return next()
        }).catch(error => {
          console.log(error)
        })

      return next()
      // res.render('download', {
      //   path: filepath
      // })
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

  /** GET DETAILS OF ONE CONTRARECIBO
   * OBTENER LAS NOTAS VINCULADAS A UN CONTRARECIBO POR FOLIOCR
   *
   * */
  static async getAgainstReceiptToPay (req, res, next) {
    // initial vars
    const { folio } = req.params

    try {
      await Sheet.loadInfo()

      // CONTRA RECIBO POR FOLIO
      const contraRecibosSheet = Sheet.sheetsByTitle[WORKSHEETS.contraRecibosSheet.SHEETNAME]
      const contraRecibosRows = await contraRecibosSheet.getRows()
      const oneContrareciboData = contraRecibosRows.filter(cr => cr.toObject().Folio === folio).map(r => r.toObject())

      // GUARD STATEMENT
      if (!oneContrareciboData || !oneContrareciboData.length) return next(createError(404, `No se encontro contrarecibo con folio: ${folio}`))
      // console.log(oneContrareciboData)

      // DETALLES
      const detallesContraRecibosSheet = Sheet.sheetsByTitle[WORKSHEETS.detallesContraRecibosSheet.SHEETNAME]
      const detallesContraRecibosRows = await detallesContraRecibosSheet.getRows()
      const notasCRData = detallesContraRecibosRows.filter(detalleCR => detalleCR.toObject().Folio.toString() === folio.toString()).map(r => r.toObject())

      // GUARD STATEMENT
      if (!notasCRData || !notasCRData.length) return next(createError(404, `No se encontraron notas del contrarecibo: ${folio}`))
      // console.log(JSON.stringify(data))
      // return res.json({ resume: oneContrareciboData[0], notas: notasCRData })
      const jsonResponse = JSON.stringify({ resume: oneContrareciboData, notas: notasCRData })
      return res.render('pages/againstReceipts/add-payment', {
        jsonResponse
      })
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

  /**
   * REALIZAR PAGO DE 1 CONTRARECIBO -----------------------------------
   */
  // TODO: In progress:
  // Use Promise all
  static async payOneAgainstReceipt (req, res, next) {
    console.log(req.body)
    let {
      notes,
      // status,
      saldoTotal,
      folioRecibo, // si
      paymentAmount, // si
      paymentDate, // si
      paymentMethod, // si
      retirementAccount, // si
      user, // si
      isMassivePayment,
      isAgainstReceiptPayment
    } = req.body
    notes = JSON.parse(notes)
    console.log(notes)
    // default values
    let newStatusValue
    // const isMassivePayment = false
    // const isAgainstReceiptPayment = true

    try {
      await Sheet.loadInfo()

      const pagosSheet = Sheet.sheetsByTitle[WORKSHEETS.pagosSheet.SHEETNAME]
      const detallesPagosSheet = Sheet.sheetsByTitle[WORKSHEETS.detallesPagosSheet.SHEETNAME]

      const newPayment = await pagosSheet.addRow(PaymentModel.newPaymentModel(
        paymentAmount,
        paymentDate,
        paymentMethod,
        retirementAccount,
        user,
        isMassivePayment,
        isAgainstReceiptPayment
      ))
      const paymentFolio = newPayment.toObject().Folio

      // guard statement
      if (!newPayment) return next(createError(400, 'Ups, no se pudo crear el pago'))

      // agregar detalle de pago
      const newPaymentDetail = await detallesPagosSheet.addRow(PaymentModel.newPaymentDetailModel(
        folioRecibo,
        paymentFolio
      ))

      console.log(newPaymentDetail)
      // GUARD STATEMENT
      if (!newPaymentDetail) return next(createError(400, 'Ups, no se pudo crear el detalle de pago'))

      // CHANGE CONTRA RECIBO STATUS AFTER PAYMENT APPLIED -----------------
      const contrarecibosSheet = Sheet.sheetsByTitle[WORKSHEETS.contraRecibosSheet.SHEETNAME]
      const contrarecibosRows = await contrarecibosSheet.getRows()
      const contrareciboIndex = contrarecibosRows.findIndex(r => {
        return r.toObject().Folio.toString() === folioRecibo.toString()
      })

      console.log(contrareciboIndex)
      // GUARD STATEMENT
      if (contrareciboIndex < 0) return next(createError(404, `Contra recibo con folio: ${contrareciboIndex} no encontrado!`))

      newStatusValue = defaultAgainstReceiptStatus.PAGADA
      // make updates to contra recibo status
      contrarecibosRows[contrareciboIndex].set('Estatus', newStatusValue)
      await contrarecibosRows[contrareciboIndex].save()

      // UPDATE NOTE NUMBER STATUS IN PURCHASE SHEET -----------------------------------------------------------------
      // Change status to all note numbers of PAYMENT APPLIED
      // CHANGE PURCHASE STATUS AFTER PAYMENT APPLIED -----------------
      const comprasSheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const comprasRows = await comprasSheet.getRows()
      const comprasIndexes = []

      // iterate note numbers to update status column -----------------
      for (let i = 0; i < notes.length; i++) {
        const noteNumber = notes[i].NoNota
        // iterate compras rows google sheet
        comprasRows.forEach((curr, index) => {
          if (Number(curr.toObject()['No Nota']) === Number(noteNumber)) {
            comprasIndexes.push(index)
          }
        })
      }
      console.log(comprasIndexes)
      // const purchaseIndex = comprasRows.findIndex(r => {
      //   return Number(r.toObject()['No Nota']) === Number(noteNumber)
      // })

      // console.log(purchaseIndex)
      // GUARD STATEMENT -----------
      if (!comprasIndexes.length) return next(createError(404, 'No se obtuvieron los indices de los No. Nota correctamente!'))

      // make updates to purchase status
      comprasIndexes.forEach(async compraIndex => {
        comprasRows[compraIndex].set('Estatus', defaultPurchaseStatus.LIQUIDADO)
        await comprasRows[compraIndex].save()
      })

      // ✅ EXITO EN ACTUALIZAR COMPRA, PAGO Y DETALLE DE PAGO
      return res.status(201).json({ message: `Folio de pago #${paymentFolio} a contra recibo: #${folioRecibo} creado exitosamente!` })
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response.data)
      if (response.status === 400) return res.status(400).json({ message: `😕Ups, hubo un error: ${response.data.error.message}` })
      return next(error)
    }
  }
}

module.exports = AgainstReceipt
