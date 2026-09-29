import { useEffect, useMemo, useRef, useState } from "react"

import { AnimatePresence, motion } from "framer-motion"

import { ArrowRight, Check, LockKeyhole, X } from "lucide-react"

import { Link } from "react-router-dom"

import { useDonorPortal } from "../../context/DonorPortalContext"

import {
  getEarnedBadges,
  type DonorBadge,
  type DonorBadgeStats,
} from "../../data/donorBadges"

function formatDate(value?: string) {
  if (!value) return "Date not available"

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",

    month: "short",

    year: "numeric",
  })
}

export default function DonorBadgeGallery({
  stats,

  compact = false,
}: {
  stats: DonorBadgeStats

  compact?: boolean
}) {
  const { earnedBadgeDates, recordEarnedBadges } = useDonorPortal()

  const [selectedBadge, setSelectedBadge] = useState<DonorBadge | null>(null)

  const [newlyEarnedIds, setNewlyEarnedIds] = useState<string[]>([])

  const [toast, setToast] = useState("")

  const toastTimer = useRef<number | undefined>(undefined)

  const badges = useMemo(
    () => getEarnedBadges(stats, earnedBadgeDates),

    [stats, earnedBadgeDates],
  )

  const earnedBadges = badges.filter((badge) => badge.earned)

  const earnedIdsKey = earnedBadges.map((badge) => badge.id).join(",")

  useEffect(() => {
    if (!earnedIdsKey) return

    const newIds = recordEarnedBadges(earnedIdsKey.split(","))

    if (!newIds.length) return

    setNewlyEarnedIds((current) => [...new Set([...current, ...newIds])])

    const names = newIds

      .map((id) => badges.find((badge) => badge.id === id)?.name)

      .filter(Boolean)

    setToast(
      names.length === 1
        ? `New badge unlocked: ${names[0]}`
        : `${names.length} new badges unlocked`,
    )

    window.clearTimeout(toastTimer.current)

    toastTimer.current = window.setTimeout(() => setToast(""), 4000)
  }, [earnedIdsKey, recordEarnedBadges])

  useEffect(
    () => () => window.clearTimeout(toastTimer.current),

    [],
  )

  const visibleBadges = compact ? earnedBadges.slice(0, 6) : badges

  const earnedCount = earnedBadges.length

  return (
    <section className={compact ? "mt-6" : "mt-7"}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#E51C3D]">
            {compact ? "Badges" : "Achievements"}
          </p>
          {compact ? (
            <h2 className="mt-1 font-display text-lg font-bold text-[#021734]">
              Donor badges
            </h2>
          ) : (
            <p className="mt-1 text-xs text-[#617587]">
              Earned badges · {earnedCount} / {badges.length}
            </p>
          )}
        </div>
        {compact && (
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#FFF1F3] px-3 py-1 text-[11px] font-bold text-[#C91836]">
              {earnedCount} / {badges.length} earned
            </span>
            <Link
              to="/donor/rewards"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#E51C3D] hover:underline"
            >
              View all badges <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>

      {compact && !earnedBadges.length ? (
        <div className="mt-3 rounded-xl border border-dashed border-[#D8E3EA] bg-[#F7F9FC] px-4 py-5 text-center text-xs text-[#617587]">
          Your achievements will appear here as you reach donor milestones.
        </div>
      ) : (
        <div
          className={`mt-4 grid gap-3 ${
            compact
              ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
          }`}
        >
          {visibleBadges.map((badge, index) => {
            const unlockedNow = newlyEarnedIds.includes(badge.id)

            return (
              <motion.button
                key={badge.id}
                type="button"
                initial={unlockedNow ? { scale: 0.92, opacity: 0 } : false}
                animate={{
                  scale: 1,

                  opacity: 1,

                  boxShadow: unlockedNow
                    ? "0 0 0 3px rgba(229,28,61,0.12)"
                    : "0 3px 12px rgba(3,26,54,0.035)",
                }}
                transition={{
                  duration: 0.28,
                  delay: unlockedNow ? 0.04 * index : 0,
                }}
                onClick={() => setSelectedBadge(badge)}
                className={`relative flex min-h-40 flex-col items-center rounded-2xl border p-4 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E51C3D] ${
                  badge.earned
                    ? "border-[#F4C8CF] bg-white hover:border-[#E51C3D]"
                    : "border-dashed border-[#D8E3EA] bg-[#F7F9FC] hover:border-[#B7C4CE]"
                }`}
              >
                {badge.earned ? (
                  <span className="text-3xl" aria-hidden="true">
                    {badge.icon}
                  </span>
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EEF2] text-[#8293A0]">
                    <LockKeyhole size={17} />
                  </span>
                )}
                {unlockedNow && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#16A34A] text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
                <span
                  className={`mt-2 text-[11px] font-extrabold tracking-wide ${
                    badge.earned ? "text-[#031A36]" : "text-[#8293A0]"
                  }`}
                >
                  {badge.name}
                </span>
                <span className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-[#617587]">
                  {badge.earned ? badge.description : badge.requirement}
                </span>
                <span
                  className={`mt-auto pt-3 text-[10px] font-bold ${
                    badge.earned ? "text-[#16803C]" : "text-[#8293A0]"
                  }`}
                >
                  {badge.earned
                    ? `✓ Earned${
                        badge.earnedAt ? ` · ${formatDate(badge.earnedAt)}` : ""
                      }`
                    : `${badge.progress} / ${badge.target}`}
                </span>
              </motion.button>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-5 right-5 z-[90] max-w-[calc(100vw-2.5rem)] rounded-xl bg-[#031A36] px-4 py-3 text-xs font-bold text-white shadow-lg"
          >
            🏆 {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedBadge && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#031A36]/45 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedBadge(null)
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="badge-dialog-title"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              className="w-full max-w-sm rounded-2xl border border-[#D8E3EA] bg-white p-5 shadow-xl"
            >
              <div className="flex items-start justify-between">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${
                    selectedBadge.earned
                      ? "bg-[#FFF1F3]"
                      : "bg-[#E8EEF2] grayscale"
                  }`}
                >
                  {selectedBadge.earned ? (
                    selectedBadge.icon
                  ) : (
                    <LockKeyhole size={19} className="text-[#8293A0]" />
                  )}
                </span>
                <button
                  type="button"
                  aria-label="Close badge details"
                  onClick={() => setSelectedBadge(null)}
                  className="rounded-lg p-1.5 text-[#617587] hover:bg-[#F5F8FA]"
                >
                  <X size={17} />
                </button>
              </div>
              <h2
                id="badge-dialog-title"
                className="mt-4 font-display text-lg font-extrabold text-[#031A36]"
              >
                {selectedBadge.name}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-[#617587]">
                {selectedBadge.earned
                  ? selectedBadge.description
                  : selectedBadge.requirement}
              </p>
              {selectedBadge.earned ? (
                <div className="mt-4 rounded-xl bg-[#ECFDF3] p-3">
                  <p className="text-xs font-bold text-[#16803C]">
                    ✓ Achievement unlocked
                  </p>
                  <p className="mt-1 text-[11px] text-[#617587]">
                    Earned: {formatDate(selectedBadge.earnedAt)}
                  </p>
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-[#F5F8FA] p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#062847]">
                      Progress
                    </span>
                    <span className="font-bold text-[#062847]">
                      {selectedBadge.progress} / {selectedBadge.target}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#D8E3EA]">
                    <div
                      className="h-full rounded-full bg-[#E51C3D] transition-[width]"
                      style={{
                        width: `${Math.min(
                          (selectedBadge.progress / selectedBadge.target) * 100,

                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
