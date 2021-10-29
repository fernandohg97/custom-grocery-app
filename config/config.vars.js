'use strict'
const dotenv = require('dotenv')
dotenv.config()

const isDevelopment = (process.env.NODE_ENV === 'development')
console.log(process.env.NODE_ENV)
if (isDevelopment) {
  module.exports = {
    client_id: process.env.DEV_CLIENT_ID,
    client_secret: process.env.DEV_CLIENT_SECRET,
    redirect_uri: process.env.DEV_REDIRECT_URI
  }
} else {
  module.exports = {
    client_secret: process.env.LOCAL_CLIENT_SECRET,
    client_id: process.env.LOCAL_CLIENT_ID,
    redirect_uri: process.env.LOCAL_REDIRECT_URI
  }
}
