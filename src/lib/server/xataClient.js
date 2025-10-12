import { getXataClient } from "../../xata.js"

const JWT_ERROR_PATTERN = /(invalid|expired)\s+jwt/i

function collectMessages(error) {
  const messages = []
  if (!error) {
    return messages
  }

  if (typeof error.message === "string") {
    messages.push(error.message)
  }

  if (Array.isArray(error.errors)) {
    for (const item of error.errors) {
      if (typeof item?.message === "string") {
        messages.push(item.message)
      }
    }
  }

  if (error.cause && typeof error.cause.message === "string") {
    messages.push(error.cause.message)
  }

  return messages
}

function shouldRefreshToken(error) {
  if (!error) {
    return false
  }

  if (error.status === 401) {
    return true
  }

  const messages = collectMessages(error)
  return messages.some((message) => JWT_ERROR_PATTERN.test(message))
}

export async function runXataOperation(operation, { retries = 1 } = {}) {
  let attempt = 0
  let client = getXataClient()
  let lastError

  while (attempt <= retries) {
    try {
      return await operation(client)
    } catch (error) {
      lastError = error
      if (attempt >= retries || !shouldRefreshToken(error)) {
        throw error
      }

      attempt += 1
      client = getXataClient({ forceNew: true })
    }
  }

  throw lastError
}

export function getUnsafeXataClient() {
  return getXataClient()
}
