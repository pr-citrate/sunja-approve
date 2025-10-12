"use client"

import AdminDailyStatusPage from "@/components/status/AdminDailyStatusPage"
import { REQUEST_STATUS } from "@/lib/constants"

export default function AdminApprovedStatusPage() {
  return (
    <AdminDailyStatusPage status={REQUEST_STATUS.APPROVED} emptyMessage="확인된 신청이 없습니다" />
  )
}
