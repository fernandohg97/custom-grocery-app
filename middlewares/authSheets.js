'use strict'
const { google } = require('googleapis')

module.exports = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
  })
  return await auth.getClient()
}
