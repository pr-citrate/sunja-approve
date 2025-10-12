import { checkTokenValidity, sendNotification } from "./fcm"
import { runXataOperation } from "./xataClient"

export async function broadcastAdminRequestNotification(record) {
  const adminTokenRecords = await runXataOperation((client) => client.db.admin_tokens.getAll(), {
    retries: 2,
  })

  const tokenMap = new Map()
  for (const adminToken of adminTokenRecords) {
    const token = adminToken.token?.trim()
    if (!token || tokenMap.has(token)) continue
    tokenMap.set(token, adminToken)
  }

  if (tokenMap.size === 0) {
    return { skipped: true, reason: "no-tokens" }
  }

  const tokenEntries = Array.from(tokenMap.entries())

  const validityResults = await Promise.all(
    tokenEntries.map(async ([token, recordMeta]) => {
      try {
        const { valid } = await checkTokenValidity(token)
        return { token, record: recordMeta, valid }
      } catch (error) {
        if (error?.errorInfo?.code === "messaging/registration-token-not-registered") {
          return { token, record: recordMeta, valid: false }
        }
        console.error(`토큰 검사 중 오류 발생 (${token}):`, error)
        return { token, record: recordMeta, valid: false, error }
      }
    }),
  )

  const validTokens = []
  const invalidTokens = []
  for (const result of validityResults) {
    if (result.valid) {
      validTokens.push(result)
    } else {
      invalidTokens.push(result)
    }
  }

  if (invalidTokens.length) {
    await Promise.all(
      invalidTokens.map(({ record }) =>
        runXataOperation((client) => client.db.admin_tokens.delete(record.id), { retries: 2 }),
      ),
    )
  }

  if (validTokens.length === 0) {
    return { skipped: true, reason: "no-valid-tokens", removed: invalidTokens.length }
  }

  const baseNotification = {
    title: "신청 알림",
    body: "신청이 들어왔습니다",
  }

  const notificationResults = await Promise.allSettled(
    validTokens.map(({ token, record: recordMeta }) =>
      (async () => {
        try {
          const response = await sendNotification({
            token,
            notification: baseNotification,
            data: { requestId: record.id },
          })
          await runXataOperation(
            (client) =>
              client.db.admin_tokens.update(recordMeta.id, {
                lastValidatedAt: new Date().toISOString(),
              }),
            { retries: 2 },
          )
          return { token, id: recordMeta.id, response }
        } catch (error) {
          error.meta = { token, id: recordMeta.id }
          throw error
        }
      })(),
    ),
  )

  const failures = []
  for (const result of notificationResults) {
    if (result.status === "fulfilled") continue
    const error = result.reason
    const { token, id } = error?.meta ?? {}
    failures.push({ token, error })
    if (error?.errorInfo?.code === "messaging/registration-token-not-registered" && id) {
      await runXataOperation((client) => client.db.admin_tokens.delete(id), { retries: 2 })
    }
  }

  return {
    skipped: false,
    sent: notificationResults.length - failures.length,
    failures,
    removedInvalid: invalidTokens.length + failures.length,
  }
}
