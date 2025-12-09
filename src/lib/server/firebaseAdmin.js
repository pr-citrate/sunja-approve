import admin from "firebase-admin"

let appInstance = null

export function getFirebaseAdmin() {
  if (appInstance) {
    return appInstance
  }

  // CI 환경이나 빌드 시에는 Firebase 초기화를 건너뛰기
  if (process.env.CI || process.env.NODE_ENV === 'test') {
    console.warn('CI/Test environment detected, skipping Firebase initialization')
    return null
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")

  // 더미 값들을 감지하여 초기화 건너뛰기
  if (projectId === 'dummy-project-id' || !projectId || !clientEmail || !privateKey) {
    console.warn('Firebase credentials not available or dummy values detected, skipping initialization')
    return null
  }

  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error.message)
      return null
    }
  }

  appInstance = admin
  return appInstance
}
