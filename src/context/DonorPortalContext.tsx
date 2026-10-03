import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { useApp } from "./AppContext"

import type { BloodGroup } from "../data/mockData"
import { supabase } from "../lib/supabase"

export type DonorResponseStatus = "Response Sent" | "Hospital Confirmed" | "Coordination in Progress" | "Completed" | "Cancelled"
export type DonorAvailabilityStatus = "available" | "temporary" | "unavailable"

export interface DonorResponse {
  requestId: string

  status: DonorResponseStatus

  updatedAt: string
}

export interface DonorProfileEdits {
  name?: string

  phone?: string

  bloodGroup?: BloodGroup

  city?: string

  area?: string

  emergencyContact?: string
}

export interface DonorSettings {
  emergencyNotifications: boolean

  nearbyNotifications: boolean

  communityUpdates: boolean

  rewardNotifications: boolean

  showAvailability: boolean

  showApproximateDistance: boolean

  allowVerifiedContact: boolean
}

interface DonorPortalData {
  available: boolean | null

  availabilityStatus: DonorAvailabilityStatus | null

  availabilityUntil: string

  responses: DonorResponse[]

  profile: DonorProfileEdits

  settings: DonorSettings

  readNotifications: string[]

  deletedNotifications: string[]

  earnedBadgeDates: Record<string, string>
}

interface DonorPortalContextValue extends DonorPortalData {
  setAvailability: (
    available: boolean,
    until?: string,
    status?: DonorAvailabilityStatus,
  ) => void

  recordResponse: (requestId: string) => Promise<void>

  updateResponse: (
    requestId: string,
    status: DonorResponseStatus,
  ) => Promise<void>

  updateProfile: (profile: DonorProfileEdits) => void

  updateSettings: (settings: DonorSettings) => void

  markRead: (id: string) => void

  markAllRead: (ids: string[]) => void

  deleteNotification: (id: string) => void

  recordEarnedBadges: (badgeIds: string[]) => string[]
}

const STORAGE_PREFIX = "rakhtsetu:donor-portal:"

const defaultSettings: DonorSettings = {
  emergencyNotifications: true,

  nearbyNotifications: true,

  communityUpdates: true,

  rewardNotifications: true,

  showAvailability: true,

  showApproximateDistance: true,

  allowVerifiedContact: true,
}

const emptyData: DonorPortalData = {
  available: null,

  availabilityStatus: null,

  availabilityUntil: "",

  responses: [],

  profile: {},

  settings: defaultSettings,

  readNotifications: [],

  deletedNotifications: [],

  earnedBadgeDates: {},
}

const DonorPortalContext = createContext<DonorPortalContextValue | null>(null)

export function DonorPortalProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useApp()

  const userId = currentUser?.id ?? "guest"

  const [data, setData] = useState<DonorPortalData>(emptyData)

  const [loadedUserId, setLoadedUserId] = useState<string | null>(null)

  useEffect(() => {
    const storageKey = `${STORAGE_PREFIX}${userId}`

    try {
      const stored = window.localStorage.getItem(storageKey)

      if (stored) {
        const parsed = JSON.parse(stored) as Partial<DonorPortalData>

        setData({
          ...emptyData,

          ...parsed,

          settings: { ...defaultSettings, ...parsed.settings },
        })
      } else {
        setData(emptyData)
      }
    } catch (error) {
      console.warn("Unable to load saved donor portal preferences:", error)

      setData(emptyData)
    }

    setLoadedUserId(userId)
  }, [userId])

  useEffect(() => {
    if (loadedUserId !== userId) return

    try {
      window.localStorage.setItem(
        `${STORAGE_PREFIX}${userId}`,
        JSON.stringify(data),
      )
    } catch (error) {
      console.warn("Unable to save donor portal preferences:", error)
    }
  }, [data, loadedUserId, userId])

  const value = useMemo<DonorPortalContextValue>(
    () => ({
      ...(loadedUserId === userId ? data : emptyData),

      setAvailability: (
        available,
        until = "",
        status = available ? "available" : "unavailable",
      ) =>
        setData((current) => ({
          ...current,
          available,
          availabilityStatus: status,
          availabilityUntil: until,
        })),

      recordResponse: async (requestId) => {
        if (!currentUser?.id)
          throw new Error("Sign in to respond to a blood request.")
        const respondedAt = new Date().toISOString()
        const { error } = await supabase.from("donor_responses").upsert(
          {
            request_id: requestId,
            donor_id: currentUser.id,
            status: "Response Sent",
            responded_at: respondedAt,
            updated_at: respondedAt,
          },
          { onConflict: "request_id,donor_id" },
        )
        if (error) throw error
        setData((current) => ({
          ...current,
          responses: [
            { requestId, status: "Response Sent", updatedAt: respondedAt },
            ...current.responses.filter(
              (response) => response.requestId !== requestId,
            ),
          ],
        }))
      },

      updateResponse: async (requestId, status) => {
        if (!currentUser?.id)
          throw new Error("Sign in to update your response.")
        const updatedAt = new Date().toISOString()
        const previousResponse = data.responses.find(
          (response) => response.requestId === requestId,
        )
        const { data: updatedRows, error } = await supabase
          .from("donor_responses")
          .update({ status, updated_at: updatedAt })
          .eq("request_id", requestId)
          .eq("donor_id", currentUser.id)
          .select("id")
        if (error) throw error
        if (!updatedRows?.length) {
          const { error: insertError } = await supabase
            .from("donor_responses")
            .insert({
              request_id: requestId,
              donor_id: currentUser.id,
              status,
              responded_at: previousResponse?.updatedAt ?? updatedAt,
              updated_at: updatedAt,
            })
          if (insertError) throw insertError
        }
        setData((current) => ({
          ...current,
          responses: current.responses.map((response) =>
            response.requestId === requestId
              ? { ...response, status, updatedAt }
              : response,
          ),
        }))
      },

      updateProfile: (profile) =>
        setData((current) => ({
          ...current,
          profile: { ...current.profile, ...profile },
        })),

      updateSettings: (settings) =>
        setData((current) => ({ ...current, settings })),

      markRead: (id) =>
        setData((current) => ({
          ...current,
          readNotifications: current.readNotifications.includes(id)
            ? current.readNotifications
            : [...current.readNotifications, id],
        })),

      markAllRead: (ids) =>
        setData((current) => ({
          ...current,
          readNotifications: [
            ...new Set([...current.readNotifications, ...ids]),
          ],
        })),

      deleteNotification: (id) =>
        setData((current) => ({
          ...current,
          deletedNotifications: current.deletedNotifications.includes(id)
            ? current.deletedNotifications
            : [...current.deletedNotifications, id],
        })),

      recordEarnedBadges: (badgeIds) => {
        const newlyEarned = badgeIds.filter((id) => !data.earnedBadgeDates[id])

        if (newlyEarned.length) {
          setData((current) => {
            const earnedBadgeDates = { ...current.earnedBadgeDates }

            newlyEarned.forEach((id) => {
              earnedBadgeDates[id] ??= new Date().toISOString()
            })

            return { ...current, earnedBadgeDates }
          })
        }

        return newlyEarned
      },
    }),
    [data, loadedUserId, userId, currentUser?.id],
  )

  return (
    <DonorPortalContext.Provider value={value}>
      {children}
    </DonorPortalContext.Provider>
  )
}

export function useDonorPortal() {
  const context = useContext(DonorPortalContext)

  if (!context)
    throw new Error("useDonorPortal must be used within DonorPortalProvider")

  return context
}
