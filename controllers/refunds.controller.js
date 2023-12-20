/* eslint-disable camelcase */
const createError = require('http-errors')
const Sheet = require('../middlewares/authSheets')
const WORKSHEETS = require('../config/worksheets')
// const { defaultPurchaseStatus } = require('../config/default-values')
// const { defaultRefundMethods } = require('../config/default-values')
// const { defaultMoneyAccounts } = require('../config/default-values')

// const { getDaysPassedFromDate } = require('../middlewares/defaultMonthRange')
const RefundModel = require('../models/refund.model')

class Refund {
  /** GET TODAY PAGOS */
  static async getAllRefunds (req, res, next) {
    try {
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.reembolsosSheet.SHEETNAME]
      const reembolsosRows = await sheet.getRows()
      const data = reembolsosRows.map(r => r.toObject())
      // console.log(data[0])
      // console.log(JSON.stringify(data))
      const jsonResponse = JSON.stringify({ refundsData: data })
      // jsonResponse = jsonResponse.replace(/\s+/g," ")
      // console.log(jsonResponse)
      return res.render('pages/refunds/all-refunds', {
        jsonResponse
      })
      // return res.status(200).json({
      //   totalCount: data.length,
      //   data: data
      // })
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      return next(error)
    }
  }

  /**
   * OBTENER UN REEMBOLSO POR ID
   */
  static async getRefundById (req, res, next) {
    const { id } = req.params
    console.log(id)
    try {
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.reembolsosSheet.SHEETNAME]
      const reembolsosRows = await sheet.getRows()
      let reembolsoToFind = reembolsosRows.filter(r => {
        if (r.toObject().ID === id) return r
      })
      if (!reembolsoToFind.length || !reembolsoToFind) return next(createError(404, `Reembolso con ID: ${id} no encontrado!`))

      reembolsoToFind = reembolsoToFind[0].toObject()

      // const jsonResponse = JSON.stringify(reembolsoToFind)
      // // // jsonResponse = jsonResponse.replace(/\s+/g," ")
      // console.log(jsonResponse)
      // return res.render('pages/refunds/edit-refund', {
      //   jsonResponse
      // })
      return res.send(reembolsoToFind)
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
   * OBTENER COMPRA A REEMBOLSAR POR NO. NOTA
   */
  static async getNoteToRefund (req, res, next) {
    const { noteNumber } = req.query
    console.log(noteNumber)
    try {
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const comprasRows = await sheet.getRows()
      let compraToFind = comprasRows.filter(r => {
        if (r.toObject()['No Nota'] === noteNumber) return r
      })
      if (!compraToFind.length || !compraToFind) return next(createError(404, `Compra con No. Nota: ${noteNumber} no encontrado!`))

      compraToFind = compraToFind[0].toObject()

      // console.log(JSON.stringify(data))
      // const jsonResponse = JSON.stringify(compraToFind)
      // // // // jsonResponse = jsonResponse.replace(/\s+/g," ")
      // console.log(jsonResponse)
      // return res.render('pages/refunds/add-refund', {
      //   jsonResponse
      // })
      return res.send(compraToFind)
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      if (error.response) {
        if (error.response.status === 400) return next(createError(400, 'Peticion incorrecta'))
      }
      return next(error)
    }
  }

  /**
   * REALIZAR UN REEMBOLSO DE UN NO. NOTA -----------------------------------
   */
  static async newRefund (req, res, next) {
    console.log(req.body)
    const {
      noteNumber,
      provider,
      refundAmount,
      refundDate,
      refundMethod,
      user,
      reason,
      totalNoteAmount
    } = req.body

    // return res.end()
    try {
      await Sheet.loadInfo()

      const reembolsosSheet = Sheet.sheetsByTitle[WORKSHEETS.reembolsosSheet.SHEETNAME]

      const newRefund = await reembolsosSheet.addRow(RefundModel.newRefundModel(
        noteNumber,
        provider,
        refundAmount,
        refundDate,
        refundMethod,
        user,
        reason
      ))
      console.log(newRefund.toObject()['No Nota'])

      // guard statement
      if (!newRefund) return next(createError(400, 'Ups, no se pudo crear el reembolso'))

      console.log(newRefund)

      // ✅ NUEVO REEMBOLSO CREADO EXITOSAMENTE
      return res.status(201).json({ message: `Reembolso ${newRefund.toObject()['No Nota']} creado exitosamente!` })
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response.data)
      if (response.status === 400) return res.status(400).json({ message: `😕Ups, hubo un error: ${response.data.error.message}` })
      return next(error)
    }
  }

  /**
   * ACTUALIZAR UN REEMBOLSO POR ID -----------------------------------
   */
  static async updateRefund (req, res, next) {
    console.log(req.params)
    const { id } = req.params
    const {
      refundAmount,
      refundDate,
      refundMethod,
      reason
    } = req.body

    // return res.end()
    try {
      await Sheet.loadInfo()

      const reembolsosSheet = Sheet.sheetsByTitle[WORKSHEETS.reembolsosSheet.SHEETNAME]
      const reembolsosRows = await reembolsosSheet.getRows()
      const reembolsoIndex = reembolsosRows.findIndex(r => {
        return Number(r.toObject().ID) === Number(id)
      })

      // GUARD STATEMENT
      if (reembolsoIndex < 0) return next(createError(404, `Reembolso con ID: ${id} no encontrado!`))

      // NO NOTA DEL REEMBOLSO
      const noteNumber = reembolsosRows[reembolsoIndex].get('No Nota')

      // set new values
      reembolsosRows[reembolsoIndex].assign(RefundModel.updateRefundModel(
        refundAmount,
        refundDate,
        refundMethod,
        reason
      ))

      // Save row data
      await reembolsosRows[reembolsoIndex].save()

      // ✅ REEMBOLSO ACTUALIZADO EXITOSAMENTE
      return res.status(201).json({ message: `😉 Reembolso: ${noteNumber} actualizado exitosamente!` })
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response.data)
      if (response.status === 400) return res.status(400).json({ message: `😕Ups, hubo un error: ${response.data.error.message}` })
      return next(error)
    }
  }

  /**
   * ELIMINAR UN REEMBOLSO POR ID -----------------------------------
   */
  static async removeRefund (req, res, next) {
    console.log(req.params)
    const { id } = req.params

    // return res.end()
    try {
      await Sheet.loadInfo()

      const reembolsosSheet = Sheet.sheetsByTitle[WORKSHEETS.reembolsosSheet.SHEETNAME]
      const reembolsosRows = await reembolsosSheet.getRows()
      const reembolsoIndex = reembolsosRows.findIndex(r => {
        return Number(r.toObject().ID) === Number(id)
      })

      // GUARD STATEMENT
      if (reembolsoIndex < 0) return next(createError(404, `Reembolso con ID: ${id} no encontrado!`))

      // NO NOTA DEL REEMBOLSO
      const noteNumber = reembolsosRows[reembolsoIndex].get('No Nota')

      // delete row
      await reembolsosRows[reembolsoIndex].delete()

      // ✅ REEMBOLSO ELIMINADO EXITOSAMENTE
      return res.status(201).json({ message: `😉 Reembolso: ${noteNumber} eliminado exitosamente!` })
    } catch (error) {
      console.log(`Hubo un error: ${error}`)
      const { response } = error
      console.log(response.data)
      if (response.status === 400) return res.status(400).json({ message: `😕Ups, hubo un error: ${response.data.error.message}` })
      return next(error)
    }
  }
}

module.exports = Refund
