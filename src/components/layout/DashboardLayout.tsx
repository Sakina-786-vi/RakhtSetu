import React from "react"

import { useLocation } from "react-router-dom"

import Sidebar from "./Sidebar"
import { useApp } from "../../context/AppContext"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role } = useApp()
  const location = useLocation()
  const hospitalDashboard =
    role === "hospital" && location.pathname === "/hospital/dashboard"

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F9FC]">
      <Sidebar />
      <main
        className="min-w-0 flex-1 overflow-y-auto"
        style={
          hospitalDashboard
            ? {
                backgroundImage:
                  "linear-gradient(rgba(248,250,252,0.90), rgba(248,250,252,0.90)), url('/sounds/hospital.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
              }
            : undefined
        }
      >
        <div className="min-h-full p-6 pt-14 md:p-8">{children}</div>
      </main>
    </div>
  )
}

export function PageHeader({
  title,

  subtitle,

  actions,
}: {
  title: string

  subtitle?: string

  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
      <div>
        <h1 className="text-2xl font-display font-bold text-[#021734]">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[#021734]/50 mt-1">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-wrap">{actions}</div>
      )}
    </div>
  )
}
