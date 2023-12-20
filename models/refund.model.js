'use strict'
const { customAlphabet } = require('nanoid')
const refundId = customAlphabet('0123456789', 10)
const moment = require('moment')
// const noteNumberId = customAlphabet('0123456789', 6)

module.exports = {
  newRefundModel: (NoNota, Proveedor, Monto, Fecha, FormaDePago, Usuario, Motivo) => {
    return {
      ID: refundId(),
      'No Nota': `RE-${NoNota}`,
      Proveedor: Proveedor,
      Monto: Monto,
      Fecha: Fecha,
      'Forma de pago': FormaDePago,
      Usuario: Usuario,
      Motivo: Motivo,
      Creado: moment().format('DD MMM. YYYY h:mm A')
    }
  },
  updateRefundModel: (Monto, Fecha, FormaDePago, Motivo) => {
    return {
      Monto: Monto,
      Fecha: Fecha,
      'Forma de pago': FormaDePago,
      Motivo: Motivo
    }
  }
}
