"use client"

import { useState, useEffect } from "react"
import { setUserPassword, getExportData, getUserSecurityStatus } from "@/actions/user"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import * as XLSX from "xlsx"
import { toast } from "sonner"
import { Loader2, Download, Lock, ShieldCheck, FileSpreadsheet, KeyRound } from "lucide-react"
import { Header } from "@/components/header"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [securityStatus, setSecurityStatus] = useState<{ isGoogleUser: boolean, hasPassword: boolean } | null>(null)

  useEffect(() => {
    const fetchSecurityStatus = async () => {
      try {
        const status = await getUserSecurityStatus()
        setSecurityStatus(status)
      } catch (error) {
        console.error("Failed to fetch security status:", error)
      }
    }
    fetchSecurityStatus()
  }, [])

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)
    try {
      await setUserPassword(password)
      toast.success("Password secured successfully")
      setPassword("")
      setConfirmPassword("")
    } catch (error) {
      toast.error("Failed to update security settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await getExportData()
      if (!data || data.length === 0) {
        toast.error("No application data found to export")
        return
      }

      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Job Applications")
      XLSX.writeFile(workbook, "job_tracker_export.xlsx")
      toast.success("Excel file generated and download started")
    } catch (error) {
      toast.error("An error occurred during export")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Account Settings</h1>
            <p className="text-muted-foreground text-lg">
              Manage your preferences and export your tracking data.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left Sidebar Info */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <h3 className="font-semibold text-lg">Data Privacy</h3>
                <p className="text-sm text-balance text-muted-foreground leading-relaxed">
                  Your job hunting data is encrypted and only accessible by you. We never share your application details.
                </p>
              </div>
            </div>

            {/* Main Settings Area */}
            <div className="lg:col-span-8 space-y-8">
              {/* Security Card - Only show for Google users without password */}
              {securityStatus?.isGoogleUser && !securityStatus?.hasPassword && (
                <Card className="border shadow-sm rounded-2xl overflow-hidden ring-1 ring-black/5">
                  <CardHeader className="bg-white dark:bg-muted/50 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <KeyRound className="w-5 h-5 text-blue-500" />
                      </div>
                      <CardTitle className="text-xl">Security & Access</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      Enable password login to access your account without Google.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-8 space-y-6">
                    <form onSubmit={handleSetPassword} className="space-y-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="password">New Password</Label>
                          <Input
                            id="password"
                            type="password"
                            className="h-11 rounded-xl focus-visible:ring-primary"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            className="h-11 rounded-xl focus-visible:ring-primary"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={isLoading} className="h-11 px-8 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-primary/20">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                        Update Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Data Management Card */}
              <Card className="border shadow-sm rounded-2xl overflow-hidden ring-1 ring-black/5">
                <CardHeader className="bg-white dark:bg-muted/50 pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <FileSpreadsheet className="w-5 h-5 text-emerald-500" />
                    </div>
                    <CardTitle className="text-xl">Data Management</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    Own your data. Export all your application history to a spreadsheet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-dashed">
                    <div className="space-y-1">
                      <p className="font-medium">Export all entries</p>
                      <p className="text-sm text-muted-foreground">Detailed report in Excel format</p>
                    </div>
                    <Button variant="outline" onClick={handleExport} disabled={isExporting} className="h-11 rounded-xl bg-background border-2 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300">
                      {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                      Download .xlsx
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
