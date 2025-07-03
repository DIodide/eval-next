import { SignUp } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { Users, Search, School, MessageSquare } from 'lucide-react'

export default function CoachSignUpPage() {
  return (
    <div className="min-h-screen bg-gray-900/90 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-orange-500/10" />
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Animated Background Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-gradient-to-r from-orange-500/15 to-transparent rounded-full blur-lg animate-pulse delay-500"></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding & Info */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Image
                  src="/eval/logos/eLOGO_white.png"
                  alt="EVAL Logo"
                  width={32}
                  height={32}
                  className="brightness-0 invert"
                />
              </div>
              <span className="text-2xl font-orbitron font-black text-white tracking-wider">EVAL</span>
            </Link>
          </div>

          {/* Rainbow Bar */}
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500 rounded-full mb-8"></div>

          {/* Heading */}
          <div className="mb-12">
            <h1 className="text-4xl xl:text-5xl font-orbitron font-black text-white mb-4 leading-tight">
              Create Your
              <span className="block bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500 bg-clip-text text-transparent">
                Coach Account
              </span>
            </h1>
            <p className="text-lg text-gray-300 font-medium leading-relaxed">
              Join the premier esports platform and discover talented players for your competitive gaming programs.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white">Scout Top Talent</h3>
                <p className="text-gray-400 text-sm">Advanced search tools to find players with the skills and potential you need</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white">Manage Tryouts</h3>
                <p className="text-gray-400 text-sm">Organize tryouts and evaluate prospective team members efficiently</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white">Direct Communication</h3>
                <p className="text-gray-400 text-sm">Connect directly with players and build relationships with prospects</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <School className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-orbitron font-bold text-white">School Association</h3>
                <p className="text-gray-400 text-sm">Associate with your institution and represent your esports program</p>
              </div>
            </div>
          </div>

          {/* CTA Link */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-gray-400 text-sm mb-4">Already have an account?</p>
            <Link 
              href="/sign-in" 
              className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-orbitron font-bold transition-colors"
            >
              Sign in to your account →
            </Link>
          </div>
        </div>

        {/* Right Side - Sign Up Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden mb-8 text-center">
              <Link href="/" className="inline-flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Image
                    src="/eval/logos/eLOGO_white.png"
                    alt="EVAL Logo"
                    width={24}
                    height={24}
                    className="brightness-0 invert"
                  />
                </div>
                <span className="text-xl font-orbitron font-black text-white tracking-wider">EVAL</span>
              </Link>
            </div>

            {/* Mobile Title */}
            <div className="lg:hidden mb-8 text-center">
              <h2 className="text-2xl font-orbitron font-black text-white mb-2">
                Create Coach Account
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500 rounded-full mx-auto"></div>
            </div>

            {/* Sign Up Component with Enhanced Styling */}
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-8">
              <SignUp 
                unsafeMetadata={{userType: "school"}}
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none border-none",
                    headerTitle: "text-white font-orbitron font-bold text-xl",
                    headerSubtitle: "text-gray-300",
                    socialButtonsBlockButton: "bg-gray-800/50 border border-white/20 text-white hover:bg-gray-700/50 transition-all duration-300",
                    socialButtonsBlockButtonText: "text-white font-medium",
                    dividerLine: "bg-white/20",
                    dividerText: "text-gray-400 font-medium",
                    formFieldInput: "bg-gray-800/50 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400/20",
                    formFieldLabel: "text-gray-300 font-medium",
                    footerActionLink: "text-cyan-400 hover:text-cyan-300 font-medium",
                    footerActionText: "text-gray-400",
                    formButtonPrimary: "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-orbitron font-bold shadow-lg hover:shadow-cyan-500/25 transition-all duration-300",
                    identityPreviewText: "text-gray-300",
                    identityPreviewEditButton: "text-cyan-400 hover:text-cyan-300"
                  }
                }}
              />
            </div>

            {/* Bottom Links */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                By creating an account, you agree to our{' '}
                <Link href="/tos" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy-policy" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}