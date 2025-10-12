"use client"

import AdminDailyStatusPage from "@/components/status/AdminDailyStatusPage"
import { REQUEST_STATUS } from "@/lib/constants"

export default function AdminRejectedStatusPage() {
  return (
    <AdminDailyStatusPage status={REQUEST_STATUS.REJECTED} emptyMessage="거절된 신청이 없습니다" />
  )
}
