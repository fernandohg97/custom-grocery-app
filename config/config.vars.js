'use strict'
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({
  path: path.resolve(__dirname, '..', `${process.env.NODE_ENV}.env`)
})

const isDevelopment = (process.env.NODE_ENV === 'development')

if (isDevelopment) {
  console.log('is dev env')
  module.exports = {
    host: process.env.HOST,
    apiUrl: process.env.API_URL,
    port: process.env.PORT,
    secretKey: process.env.SECRET_KEY,
    ssheetId: process.env.PR_SPREADSHEET_ID,
    client_id: process.env.DEV_CLIENT_ID,
    client_secret: process.env.DEV_CLIENT_SECRET,
    redirect_uri: process.env.DEV_REDIRECT_URI
  }
} else {
  console.log('is local env')
  module.exports = {
    host: process.env.HOST,
    apiUrl: process.env.API_URL,
    port: process.env.PORT,
    secretKey: process.env.SECRET_KEY,
    ssheetId: process.env.PR_SPREADSHEET_ID,
    client_secret: process.env.LOCAL_CLIENT_SECRET,
    client_id: process.env.LOCAL_CLIENT_ID,
    redirect_uri: process.env.LOCAL_REDIRECT_URI
  }
}
