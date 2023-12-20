'use strict'

module.exports = {
  newProviderModel: (ID, Proveedor, Vendedor, Telefono, Convenio, Categoria, Factura, MetodoDePago, CuentaDeRetiro, Notas, DiasAPagar, Correo, Descripcion, Banco, Beneficiario, CLABE, NoTarjeta) => {
    return {
      ID: ID,
      Proveedor: Proveedor,
      Vendedor: Vendedor,
      Telefono: Telefono,
      Convenio: Convenio,
      Categoria: Categoria,
      Factura: Factura === 'FACTURA' ? 'TRUE' : 'FALSE',
      'Metodo de pago': MetodoDePago,
      'Cuenta de retiro': CuentaDeRetiro,
      Notas: Notas,
      'Dias a pagar': DiasAPagar,
      Correo: Correo,
      Descripcion: Descripcion,
      Banco: Banco,
      Beneficiario: Beneficiario,
      CLABE: CLABE,
      'No Tarjeta': NoTarjeta,
      Creado: new Date().toJSON().split('T')[0]
    }
  },
  updateProviderModel: (Proveedor, Vendedor, Telefono, Convenio, Categoria, Factura, MetodoDePago, CuentaDeRetiro, Notas, DiasAPagar, Correo, Descripcion, Banco, Beneficiario, CLABE, NoTarjeta) => {
    return {
      Proveedor: Proveedor,
      Vendedor: Vendedor,
      Telefono: Telefono,
      Convenio: Convenio,
      Categoria: Categoria,
      Factura: Factura === 'FACTURA' ? 'TRUE' : 'FALSE',
      'Metodo de pago': MetodoDePago,
      'Cuenta de retiro': CuentaDeRetiro,
      Notas: Notas,
      'Dias a pagar': DiasAPagar,
      Correo: Correo,
      Descripcion: Descripcion,
      Banco: Banco,
      Beneficiario: Beneficiario,
      CLABE: CLABE,
      'No Tarjeta': NoTarjeta
    }
  }
}
