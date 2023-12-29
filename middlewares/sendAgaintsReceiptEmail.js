'use strict'
const dotenv = require('dotenv')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const nodemailer = require('nodemailer')
dotenv.config()
// const path = require('path')

// dotenv.config({
//   path: path.resolve(__dirname, '..', `${process.env.NODE_ENV}.env`)
// })
// const EnvVars = require('../config/config.vars')

const oauth2Client = new OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
)
// console.log(process.env.GMAIL_REFRESH_TOKEN)
// console.log(process.env.GMAIL_CLIENT_ID)

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN
})

// async..await is not allowed in global scope, must use a wrapper
async function sendMailAgainstReceipt (subject, htmlContent, plainContent, providerEmail) {
  try {
    const accessToken = await oauth2Client.getAccessToken()
    // console.log(accessToken)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      // host: 'smtp.gmail.com',
      // port: 465,
      // secure: true,
      auth: {
        type: 'OAuth2',
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        accessToken: accessToken,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,

        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
        user: process.env.GMAIL_USER || 'fernando.hernandez@mercadodosmil.com',
        pass: process.env.GMAIL_PASSWORD || 'Qarrusel1!'
      }
    })

    const mailOptions = {
      from: process.env.GMAIL_USER || 'fernando.hernandez@mercadodosmil.com', // sender address
      to: providerEmail, // list of receivers
      subject: subject, // Subject line
      text: plainContent, // plain text body
      html: htmlContent // html body
    }

    // send mail with defined transport object
    const result = await transporter.sendMail(mailOptions)
    console.log('Message sent: %s', result.messageId)

    return result
  } catch (error) {
    console.log(error)
  }

  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  //
  // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
  //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
  //       <https://github.com/forwardemail/preview-email>
  //
}

// main()
//   .then(res => console.log('CORREO ENVIADO', res))
//   .catch(err => console.log('ERROR EN ENVIAR CORRE', err.message))

module.exports = sendMailAgainstReceipt
