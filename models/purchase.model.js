'use strict'
const { customAlphabet } = require('nanoid')
const purchaseId = customAlphabet('0123456789', 10)
// const noteNumberId = customAlphabet('0123456789', 6)

module.exports = {
  newPurchaseModel: (NoNota, Proveedor, MontoTotal, FechaRecibido, FechaAPagar, Estatus, Tipo, Usuario, Detalles) => {
    return {
      ID: purchaseId(),
      'No Nota': NoNota,
      Proveedor: Proveedor,
      'Monto Total': MontoTotal,
      'Fecha Recibido': FechaRecibido,
      'Fecha a Pagar': FechaAPagar,
      Estatus: Estatus,
      Tipo: Tipo,
      Usuario: Usuario,
      Detalles: Detalles,
      Creado: new Date().toJSON().split('T')[0]
    }
  },
  updatePurchaseModel: (MontoTotal, FechaRecibido, FechaAPagar, Tipo, Detalles) => {
    return {
      'Monto Total': MontoTotal,
      'Fecha Recibido': FechaRecibido,
      'Fecha a Pagar': FechaAPagar,
      Tipo: Tipo,
      Detalles: Detalles
    }
  }
}
