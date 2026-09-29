import { Award } from "lucide-react"

import { motion } from "framer-motion"

import DashboardLayout, {
  PageHeader,
} from "../../components/layout/DashboardLayout"

import DonorBadgeGallery from "../../components/donor/DonorBadgeGallery"

import { useApp } from "../../context/AppContext"
import { useDonorPortal } from "../../context/DonorPortalContext"
import { getDonorBadgeStats } from "../../data/donorBadges"

export default function DonorRewards() {
  const { donors, currentUser, requests } = useApp()
  const { responses: donorResponses } = useDonorPortal()

  const donor = donors.find((item) => item.id === currentUser?.id)

  const count = donor?.donationsCount ?? 0

  const donorStats = getDonorBadgeStats({
    totalDonations: count,
    donorId: currentUser?.id ?? "",
    requests,
    responses: donorResponses,
  })
  const responses = new Set([
    ...donorResponses
      .filter((response) => response.status !== "Cancelled")
      .map((response) => response.requestId),
    ...requests
      .filter((request) => request.confirmedDonor === currentUser?.id)
      .map((request) => request.id),
  ]).size

  const level =
    count >= 10
      ? "Platinum Donor"
      : count >= 5
        ? "Gold Donor"
        : count >= 2
          ? "Silver Donor"
          : "Community Donor"

  const nextTarget = count >= 10 ? 15 : count >= 5 ? 10 : count >= 2 ? 5 : 2

  const nextLevel =
    count >= 10
      ? "Community Champion"
      : count >= 5
        ? "Platinum Donor"
        : count >= 2
          ? "Gold Donor"
          : "Silver Donor"

  const progress = Math.min(Math.round((count / nextTarget) * 100), 100)

  return (
    <DashboardLayout>
      <PageHeader
        title="Rewards & Impact"
        subtitle="Recognising your contribution to a stronger donor community."
      />
      <section className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-2xl bg-[#031A36] p-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">
            Current level
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-[#FF7184]">
              <Award size={25} />
            </span>
            <h2 className="font-display text-2xl font-extrabold">{level}</h2>
          </div>
          <p className="mt-5 text-xs text-white/65">
            {count} / {nextTarget} donations · next reward: {nextLevel}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full bg-[#E51C3D]"
            />
          </div>
          <p className="mt-2 text-right text-[10px] font-bold text-white/70">
            {progress}%
          </p>
          <p className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-relaxed text-white/55">
            Rewards celebrate community participation. They do not indicate
            medical suitability or eligibility.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Recorded donations", count],
            ["Responses sent", responses],
            ["Successful coordination", donorStats.successfulResponses],
            ["Estimated community reach", `${count * 3}*`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-[#D8E3EA] bg-white p-4"
            >
              <p className="font-display text-2xl font-extrabold text-[#031A36]">
                {value}
              </p>
              <p className="mt-1 text-[11px] text-[#617587]">{label}</p>
            </div>
          ))}
          <p className="col-span-2 self-end text-[10px] text-[#617587]">
            *Reach is an illustrative estimate and not a guaranteed patient
            count.
          </p>
        </div>
      </section>
      <DonorBadgeGallery stats={donorStats} />
    </DashboardLayout>
  )
}
