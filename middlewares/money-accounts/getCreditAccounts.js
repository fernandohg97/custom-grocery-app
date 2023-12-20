'use strict'
const createError = require('http-errors')
const Sheet = require('../authSheets')
const WORKSHEETS = require('../../config/worksheets')
const { defaultMoneyAccountsTypes } = require('../../config/default-values')

module.exports = {
  // TODO: Obtener solo las cuentas a credito que su Saldo es menor al Limite o que su Diferencia es mayor a cero
  getCreditAccounts: async (req, res, next) => {
    await Sheet.loadInfo()

    const sheet = Sheet.sheetsByTitle[WORKSHEETS.cuentasDeDineroSheet.SHEETNAME]
    const rows = await sheet.getRows()
    const data = rows.map(r => r.toObject())

    res.locals.creditAccounts = data.filter(account => {
      account.Limite = account.Limite.split('$')[1].trim().split(',').join('') === '-' ? 0 : parseFloat(account.Limite.split('$')[1].trim().split(',').join(''))
      account.Saldo = account.Saldo.split('$')[1].trim().split(',').join('') === '-' ? 0 : parseFloat(account.Saldo.split('$')[1].trim().split(',').join(''))

      return (account.Tipo === defaultMoneyAccountsTypes.CREDITO && account.Saldo < account.Limite) ? account : null
    }).map(account => {
      return {
        ...account,
        diferencia: parseFloat(account.Limite - account.Saldo)
      }
    })

    // GUARD STATEMENT
    if (!res.locals.creditAccounts || !res.locals.creditAccounts.length) return next(createError(404, 'No se encontraron cuentas de dinero!'))

    // GET TOTAL BY TYPE
    // res.locals.creditAccountAmounts = res.locals.creditAccounts.reduce((a, b) => {
    //   return {
    //     creditTotalAmount: parseFloat(a.creditTotalAmount + b.Limite),
    //     balanceAmount: parseFloat(a.balanceAmount + b.Saldo),
    //     spentAmount: parseFloat(a.spentAmount + b.diferencia)
    //   }
    // }, {
    //   creditTotalAmount: 0,
    //   balanceAmount: 0,
    //   spentAmount: 0
    // })
    console.log(res.locals.creditAccounts)

    return next()
  }
}
