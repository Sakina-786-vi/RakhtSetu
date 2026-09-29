import type { BloodGroup, Urgency } from "./mockData"

export interface DonationHistoryEntry {
  date: string

  hospital: string

  bloodGroup: BloodGroup

  units: number

  status: "Completed"

  demo: true
}

export interface DonorReward {
  name: string

  description: string

  icon: "drop" | "community" | "award"
}

export const demoDonationHistory: DonationHistoryEntry[] = [
  {
    date: "2026-08-12",
    hospital: "KEM Hospital",
    bloodGroup: "B+",
    units: 1,
    status: "Completed",
    demo: true,
  },

  {
    date: "2026-05-03",
    hospital: "Nanavati Hospital",
    bloodGroup: "B+",
    units: 1,
    status: "Completed",
    demo: true,
  },
]

export const donorRewards: DonorReward[] = [
  {
    name: "First Donation",
    description: "For showing up when it mattered.",
    icon: "drop",
  },

  {
    name: "Community Helper",
    description: "For supporting your local donor network.",
    icon: "community",
  },

  {
    name: "Regular Donor",
    description: "For making donation a continuing commitment.",
    icon: "award",
  },
]

export const distanceByArea: Record<string, string> = {
  Andheri: "3.2 km",

  Bandra: "5.4 km",

  Kurla: "7.1 km",

  Borivali: "8.6 km",

  Thane: "10.2 km",

  Dadar: "4.8 km",
}

export const urgencyLabel: Record<Urgency, string> = {
  CRITICAL: "Urgent",
  URGENT: "High",
  NORMAL: "Normal",
}

export const demoDonationActivity = [
  { month: "April", donations: 1 },
  { month: "May", donations: 2 },
  { month: "June", donations: 1 },
  { month: "July", donations: 3 },
  { month: "August", donations: 2 },
  { month: "September", donations: 3 },
]

export const demoImpactMetrics = [
  { label: "Lives supported", value: 12 },
  { label: "People helped", value: 10 },
  { label: "Emergency responses", value: 8 },
  { label: "Community contributions", value: 15 },
]
