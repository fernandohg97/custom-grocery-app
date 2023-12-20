'use strict'
const { customAlphabet } = require('nanoid')
// AUTOMATIC CUSTOM ID GENERATOR FUNCTIONS
// const folio = customAlphabet('0123456789', 10)
const againstReceiptId = customAlphabet('0123456789', 5)
// const againstReceiptDetailId = customAlphabet('0123456789', 5)
const moment = require('moment')

// MODELS
module.exports = {
  newAgainstReceiptModel: (FolioCR, Proveedor, CantNotas, Total, FechaAPagar, FormaDePago, CuentaDeDinero, Estatus, Autorizado, Usuario, Detalles, ID = againstReceiptId()) => {
    return {
      ID: ID,
      Folio: `CR${FolioCR}`,
      Proveedor: Proveedor,
      CantNotas: CantNotas,
      Total: Total,
      FechaAPagar: FechaAPagar,
      FormaDePago: FormaDePago,
      CuentaDeDinero: CuentaDeDinero,
      // Comprobante: Comprobante,
      Estatus: Estatus,
      Autorizado: Autorizado,
      Usuario: Usuario,
      Detalles: Detalles,
      Creado: moment().format('DD MMM. YYYY h:mm A')
    }
  },
  newAgainstReceiptDetailModel: (FolioCR, NoNota, Proveedor, MontoTotal, FechaRecibido, Detalles) => {
    return {
      Folio: FolioCR,
      NoNota: NoNota,
      Proveedor: Proveedor,
      MontoTotal: MontoTotal,
      FechaRecibido: FechaRecibido,
      Detalles: Detalles
    }
  }
}
