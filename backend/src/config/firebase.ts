import * as admin from "firebase-admin"

export const initFirebase = () => {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json"
    
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const serviceAccount = require(serviceAccountPath)

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
      console.log("Firebase Admin Initialized Successfully")
    }
  } catch (error) {
    console.warn("Firebase Admin Notice: Could not load service account key. Auth verification falling back to dev mode.")
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null
