"use client"

import DailyStatusPage from "@/components/status/DailyStatusPage"
import { REQUEST_STATUS } from "@/lib/constants"

export default function RejectedStatusPage() {
  return <DailyStatusPage status={REQUEST_STATUS.REJECTED} emptyMessage="거절된 신청이 없습니다" />
}
