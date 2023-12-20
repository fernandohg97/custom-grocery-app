'use strict'
const { customAlphabet } = require('nanoid')
// AUTOMATIC CUSTOM ID GENERATOR FUNCTIONS
const folio = customAlphabet('0123456789', 10)
const paymentId = customAlphabet('0123456789', 5)
const paymentDetailId = customAlphabet('0123456789', 5)
const moment = require('moment')

// MODELS
module.exports = {
  newPaymentModel: (Monto, FechaDePago = moment().format('DD MMM. YYYY'), FormaDePago, CuentaDeDinero, Usuario, IsMassivePayment = false, IsAgainstReceiptPayment = false, Comprobante = '', ID = paymentId(), Folio = folio()) => {
    return {
      ID: ID,
      Folio: `CP${Folio}`,
      Monto: Monto,
      'Fecha de pago': FechaDePago,
      'Forma de pago': FormaDePago,
      'Cuenta de dinero': CuentaDeDinero,
      Comprobante: Comprobante,
      Usuario: Usuario,
      'Pago masivo': IsMassivePayment,
      'Pago contrarecibo': IsAgainstReceiptPayment,
      Creado: moment().format('DD MMM. YYYY h:mm A')
    }
  },
  newPaymentDetailModel: (FolioNota, FolioDePago, ID = paymentDetailId()) => {
    return {
      ID: ID,
      FolioNota: FolioNota,
      'Folio de pago': FolioDePago
    }
  }
}
