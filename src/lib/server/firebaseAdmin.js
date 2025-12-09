import admin from "firebase-admin"

let appInstance = null

export function getFirebaseAdmin() {
  if (appInstance) {
    return appInstance
  }

  // 빌드 시에는 Firebase 초기화를 건너뛰기
  if (process.env.NODE_ENV === 'production' && !process.env.FIREBASE_PROJECT_ID) {
    console.warn('Firebase credentials not found, skipping initialization')
    return null
  }

  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('Firebase credentials incomplete, skipping initialization')
      return null
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  }

  appInstance = admin
  return appInstance
}
