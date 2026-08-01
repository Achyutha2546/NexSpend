import * as admin from "firebase-admin"

export const initFirebase = () => {
  try {
    if (!admin.apps.length) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        })
        console.log("Firebase Admin Initialized from Environment Variable")
      } else {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json"
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const serviceAccount = require(serviceAccountPath)
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        })
        console.log("Firebase Admin Initialized from Service Account File")
      }
    }
  } catch (error) {
    console.warn("Firebase Admin Notice: Could not load service account key. Auth verification falling back to dev mode.")
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null
