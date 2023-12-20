'use strict'

module.exports = {
  defaultConfirmationPassword: {
    deletePassword: 'mdm2020'
  },
  defaultMassivePaymentValues: {
    VERDADERO: 'TRUE',
    FALSO: 'FALSE'
  },
  defaultAgainstReceiptValues: {
    VERDADERO: 'TRUE',
    FALSO: 'FALSE'
  },
  defaultAgainstReceiptStatus: {
    BORRADOR: 'BORRADOR',
    ENVIADO_AL_PROVEEDOR: 'ENVIADO AL PROVEEDOR',
    PROGRAMADA: 'PROGRAMADA',
    PAGADA: 'PAGADA',
    POSPUESTA: 'POSPUESTA',
    EN_CORRECCION: 'EN CORRECCION'
  },
  defaultPurchaseStatus: {
    PENDIENTE_DE_PAGO: 'PENDIENTE DE PAGO',
    PAGO_PARCIAL: 'PAGO PARCIAL',
    LIQUIDADO: 'LIQUIDADO'
  },
  defaultPurchaseTypes: {
    MERCANCIA: 'Mercancia',
    EXTERNA: 'Externa',
    INSUMOS: 'Insumos'
  },
  defaultPaymentMethods: {
    EFECTIVO: 'EFECTIVO',
    TRANSFERENCIA_ELECTRONICA: 'TRANSFERENCIA ELECTRONICA',
    TARJETA_DE_DEBITO: 'TARJETA DE DEBITO',
    TARJETA_DE_CREDITO: 'TARJETA DE CREDITO',
    CHEQUE: 'CHEQUE',
    POR_DEFINIR: 'POR DEFINIR'
  },
  defaultMoneyAccounts: {
    FONDO_FIJO: {
      name: 'FONDO FIJO',
      code: 'CD01'
    },
    CAJA_EXTERNA: {
      name: 'CAJA EXTERNA',
      code: 'CD02'
    },
    BANAMEX_EMPRESA: {
      name: 'BANAMEX EMPRESA',
      code: 'CD03'
    },
    CREDITO_NU: {
      name: 'CREDITO NU',
      code: 'CD04'
    },
    CREDITO_COSTCO: {
      name: 'CREDITO COSTCO',
      code: 'CD05'
    },
    CREDITO_ORO: {
      name: 'CREDITO ORO',
      code: 'CD06'
    },
    CREDITO_AMEX: {
      name: 'CREDITO AMEX',
      code: 'CD07'
    },
    KUESKI: {
      name: 'KUESKI',
      code: 'CD08'
    },
    OTRO: {
      name: 'OTRO',
      code: 'CD09'
    },
    POR_DEFINIR: {
      name: 'POR DEFINIR',
      code: 'CD10'
    }
  },
  defaultMoneyAccountsTypes: {
    DEBITO: 'DEBITO',
    CREDITO: 'CREDITO'
  },
  defaultTransactionTypes: {
    RETIRO: 'RETIRO',
    DEPOSITO: 'DEPOSITO',
    TRANSFERENCIA: 'TRANSFERENCIA'
  },
  defaultProviderAgreements: {
    CONSIGNACION: 'CONSIGNACION',
    CREDITO: 'CREDITO',
    CONTADO: 'CONTADO'
  },
  defaultRefundReasons: {
    MOTIVO01: 'Producto recibido no coincide con el solicitado.',
    MOTIVO02: 'El producto resultó dañado o se encuentra en mal estado para venta.',
    MOTIVO03: 'Un cliente lo devolvió.',
    MOTIVO04: 'El proveedor no proporcionó el servicio y/o asistencia prometida.'
  },
  defaultProviderInvoice: {
    FACTURA: 'TRUE',
    NO_FACTURA: 'FALSE'
  },
  defaultCategories: [
    'Abarrotes🥫',
    'Frutas y Verduras🍎',
    'Bebidas🥤',
    'Limpieza y Hogar🧹',
    'Lacteos🥛',
    'Carniceria y Salchichoneria🥩',
    'Botanas Postres y Snacks🍟',
    'Panaderia y Tortilleria🍞',
    'Granos y Semillas🌾',
    'Mascotas🐶',
    'Dulceria🍬',
    'Cuidado Personal🧼',
    'Cigarros🚬',
    'Alimentos y Comida🥪',
    'Farmacia💊',
    'Insumos🛍',
    'Varios🎈',
    'Congelados🧊',
    'Plantas🌱',
    'Sin asignar'
  ],
  METRIC_GOALS: {
    minimumBalance: 3500
  }
}
