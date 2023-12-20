'use strict'
/* eslint-disable camelcase */
const createError = require('http-errors')
const Sheet = require('../middlewares/authSheets')
const WORKSHEETS = require('../config/worksheets')
const { defaultTransactionTypes, defaultMoneyAccounts, defaultMoneyAccountsTypes } = require('../config/default-values')

class MoneyAccount {
  /** GET ALL COMPRAS */
  static async getAllMoneyAccounts (req, res, next) {
    try {
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.cuentasDeDineroSheet.SHEETNAME]
      const rows = await sheet.getRows()
      const data = rows.map(r => r.toObject())

      const moneyAccounts = data.map(account => {
        const limite = account.Limite.split('$')[1].trim().split(',').join('') === '-' ? 0 : Number(account.Limite.split('$')[1].trim().split(',').join(''))
        const saldo = account.Saldo.split('$')[1].trim().split(',').join('') === '-' ? 0 : Number(account.Saldo.split('$')[1].trim().split(',').join(''))

        return {
          ...account,
          diferencia: parseFloat(limite - saldo)
        }
      })

      // GUARD STATEMENT
      if (!moneyAccounts || !moneyAccounts.length) return next(createError(404, 'No se encontraron cuentas de dinero!'))

      // GET TOTAL BY TYPE
      const creditAccountAmounts = moneyAccounts.filter(account => {
        // const limite = account.Limite.split('$')[1].trim().split(',').join('') === '-' ? 0 : Number(account.Limite.split('$')[1].trim().split(',').join(''))
        // const saldo = account.Saldo.split('$')[1].trim().split(',').join('') === '-' ? 0 : Number(account.Saldo.split('$')[1].trim().split(',').join(''))
        account.Limite = account.Limite.split('$')[1].trim().split(',').join('') === '-' ? 0 : parseFloat(account.Limite.split('$')[1].trim().split(',').join(''))
        account.Saldo = account.Saldo.split('$')[1].trim().split(',').join('') === '-' ? 0 : parseFloat(account.Saldo.split('$')[1].trim().split(',').join(''))
        // return account.Tipo === defaultMoneyAccountsTypes.CREDITO ? account : null
        return account.Tipo === defaultMoneyAccountsTypes.CREDITO ? account : null
      }).reduce((a, b) => {
        return {
          creditTotalAmount: parseFloat(a.creditTotalAmount + b.Limite),
          balanceAmount: parseFloat(a.balanceAmount + b.Saldo),
          spentAmount: parseFloat(a.spentAmount + b.diferencia)
        }
      }, {
        creditTotalAmount: 0,
        balanceAmount: 0,
        spentAmount: 0
      })
      // console.log(data[0])
      // console.log(JSON.stringify(data))
      console.log(creditAccountAmounts)
      // return res.json({
      //   moneyAccounts,
      //   credits: creditAccountAmounts
      // })
      const jsonResponse = JSON.stringify({ moneyAccountsData: moneyAccounts, totalCount: moneyAccounts.length })
      return res.render('pages/moneyAccounts/money-accounts', {
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

  static async getTransactionsByCode (req, res, next) {
    const { code } = req.query
    console.log(code)
    try {
      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.transaccionesSheet.SHEETNAME]
      const transactionRows = await sheet.getRows()
      console.log(transactionRows)
      const data = transactionRows.map(transaction => {
        return transaction.toObject()['Cuenta Origen'] === code || transaction.toObject()['Cuenta Destino'] === code ? transaction.toObject() : null
      })

      console.log(data)
      // console.log(JSON.stringify(data))
      // GUARD STATEMENT
      if (!data || !data.length) return next(createError(404, `No se encontraron transacciones con el codigo: ${code}!`))

      return res.json(data)
      // const jsonResponse = JSON.stringify({ moneyAccountsData: moneyAccounts, totalCount: moneyAccounts.length })
      // return res.render('pages/moneyAccounts/money-accounts', {
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

  static async getPurchasesByCode (req, res, next) {
    const { code } = req.query
    try {
      await Sheet.loadInfo()

      const pagosSheet = Sheet.sheetsByTitle[WORKSHEETS.pagosSheet.SHEETNAME]
      const detallePagosSheet = Sheet.sheetsByTitle[WORKSHEETS.detallesPagosSheet.SHEETNAME]
      const pagosRows = await pagosSheet.getRows()
      const detallePagosRows = await detallePagosSheet.getRows()
      const comprasSheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const comprasRows = await comprasSheet.getRows()
      // console.log(pagosRows)
      const folios = pagosRows.filter(pago => {
        return pago.toObject()['Cuenta de dinero'] === code ? pago.toObject().Folio : null
      })
      console.log('folio')
      console.log(folios)
      // console.log(JSON.stringify(data))
      // GUARD STATEMENT
      if (!folios || !folios.length) return next(createError(404, `No se encontraron transacciones con el codigo: ${code}!`))

      const cuentaConCompras = folios.map((folio) => {
        // const notas = detallePagosRows.filter(detallePago => {
        //   return folio === detallePago.toObject()['No Nota']
        // })

        const [comprasHechas] = detallePagosRows
          .filter((detallePago) => {
            return folio.toObject().Folio === detallePago.toObject()['Folio de pago'] ? detallePago : null
          })
          .map((detallePago) => {
            // console.log(detallePago.toObject())
            return comprasRows.filter(compra => {
              // console.log(compra.toObject())
              return compra.toObject()['No Nota'] === detallePago.toObject()['No Nota'] ? compra.toObject() : null
            }).map(compra => compra.toObject())
          })
        console.log(comprasHechas)
        return {
          folio: folio.toObject().Folio,
          compras: comprasHechas
        }
        // FolioDePago: detallePago.toObject()['Folio de pago'],
        // FechaDePago: detallePago.toObject()['Fecha de pago'],
        // Monto: detallePago.toObject().Monto
      })

      return res.json(cuentaConCompras)
      // const jsonResponse = JSON.stringify({ moneyAccountsData: moneyAccounts, totalCount: moneyAccounts.length })
      // return res.render('pages/moneyAccounts/money-accounts', {
      //   jsonResponse
      // })
    } catch (error) {
      console.log(error)
      const { response } = error
      console.log(response)
      return next(createError(500, 'Peticion incorrecta'))
    }
  }
}

module.exports = MoneyAccount
