import { useState } from "react"

import { CalendarDays, CheckCircle2, Droplet, Heart, X } from "lucide-react"

import DashboardLayout, {
  PageHeader,
} from "../../components/layout/DashboardLayout"

import { demoDonationHistory } from "../../data/donorDashboardData"

import { useApp } from "../../context/AppContext"

import { useDonorPortal } from "../../context/DonorPortalContext"

export default function DonorHistory() {
  const { donors, currentUser, roleDetails } = useApp()

  const { profile } = useDonorPortal()

  const donor = donors.find((item) => item.id === currentUser?.id)

  const total =
    donor?.donationsCount ??
    Number(roleDetails?.donations_count ?? demoDonationHistory.length)

  const lastDonation =
    donor?.lastDonation && donor.lastDonation !== "Not recorded"
      ? donor.lastDonation
      : demoDonationHistory[0]?.date

  const nextEligible = lastDonation
    ? new Date(new Date(lastDonation).getTime() + 90 * 24 * 60 * 60 * 1000)
    : null

  const [details, setDetails] =
    useState<typeof demoDonationHistory[number] | null>(null)

  return (
    <DashboardLayout>
      <PageHeader
        title="Donation History"
        subtitle="A timeline of your recorded contributions."
      />
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total donations", total, Droplet],

          ["Lives supported", `${total * 3}*`, Heart],

          [
            "Last donation",
            lastDonation
              ? new Date(lastDonation).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Not recorded",
            CalendarDays,
          ],

          [
            "Next eligible date",
            nextEligible
              ? nextEligible.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "To be confirmed",
            CheckCircle2,
          ],
        ].map(([label, value, Icon]) => {
          const CardIcon = Icon as typeof Droplet

          return (
            <div
              key={String(label)}
              className="rounded-xl border border-[#D8E3EA] bg-white p-4"
            >
              <CardIcon size={17} className="text-[#E51C3D]" />
              <p className="mt-3 font-display text-lg font-bold text-[#031A36]">
                {value}
              </p>
              <p className="mt-1 text-[11px] text-[#617587]">{label}</p>
            </div>
          )
        })}
      </div>
      <p className="mb-4 rounded-lg bg-[#F5F8FA] px-3 py-2 text-[10px] text-[#617587]">
        The sample entries below are illustrative demo data. Confirm actual
        donation records with your donation center. *Impact is an estimate, not
        a guaranteed patient count.
      </p>
      <div className="rounded-2xl border border-[#D8E3EA] bg-white p-5">
        <div className="relative ml-2 space-y-5 border-l border-[#D8E3EA] pl-6">
          {demoDonationHistory.map((donation) => (
            <article
              key={donation.date}
              className="relative rounded-xl border border-[#D8E3EA] p-4"
            >
              <span className="absolute -left-[33px] top-4 flex h-4 w-4 items-center justify-center rounded-full border-4 border-white bg-[#E51C3D]" />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#E51C3D]">
                    {new Date(donation.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h2 className="mt-1 font-display text-base font-bold text-[#031A36]">
                    {donation.hospital}
                  </h2>
                  <p className="mt-1 text-xs text-[#617587]">
                    {profile.bloodGroup ?? donation.bloodGroup} · Whole Blood ·{" "}
                    {donation.units} unit
                  </p>
                </div>
                <span className="rounded-full bg-[#ECFDF3] px-2.5 py-1 text-[10px] font-bold text-[#16803C]">
                  Completed
                </span>
              </div>
              <button
                onClick={() => setDetails(donation)}
                className="mt-3 rounded-lg border border-[#D8E3EA] px-3 py-2 text-xs font-semibold text-[#062847] hover:bg-[#F5F8FA]"
              >
                View details
              </button>
            </article>
          ))}
        </div>
      </div>
      {details && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-[#031A36]/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDetails(null)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-[#031A36]">
                  Donation record
                </h2>
                <p className="mt-1 text-xs text-[#617587]">
                  Illustrative entry — not verified by the platform.
                </p>
              </div>
              <button
                onClick={() => setDetails(null)}
                aria-label="Close details"
              >
                <X size={17} />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-xs">
              {[
                [
                  "Date",
                  new Date(details.date).toLocaleDateString("en-IN", {
                    dateStyle: "long",
                  }),
                ],
                ["Donation center", details.hospital],
                ["Blood group", details.bloodGroup],
                ["Donation type", "Whole Blood"],
                ["Units", details.units],
                ["Status", details.status],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[#617587]">{label}</span>
                  <b className="text-[#021734]">{value}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
