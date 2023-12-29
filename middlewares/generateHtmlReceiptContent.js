'use strict'

module.exports = {
  generateMailHtmlContent: (providerName, numberOfNotes, totalAmount, dateToPay, notesInfo, details) => {
    const note = notesInfo.map(note => {
      return `
      <li>No. Nota: #${note['No Nota']}</li>
      <li>Monto total: ${note['Monto Total'].replace(/[\$,]/g, '')}</li>
      <li>Fecha de recibido: ${note['Fecha Recibido']}</li>
      <li>Detalles: ${note.Detalles}</li>
      `
    })
    return `
      <h2><strong>👋 Hola ${providerName}</strong></h2>
      <br>
      <p>Envio el contrarecibo con su informacion correspondiente: </p>
      </br>
      <ul>
        <li>Cantidad de notas: ${numberOfNotes}</li>
        <li>Total a pagar:${totalAmount}</li>
        <li>Fecha a pagar:${dateToPay}</li>
      </ul>
      </br>
      <h5>Desglose de notas:</h5>
      </br>
      <ul>
      ${note}
      </ul>
      </br>
      <p>Detalles/Observaciones:</p>
      </br>
      <p>${details}</p>
      </br>
      </br>
     <p>Quedamos a la espera de recibir la factura por este medio para proceder con el pago de este contrarecibo.
      </br>
      Cualquier duda quedamos a sus ordenes.
      </br>
      Saludos y excelente día!🙂
      </p>
    `
  }
}
