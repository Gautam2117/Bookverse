const admin = require('firebase-admin')

// Reads credentials from the JSON file pointed to by the env variable
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
})
