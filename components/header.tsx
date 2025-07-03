"use client"

import { signOut } from "@/actions/auth";
import { useState } from "react"
import type { User } from "@supabase/supabase-js"
// import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Bell,
  Search,
  Menu,
  Settings,
  UserPlus,
  Shield,
  HelpCircle,
  Info,
  FileText,
  Lock,
  Cookie,
  Users,
  AlertTriangle,
  Mail,
  LogOut,
  Heart,
  ArrowLeft,
  MessageCircle,
  Home,
} from "lucide-react"
import Link from "next/link";

// Import all the page components
// import AccountSettings from "./pages/account-settings"
// import NotificationSettings from "./pages/notification-settings"
// import InvitePage from "./pages/invite-page"
// import BlockUnblock from "./pages/block-unblock"
// import HelpFAQs from "./pages/help-faqs"
// import AboutUs from "./pages/about-us"

interface HeaderProps {
  user: User
  notificationCount: number
  onNotificationClick: () => void
  onChatClick: () => void
  onHomeClick: () => void
  onPageClick: (slug: string) => void
  activePage: string
}

export default function Header({
  user,
  notificationCount,
  onNotificationClick,
  onChatClick,
  onHomeClick,
  onPageClick,
  activePage
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleLogout = async () => {
    // await supabase.auth.signOut()
    // Reset the mock user state
    // window.dispatchEvent(new CustomEvent("mock-auth", { detail: null }))
    setIsDrawerOpen(false)
    await signOut();
    
  }

  const handleMenuClick = (page: string) => {
    setCurrentPage(page)
  }

  const handleBack = () => {
    setCurrentPage(null)
  }

  const handleDrawerClose = () => {
    setIsDrawerOpen(false)
    setCurrentPage(null)
  }

  const onHandlePageClick = (slug: string) => {
    onPageClick(slug);
    setIsDrawerOpen(false)
  }

  const menuItems = [
    { icon: Settings, label: "Account Settings", slug: "account-settings", isActive: true },
    { icon: Bell, label: "Notification Settings", slug: "notification-settings", isActive: false },
    { icon: UserPlus, label: "Invite", slug: "invite", isActive: false },
    { icon: Shield, label: "Block/Unblock", slug: "block-unblock", isActive: false },
    { icon: HelpCircle, label: "Help/FAQs", slug: "help-faqs", isActive: false },
    { icon: Info, label: "About Us", slug: "about-us", isActive: false },
    { icon: FileText, label: "Terms & Conditions", slug: "terms", isActive: false },
    { icon: Lock, label: "Privacy & Data Policy", slug: "privacy", isActive: false },
    { icon: Cookie, label: "Cookies Policy", slug: "cookies", isActive: false },
    { icon: Users, label: "Community Guidelines", slug: "community", isActive: false },
    { icon: AlertTriangle, label: "CSAE Policy", slug: "csae", isActive: false },
    { icon: Mail, label: "Contact Us", slug: "contact", isActive: false },

    // { icon: Settings, label: "Account Settings", action: () => handleMenuClick("account-settings") },
    // { icon: Bell, label: "Notification Settings", action: () => handleMenuClick("notification-settings") },
    // { icon: UserPlus, label: "Invite", action: () => handleMenuClick("invite") },
    // { icon: Shield, label: "Block/Unblock", action: () => handleMenuClick("block-unblock") },
    // { icon: HelpCircle, label: "Help/FAQs", action: () => handleMenuClick("help-faqs") },
    // { icon: Info, label: "About Us", action: () => handleMenuClick("about-us") },
    // { icon: FileText, label: "Terms & Conditions", action: () => handleMenuClick("terms") },
    // { icon: Lock, label: "Privacy & Data Policy", action: () => handleMenuClick("privacy") },
    // { icon: Cookie, label: "Cookies Policy", action: () => handleMenuClick("cookies") },
    // { icon: Users, label: "Community Guidelines", action: () => handleMenuClick("community") },
    // { icon: AlertTriangle, label: "CSAE Policy", action: () => handleMenuClick("csae") },
    // { icon: Mail, label: "Contact Us", action: () => handleMenuClick("contact") },
  ]

  // Render page content within drawer
  const renderPageContent = () => {
    const pageProps = {
      user,
      onBack: handleBack,
    }

    switch (currentPage) {
      case "account-settings":
        return 'AccountSettings';  
      // return <AccountSettings {...pageProps} />
      case "notification-settings":
        return 'NotificationSettings';  
      // return <NotificationSettings {...pageProps} />
      case "invite":
        return 'InvitePage';  
      // return <InvitePage {...pageProps} />
      case "block-unblock":
        return 'BlockUnblock';  
      // return <BlockUnblock {...pageProps} />
      case "help-faqs":
        return 'HelpFAQs';  
      // return <HelpFAQs {...pageProps} />
      case "about-us":
        return 'AboutUs';  
      // return <AboutUs {...pageProps} />
      case "terms":
        return (
          <div className="p-4">
            <div className="flex items-center mb-6">
              <Button variant="ghost" onClick={handleBack} className="mr-4">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>
            </div>
            <div className="prose max-w-none text-sm">
              <p className="mb-4">
                <strong>Last updated:</strong> January 2024
              </p>
              <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
              <p className="mb-4">
                By accessing and using Wyra, you accept and agree to be bound by the terms and provision of this
                agreement.
              </p>
              <h3 className="text-lg font-semibold mb-3">2. Use License</h3>
              <p className="mb-4">
                Permission is granted to temporarily download one copy of Wyra for personal, non-commercial transitory
                viewing only.
              </p>
              <h3 className="text-lg font-semibold mb-3">3. User Conduct</h3>
              <p className="mb-4">
                Users must not post content that is harmful, offensive, or violates community guidelines.
              </p>
              <h3 className="text-lg font-semibold mb-3">4. Privacy</h3>
              <p className="mb-4">
                Your privacy is important to us. Please review our Privacy Policy for information on how we collect and
                use data.
              </p>
            </div>
          </div>
        )
      case "privacy":
        return (
          <div className="p-4">
            <div className="flex items-center mb-6">
              <Button variant="ghost" onClick={handleBack} className="mr-4">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
            <div className="prose max-w-none text-sm">
              <p className="mb-4">
                <strong>Last updated:</strong> January 2024
              </p>
              <h3 className="text-lg font-semibold mb-3">Information We Collect</h3>
              <p className="mb-4">
                We collect information you provide directly to us, such as when you create an account, post content, or
                contact us.
              </p>
              <h3 className="text-lg font-semibold mb-3">How We Use Your Information</h3>
              <p className="mb-4">We use the information we collect to provide, maintain, and improve our services.</p>
              <h3 className="text-lg font-semibold mb-3">Information Sharing</h3>
              <p className="mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your
                consent.
              </p>
            </div>
          </div>
        )
      case "cookies":
        return (
          <div className="p-4">
            <div className="flex items-center mb-6">
              <Button variant="ghost" onClick={handleBack} className="mr-4">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Cookies Policy</h1>
            </div>
            <div className="prose max-w-none text-sm">
              <p className="mb-4">This policy explains how we use cookies and similar technologies.</p>
              <h3 className="text-lg font-semibold mb-3">What are Cookies?</h3>
              <p className="mb-4">
                Cookies are small text files stored on your device when you visit our website or use our app.
              </p>
              <h3 className="text-lg font-semibold mb-3">How We Use Cookies</h3>
              <p className="mb-4">
                We use cookies to improve your experience, remember your preferences, and analyze usage patterns.
              </p>
            </div>
          </div>
        )
      case "community":
        return (
          <div className="p-4">
            <div className="flex items-center mb-6">
              <Button variant="ghost" onClick={handleBack} className="mr-4">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Community Guidelines</h1>
            </div>
            <div className="prose max-w-none text-sm">
              <h3 className="text-lg font-semibold mb-3">Be Respectful</h3>
              <p className="mb-4">
                Treat all community members with respect and kindness. No harassment, bullying, or hate speech.
              </p>
              <h3 className="text-lg font-semibold mb-3">Keep it Appropriate</h3>
              <p className="mb-4">
                Share content that's suitable for all ages. No explicit, violent, or inappropriate material.
              </p>
              <h3 className="text-lg font-semibold mb-3">No Spam</h3>
              <p className="mb-4">Don't post repetitive content or spam. Quality over quantity.</p>
            </div>
          </div>
        )
      case "csae":
        return (
          <div className="p-4">
            <div className="flex items-center mb-6">
              <Button variant="ghost" onClick={handleBack} className="mr-4">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Child Safety Policy</h1>
            </div>
            <div className="prose max-w-none text-sm">
              <p className="mb-4">
                We are committed to protecting children and maintaining a safe environment for all users.
              </p>
              <h3 className="text-lg font-semibold mb-3">Age Requirements</h3>
              <p className="mb-4">
                Users must be at least 13 years old to use Wyra. We verify age during registration.
              </p>
              <h3 className="text-lg font-semibold mb-3">Reporting</h3>
              <p className="mb-4">
                If you encounter inappropriate content involving minors, please report it immediately.
              </p>
            </div>
          </div>
        )
      case "contact":
        return (
          <div className="p-4">
            <div className="flex items-center mb-6">
              <Button variant="ghost" onClick={handleBack} className="mr-4">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Contact Us</h1>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">General Support</h3>
                <p className="text-sm text-gray-600">support@wyra.app</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Business Inquiries</h3>
                <p className="text-sm text-gray-600">business@wyra.app</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Press & Media</h3>
                <p className="text-sm text-gray-600">press@wyra.app</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Report Issues</h3>
                <p className="text-sm text-gray-600">report@wyra.app</p>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left - Hamburger Menu */}
          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full p-0 bg-white">
              <ScrollArea className="h-full bg-green">
                {currentPage ? (
                  // Render the selected page
                  <div className="h-full">{renderPageContent()}</div>
                ) : (
                  // Render the main menu
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center p-6 border-b border-gray-200">
                      <Link href="/" onClick={() => onHandlePageClick('null')}>
                        <div className="max-w-md mx-auto flex items-center justify-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="-5 -5 34 34" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart w-8 h-8 text-white"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                          </div>
                          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-montserrat">Wyra</h2>
                        </div>
                      </Link>
                    </div>

                    {/* User Info */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                          <span className="text-lg font-semibold text-gray-600">
                            {user.user_metadata?.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {user?.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 p-4">
                      <ul className="space-y-1">
                        {menuItems.map((item, index) => {
                          const isActive = activePage === item?.slug;
                          return (
                          <li key={index}>
                            <button
                              onClick={() => onHandlePageClick(item?.slug)}
                                className={`w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${
                                isActive
                                  ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg scale-110"
                                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                              }`}
                              >
                              <item.icon className={`w-5 h-5 mr-3 ${
                                isActive ? "text-white": "text-gray-500" }`} />
                              <span className="font-medium">{item.label}</span>
                            </button>
                          </li>

                          )
                        })}
                      </ul>
                    </nav>

                    {/* Logout */}
                    <div className="border-t border-gray-200 p-4">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="font-medium">Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </SheetContent>
          </Sheet>

          {/* Center - Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="max-w-md mx-auto flex items-center justify-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  {/* <Image src="/logo.png" alt="Logo" width={40} height={40} className="mr-2"/> */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="-2 -2 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart w-8 h-8 text-white"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-montserrat">Wyra</h2>
              </div>
            </Link>
          </div>

          {/* Right - Search, Home, Chat, and Notifications */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search users or Wyras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>

            {/* Home */}
            <button
              onClick={onHomeClick}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="sr-only">Home</span>
            </button>

            {/* Chat */}
            <button
              onClick={onChatClick}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="sr-only">Chat</span>
            </button>

            {/* Notifications */}
            <button
              onClick={onNotificationClick}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
