import { useEffect, useMemo, useState } from "react"

import { Check, UserRound } from "lucide-react"

import DashboardLayout, {
  PageHeader,
} from "../../components/layout/DashboardLayout"
import DonorBadgeGallery from "../../components/donor/DonorBadgeGallery"

import { useApp } from "../../context/AppContext"

import {
  useDonorPortal,
  type DonorProfileEdits,
} from "../../context/DonorPortalContext"

import type { BloodGroup } from "../../data/mockData"
import { getDonorBadgeStats } from "../../data/donorBadges"

const bloodGroups: BloodGroup[] = [
  "O+",
  "O-",
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
]

export default function DonorProfile() {
  const { donors, currentUser, roleDetails, requests } = useApp()

  const { profile, updateProfile, responses } = useDonorPortal()

  const donor = donors.find((item) => item.id === currentUser?.id)

  const values: DonorProfileEdits = {
    name: profile.name ?? currentUser?.name ?? "",

    phone: profile.phone ?? String(roleDetails?.phone ?? donor?.phone ?? ""),

    bloodGroup:
      profile.bloodGroup ??
      roleDetails?.blood_group as BloodGroup | undefined ??
      donor?.bloodGroup,

    city: profile.city ?? String(roleDetails?.city ?? donor?.city ?? ""),

    area: profile.area ?? donor?.area ?? "",

    emergencyContact: profile.emergencyContact ?? "",
  }

  const badgeStats = useMemo(
    () =>
      getDonorBadgeStats({
        totalDonations: donor?.donationsCount ?? 0,
        donorId: currentUser?.id ?? "",
        requests,
        responses,
      }),
    [currentUser?.id, donor?.donationsCount, requests, responses],
  )

  const [draft, setDraft] = useState(values)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [saved, setSaved] = useState(false)

  useEffect(
    () => setDraft(values),
    [currentUser?.id, profile, roleDetails, donor],
  )

  const change = (field: keyof DonorProfileEdits, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }))

    setSaved(false)
  }

  const save = (event: React.FormEvent) => {
    event.preventDefault()

    const nextErrors: Record<string, string> = {}

    if (!draft.name?.trim()) nextErrors.name = "Enter your name."

    if (draft.phone && !/^[+\d][\d\s()-]{7,19}$/.test(draft.phone))
      nextErrors.phone = "Enter a valid phone number."

    if (
      draft.emergencyContact &&
      !/^[+\d][\d\s()-]{7,19}$/.test(draft.emergencyContact)
    )
      nextErrors.emergencyContact = "Enter a valid emergency contact number."

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length) return

    updateProfile({
      ...draft,
      name: draft.name?.trim(),
      city: draft.city?.trim(),
      area: draft.area?.trim(),
    })

    setSaved(true)
  }

  const cancel = () => {
    setDraft(values)
    setErrors({})
    setSaved(false)
  }

  return (
    <DashboardLayout>
      <PageHeader
        title="My Profile"
        subtitle="Keep your donor details current for verified coordination."
      />
      <form
        onSubmit={save}
        className="max-w-3xl rounded-2xl border border-[#D8E3EA] bg-white p-5 shadow-[0_2px_8px_rgba(3,26,54,0.035)] md:p-6"
      >
        <div className="mb-6 flex items-center gap-3 border-b border-[#D8E3EA] pb-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF0F5] text-[#062847]">
            <UserRound size={20} />
          </span>
          <div>
            <p className="font-display text-base font-bold text-[#031A36]">
              {draft.name || "Donor"}
            </p>
            <p className="text-xs text-[#617587]">
              Donor profile · Private to your account
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-[#062847]">
            Full name
            <input
              value={draft.name ?? ""}
              onChange={(event) => change("name", event.target.value)}
              autoComplete="name"
              className="mt-1.5 w-full rounded-lg border border-[#D8E3EA] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#E51C3D]"
            />
            {errors.name && (
              <span className="mt-1 block text-[10px] text-[#C91836]">
                {errors.name}
              </span>
            )}
          </label>
          <label className="text-xs font-semibold text-[#062847]">
            Email address
            <input
              value={String(roleDetails?.email ?? "")}
              readOnly
              className="mt-1.5 w-full rounded-lg border border-[#D8E3EA] bg-[#F5F8FA] px-3 py-2.5 text-sm font-normal text-[#617587]"
            />
            <span className="mt-1 block text-[10px] font-normal text-[#617587]">
              Managed through your signed-in account.
            </span>
          </label>
          <label className="text-xs font-semibold text-[#062847]">
            Phone number
            <input
              value={draft.phone ?? ""}
              onChange={(event) => change("phone", event.target.value)}
              autoComplete="tel"
              className="mt-1.5 w-full rounded-lg border border-[#D8E3EA] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#E51C3D]"
            />
            {errors.phone && (
              <span className="mt-1 block text-[10px] text-[#C91836]">
                {errors.phone}
              </span>
            )}
          </label>
          <label className="text-xs font-semibold text-[#062847]">
            Blood group
            <select
              value={draft.bloodGroup ?? ""}
              onChange={(event) => change("bloodGroup", event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#D8E3EA] bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-[#E51C3D]"
            >
              <option value="">Select blood group</option>
              {bloodGroups.map((group) => (
                <option key={group}>{group}</option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-[#062847]">
            City
            <input
              value={draft.city ?? ""}
              onChange={(event) => change("city", event.target.value)}
              autoComplete="address-level2"
              className="mt-1.5 w-full rounded-lg border border-[#D8E3EA] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#E51C3D]"
            />
          </label>
          <label className="text-xs font-semibold text-[#062847]">
            Area / neighbourhood
            <input
              value={draft.area ?? ""}
              onChange={(event) => change("area", event.target.value)}
              autoComplete="address-line2"
              className="mt-1.5 w-full rounded-lg border border-[#D8E3EA] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#E51C3D]"
            />
            <span className="mt-1 block text-[10px] font-normal text-[#617587]">
              Only an approximate area is used for matching.
            </span>
          </label>
          <label className="text-xs font-semibold text-[#062847] sm:col-span-2">
            Emergency contact (optional)
            <input
              value={draft.emergencyContact ?? ""}
              onChange={(event) =>
                change("emergencyContact", event.target.value)
              }
              autoComplete="tel"
              className="mt-1.5 w-full rounded-lg border border-[#D8E3EA] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#E51C3D]"
            />
            {errors.emergencyContact && (
              <span className="mt-1 block text-[10px] text-[#C91836]">
                {errors.emergencyContact}
              </span>
            )}
          </label>
        </div>
        <p className="mt-4 rounded-lg bg-[#F5F8FA] p-3 text-[10px] leading-relaxed text-[#617587]">
          Profile edits are saved in this browser for demo mode. Blood group and
          location changes do not update your registration record on the server.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={cancel}
            className="rounded-lg border border-[#D8E3EA] px-4 py-2.5 text-xs font-semibold text-[#617587] hover:bg-[#F5F8FA]"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#E51C3D] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#C91836]"
          >
            Save changes
          </button>
          {saved && (
            <span
              role="status"
              className="flex items-center gap-1 text-xs font-semibold text-[#16803C]"
            >
              <Check size={14} />
              Saved locally
            </span>
          )}
        </div>
      </form>
      <div className="max-w-5xl">
        <DonorBadgeGallery stats={badgeStats} compact />
      </div>
    </DashboardLayout>
  )
}
