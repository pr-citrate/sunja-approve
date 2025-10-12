"use client"

import DailyStatusPage from "@/components/status/DailyStatusPage"
import { REQUEST_STATUS } from "@/lib/constants"

export default function ApprovedStatusPage() {
  return <DailyStatusPage status={REQUEST_STATUS.APPROVED} emptyMessage="승인된 신청이 없습니다" />
}
