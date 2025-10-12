import { PREMIUM_MEMBER_NAMES, REQUEST_STATUS, STUDY_PERIOD_OPTIONS } from "@/lib/constants"

export const isPremiumMember = (name) => PREMIUM_MEMBER_NAMES.includes(name)

export function formatCreatedTime(rawRequest) {
  const createdDate = new Date(rawRequest.xata?.createdAt ?? Date.now())
  return isPremiumMember(rawRequest.applicant?.[0]?.name)
    ? "08:30"
    : `${String(createdDate.getHours()).padStart(2, "0")}:${String(createdDate.getMinutes()).padStart(2, "0")}`
}

export function transformRequest(rawRequest) {
  const timeValue = String(rawRequest.time ?? "")
  return {
    id: rawRequest.id,
    ...rawRequest,
    name: rawRequest.applicant?.[0]?.name ?? "N/A",
    contact: rawRequest.contact ?? "N/A",
    count: `${rawRequest.applicant?.length ?? 0}명`,
    time: `${timeValue}교시`,
    timeValue,
    reason: rawRequest.reason ?? "",
    status: rawRequest.status ?? REQUEST_STATUS.REJECTED,
    isApproved: rawRequest.isApproved ?? false,
    createdTime: formatCreatedTime(rawRequest),
  }
}

export function sortRequestsForReview(requests) {
  return [...requests].sort((a, b) => {
    const aSpecial = isPremiumMember(a.name)
    const bSpecial = isPremiumMember(b.name)
    if (aSpecial && !bSpecial) return -1
    if (bSpecial && !aSpecial) return 1
    return new Date(a.xata?.createdAt ?? 0) - new Date(b.xata?.createdAt ?? 0)
  })
}

export function buildDailyQueryString() {
  const start = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
  const end = new Date(new Date().setHours(23, 59, 59, 999)).toISOString()

  return {
    $all: [{ "xata.createdAt": { $ge: start } }, { "xata.createdAt": { $le: end } }],
  }
}

export function mapRequestsByPeriod(requests) {
  const periods = STUDY_PERIOD_OPTIONS.reduce((acc, option) => {
    acc[option.value] = []
    return acc
  }, {})

  requests.forEach((request) => {
    const key = request.timeValue ?? String(request.time).replace("교시", "")
    if (periods[key]) {
      periods[key].push(request)
    }
  })

  return periods
}

export function findEarlierPendingRequests(currentRequest, allRequests) {
  if (isPremiumMember(currentRequest.name)) {
    return []
  }

  return allRequests.filter((request) => {
    if (request.id === currentRequest.id) return false
    const sameTime =
      (request.timeValue ?? request.time) === (currentRequest.timeValue ?? currentRequest.time)
    if (!sameTime) return false
    if (request.isApproved) return false

    const currentCreatedAt = new Date(currentRequest.xata?.createdAt ?? 0)
    const comparedCreatedAt = new Date(request.xata?.createdAt ?? 0)

    return comparedCreatedAt < currentCreatedAt
  })
}
