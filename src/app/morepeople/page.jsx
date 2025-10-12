"use client"

import RequestForm from "@/components/form/RequestForm"
import { EXTENDED_APPLICANT_OPTIONS } from "@/lib/constants"

export default function MorePeoplePage() {
  return (
    <RequestForm
      applicantOptions={EXTENDED_APPLICANT_OPTIONS}
      defaultApplicantCount={2}
      showAdminLink={false}
    />
  )
}
