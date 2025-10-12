"use client"

import RequestForm from "@/components/form/RequestForm"
import { DEFAULT_APPLICANT_OPTIONS } from "@/lib/constants"

export default function Home() {
  return <RequestForm applicantOptions={DEFAULT_APPLICANT_OPTIONS} defaultApplicantCount={2} />
}
