import { getFirebaseAdmin } from "./firebaseAdmin"

export async function checkTokenValidity(token) {
  const admin = getFirebaseAdmin()
  try {
    await admin.messaging().send(
      {
        token,
        notification: {
          title: "Token Validity Test",
          body: "This is a dry run test message.",
        },
      },
      true,
    )
    return { valid: true }
  } catch (error) {
    if (error?.errorInfo?.code === "messaging/registration-token-not-registered") {
      return { valid: false }
    }
    throw error
  }
}

export async function sendNotification({ token, notification, data = {}, webpush }) {
  const admin = getFirebaseAdmin()
  return admin.messaging().send({ token, notification, data, webpush })
}

export async function sendNotifications(tokens, payloadBuilder) {
  const admin = getFirebaseAdmin()

  const results = await Promise.all(
    tokens.map(async ({ token, id }) => {
      try {
        const response = await admin.messaging().send({ token, ...payloadBuilder(token, id) })
        return { token, id, response }
      } catch (error) {
        return { token, id, error }
      }
    }),
  )

  return results
}
