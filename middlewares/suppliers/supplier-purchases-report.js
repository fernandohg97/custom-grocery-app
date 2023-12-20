'use strict'
const createError = require('http-errors')
const Sheet = require('../authSheets')
const WORKSHEETS = require('../../config/worksheets')

const getSupplierPurchasesReport = {

  /**
   * OBTENER EL MONTO PROMEDIO DE COMPRA
  */
  getAveragePurchaseAmount: async (req, res, next) => {
    const { providerName } = req.query
    try {
      // GUARD STATEMENT
      if (!providerName) return next(createError('404', `Error: El proveedor: ${providerName} no existe`))

      await Sheet.loadInfo()

      const sheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
      const rows = await sheet.getRows()
      res.locals.purchases = rows

      // 👇️ ✅ Get the last day of the current year
      const currentYear = new Date().getFullYear()

      const providerPurchases = rows.filter(r => {
        return (r.toObject().Proveedor === providerName &&
        (new Date(r.toObject()['Fecha Recibido']) > getFirstDayOfYear(currentYear)) &&
        (r.toObject()['Monto Total'].split('$')[1].trim().split(',').join('') > 0 && r.toObject()['Monto Pagado'].split('$')[1].trim().split(',').join('') === '-'))
      }).map(r => r.toObject())

      // GUARD STATEMENT
      if (!providerPurchases.length) return next(createError('404', `Error: No se encontraron notas del proveedor ${providerName}`))

      res.locals.yearPurchasesCount = providerPurchases.length

      const totalPurchaseYearAmount = providerPurchases.map(row => parseFloat(row['Monto Total'].split('$')[1].trim().split(',').join('')))
        .reduce((a, b) => parseFloat(a + b), 0)
      res.locals.totalPurchaseYearAmount = totalPurchaseYearAmount

      res.locals.averagePurchaseAmount = res.locals.totalPurchaseYearAmount / res.locals.yearPurchasesCount
      return next()
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
  // getAccountsToPay: async (req, res, next) => {
  //   const { providerName } = req.query
  //   console.log(`PROVEEDOR: ${providerName}`)
  //   try {
  //     // GUARD STATEMENT
  //     if (!providerName) return next(createError('404', `Error: El proveedor: ${providerName} no existe`))

  //     await Sheet.loadInfo()

  //     // const sheet = Sheet.sheetsByTitle[WORKSHEETS.comprasSheet.SHEETNAME]
  //     // const rows = await sheet.getRows()
  //     // res.locals.purchases = rows
  //     const providerPurchases = res.locals.purchases.filter(r => {
  //       return (r.toObject().Proveedor === providerName)
  //     })
  //     // Get total amount of note number
  //     //  " $ - "
  //     const totalAmount = ' $ 605.00 '.split('$')[1].trim().split(',').join('')
  //     console.log(typeof Number(totalAmount))
  //     //  totalAmount = totalAmount === '-' ? parseFloat('0.00') : parseFloat(totalAmount);
  //     const sortByNoteNumber = (a, b) => a.noteNumber - b.noteNumber

  //     let pendingNotes = res.locals.purchases.filter(r => {
  //       return (r.toObject().Proveedor === providerName && r.toObject().Estado === 'PENDIENTE')
  //     })
  //     console.log(pendingNotes.length)

  //     // GUARD STATEMENT
  //     if (!pendingNotes.length) throw new Error(`No se encontraron notas pendientes del proveedor: ${providerName}`)
  //     // console.log(pendingNotes)
  //     const noteNumbersObject = pendingNotes.map(row => {
  //       return {
  //         recordID: row.toObject().ID,
  //         providerName: row.toObject().Proveedor,
  //         noteNumber: row.toObject()['No Nota'],
  //         dateReceived: new Date(row.toObject()['Fecha Recibido']),
  //         dateToPay: new Date(row.toObject()['Fecha a Pagar']),
  //         totalAmount: parseFloat(row.toObject()['Monto Total'].split('$')[1].trim().split(',').join('')).toFixed(2),
  //         balance: parseFloat(row.toObject()['Monto Total'].split('$')[1].trim().split(',').join('')).toFixed(2),
  //         retirementAccount: row.toObject()['Cuenta de retiro'],
  //         expiresIn: getNumberOfDays(row.toObject()['Fecha a Pagar'])
  //       }
  //     }).sort(sortByNoteNumber)

  //     pendingNotes = pendingNotes.map(r => r.toObject())
  //     // console.log(noteNumbersObject)
  //     const { totalBalance, totalAmountByProvider } = sumTotalBalanceAccountsToPay(providerPurchases, noteNumbersObject, pendingNotes)

  //     res.locals.totalBalance = totalBalance
  //     res.locals.totalDueAmount = totalAmountByProvider
  //     res.locals.noteNumbersObject = noteNumbersObject
  //     res.locals.notesToPayCount = noteNumbersObject.length
  //     return next()
  //     // console.log(JSON.stringify(data))
  //     // const jsonResponse = JSON.stringify({ purchasesProviderData: data })

  //     // return res.status(200).send(data)
  //     // let jsonResponse = JSON.stringify({purchasesProviderData: data})
  //     // // // jsonResponse = jsonResponse.replace(/\s+/g," ")
  //     // // // console.log(jsonResponse)
  //     // return res.render('pages/suppliers/supplier-report', {
  //     //   jsonResponse
  //     // })

  //     // res.locals.totalCountSuppliers = rows.length
  //     // return res.end()
  //   } catch (error) {
  //     console.log(error)
  //     const { response } = error
  //     console.log(response)
  //     if (response.status === 400) return next(createError(400, 'Peticion incorrecta'))
  //     return next(error)
  //   }
  // }
}

// const sumTotalBalanceAccountsToPay = (purchases, noteNumbersObject, pendingNotes) => {
//   // Sum total notes amounts
//   const getTotalAmountByProvider = pendingNotes
//     .map(row => parseFloat(row['Monto Total'].split('$')[1].trim().split(',').join('')))
//     .reduce((a, b) => parseFloat(a + b), 0)

//   // Loop through all data table and compare note number to FILTERED DATA array
//   for (let i = 0; i <= purchases.length - 1; i++) {
//     // Set individual row to current record
//     const currentRecord = purchases[i].toObject()
//     // Loop through note numbers that are 'PENDIENTE'
//     for (let j = 0; j <= pendingNotes.length - 1; j++) {
//       const currentFilterRow = pendingNotes[j]

//       // In case current record note number is equal to settle note number PENDIENTE, set exist to true
//       if (currentRecord['No Nota'].toString() === currentFilterRow['No Nota'].toString()) {
//         const noteNumberIndex = noteNumbersObject.findIndex(row => row.noteNumber === currentRecord['No Nota'].toString())
//         if (currentRecord.Estado.toString().toUpperCase() === 'ABONO') {
//           // console.log(noteNumbersObject[noteNumberIndex])
//           const totalPayed = currentRecord['Monto Pagado'].split('$')[1].trim().split(',').join('') === '-' ? parseFloat('0.00') : parseFloat(currentRecord['Monto Pagado'].split('$')[1].trim().split(',').join(''))
//           parseFloat(noteNumbersObject[noteNumberIndex].balance -= totalPayed)
//         }
//       }
//     }
//   }

//   // Sum total notes balances
//   const getTotalBalance = noteNumbersObject.map(record => parseFloat(record.balance)).reduce((a, b) => parseFloat(a + b), 0)

//   return {
//     totalBalance: getTotalBalance,
//     totalAmountByProvider: getTotalAmountByProvider
//   }
// }

// MIDDLEWARES -------------------------
/**
 * Obtener los dias a vencer de una nota
 * param: note payable date
 */
function getNumberOfDays (notePayableDate) {
  const dateToPay = new Date(notePayableDate)
  const currentDate = new Date()

  // One day in milliseconds
  const oneDay = 1000 * 60 * 60 * 24

  // Calculating the time difference between two dates
  const diffInTime = dateToPay.getTime() - currentDate.getTime()

  // Calculating the no. of days between two dates
  const diffInDays = Math.ceil(diffInTime / oneDay)

  return diffInDays
}

// OBTENER EL PRIMER DIA DEL AñO
function getFirstDayOfYear (year) {
  return new Date(year, 0, 1)
}

// OBTENER EL ULTIMO DIA DEL AñO
function getLastDayOfYear (year) {
  return new Date(year, 11, 31)
}

module.exports = getSupplierPurchasesReport
