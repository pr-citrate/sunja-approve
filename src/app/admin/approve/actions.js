"use server"

import { revalidatePath } from "next/cache"

import { REQUEST_STATUS } from "@/lib/constants"
import { runXataOperation } from "@/lib/server/xataClient"
import { sendApprovalNotification } from "@/lib/server/userNotifications"

export async function updateRequestStatusAction(requestId, isApproved) {
  const status = isApproved ? REQUEST_STATUS.APPROVED : REQUEST_STATUS.REJECTED

  const updatedRecord = await runXataOperation(
    (client) => client.db.requests.update(requestId, { isApproved, status }),
    { retries: 2 },
  )

  if (!updatedRecord) {
    throw new Error("Request update failed")
  }

  const notification = await sendApprovalNotification(requestId, isApproved)
  revalidatePath("/admin/approve")
  revalidatePath("/admin/status")
  revalidatePath("/admin/statusfalse")
  revalidatePath("/admin/statuspending")
  const recordPlain = structuredClone(updatedRecord)
  const notificationPlain = notification ? structuredClone(notification) : null
  return { record: recordPlain, notification: notificationPlain }
}

export async function deleteRequestAction(requestId) {
  await runXataOperation((client) => client.db.requests.delete(requestId), { retries: 2 })
  revalidatePath("/admin/approve")
  revalidatePath("/admin/status")
  revalidatePath("/admin/statusfalse")
  revalidatePath("/admin/statuspending")
  return { success: true }
}
