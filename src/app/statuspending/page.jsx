"use client"

import DailyStatusPage from "@/components/status/DailyStatusPage"
import { REQUEST_STATUS } from "@/lib/constants"

export default function PendingStatusPage() {
  return (
    <DailyStatusPage status={REQUEST_STATUS.PENDING} emptyMessage="확인되지 않은 신청이 없습니다" />
  )
}
