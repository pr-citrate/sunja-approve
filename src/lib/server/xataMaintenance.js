import { promises as fs } from "node:fs"
import path from "node:path"

import { REQUEST_STATUS } from "../constants.js"
import { runXataOperation } from "./xataClient.js"

const BACKUP_DIR = path.join(process.cwd(), "backups")
const ALLOWED_STATUSES = new Set(Object.values(REQUEST_STATUS))

export async function backupXataSnapshot() {
  const [requests, legacyPasswordRecords, adminTokens] = await Promise.all([
    runXataOperation((client) => client.db.requests.getAll(), { retries: 2 }),
    runXataOperation(
      (client) => {
        const legacyTable = client.db.password
        if (!legacyTable?.getAll) return []
        return legacyTable.getAll()
      },
      { retries: 2 },
    ).catch(() => []),
    runXataOperation((client) => client.db.admin_tokens.getAll(), { retries: 2 }).catch(() => []),
  ])

  const snapshot = {
    exportedAt: new Date().toISOString(),
    counts: {
      requests: requests.length,
      legacyPasswordRecords: legacyPasswordRecords.length,
      adminTokens: adminTokens.length,
    },
    requests,
    legacyPasswordRecords,
    adminTokens,
  }

  await fs.mkdir(BACKUP_DIR, { recursive: true })
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const filePath = path.join(BACKUP_DIR, `xata-backup-${timestamp}.json`)
  await fs.writeFile(filePath, JSON.stringify(snapshot, null, 2), "utf8")

  return { filePath, snapshot }
}

export async function migrateAdminTokens({ removeLegacy = true } = {}) {
  const [legacyRecords, existingTokens] = await Promise.all([
    runXataOperation(
      (client) => {
        const legacyTable = client.db.password
        if (!legacyTable?.getAll) return []
        return legacyTable.getAll()
      },
      { retries: 2 },
    ).catch(() => []),
    runXataOperation((client) => client.db.admin_tokens.getAll(), { retries: 2 }).catch(() => []),
  ])

  if (!legacyRecords.length) {
    return {
      migrated: 0,
      skipped: 0,
      duplicates: 0,
      removedLegacy: 0,
    }
  }

  const existingTokenSet = new Set(existingTokens.map((item) => item.token).filter(Boolean))
  const seenDuringMigration = new Set()

  const migrationResults = {
    migrated: 0,
    skipped: 0,
    duplicates: 0,
    removedLegacy: 0,
  }

  for (const record of legacyRecords) {
    const token = record.name?.trim()
    if (!token) {
      migrationResults.skipped += 1
      continue
    }

    if (existingTokenSet.has(token) || seenDuringMigration.has(token)) {
      migrationResults.duplicates += 1
      continue
    }

    await runXataOperation(
      (client) =>
        client.db.admin_tokens.create({
          token,
          label: record.value ?? null,
          lastValidatedAt:
            record.xata?.updatedAt ?? record.xata?.createdAt ?? new Date().toISOString(),
        }),
      { retries: 2 },
    )
    seenDuringMigration.add(token)
    migrationResults.migrated += 1
  }

  if (removeLegacy) {
    await Promise.all(
      legacyRecords.map((record) =>
        runXataOperation((client) => client.db.password.delete(record.id), { retries: 2 }),
      ),
    )
    migrationResults.removedLegacy = legacyRecords.length
  }

  return migrationResults
}

function normalizeStatus(value) {
  if (typeof value !== "string") {
    return undefined
  }
  return value.toLowerCase()
}

export async function synchronizeRequestStatuses() {
  const requests = await runXataOperation((client) => client.db.requests.getAll(), { retries: 2 })
  let updated = 0
  const changes = []

  for (const request of requests) {
    const normalizedStatus = normalizeStatus(request.status)
    const isApprovedBoolean = request.isApproved === true
    let desiredStatus = normalizedStatus

    if (!ALLOWED_STATUSES.has(normalizedStatus)) {
      desiredStatus = isApprovedBoolean ? REQUEST_STATUS.APPROVED : REQUEST_STATUS.PENDING
    }

    const updatePayload = {}

    if (desiredStatus !== normalizedStatus) {
      updatePayload.status = desiredStatus
    }

    if (desiredStatus === REQUEST_STATUS.APPROVED && !isApprovedBoolean) {
      updatePayload.isApproved = true
    } else if (desiredStatus !== REQUEST_STATUS.APPROVED && request.isApproved !== false) {
      updatePayload.isApproved = false
    } else if (typeof request.isApproved !== "boolean" && updatePayload.isApproved === undefined) {
      updatePayload.isApproved = isApprovedBoolean
    }

    if (Object.keys(updatePayload).length === 0) {
      continue
    }

    await runXataOperation((client) => client.db.requests.update(request.id, updatePayload), {
      retries: 2,
    })
    updated += 1
    changes.push({ id: request.id, update: updatePayload })
  }

  return {
    total: requests.length,
    updated,
    skipped: requests.length - updated,
    changes,
  }
}
