import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"

export default function Navbar() {
  return (
    <nav className="bg-black text-white px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/eval/logos/eLOGO_white.png"
            alt="EVAL Logo"
            width={80}
            height={40}
            className="object-contain"
          />
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link href="/rankings" className="hover:text-cyan-400 transition-colors">
            RANKINGS
          </Link>
          <Link href="/recruiting" className="hover:text-cyan-400 transition-colors">
            RECRUITING
          </Link>
          <Link href="/leagues" className="hover:text-cyan-400 transition-colors">
            LEAGUES
          </Link>
          <Link href="/partnerships" className="hover:text-cyan-400 transition-colors">
            PARTNERSHIPS
          </Link>
          <Link href="/about" className="hover:text-cyan-400 transition-colors">
            ABOUT US
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="PLAYER SEARCH"
              className="bg-gray-800 text-gray-300 rounded-full pl-4 pr-10 py-2 w-48 focus:outline-none focus:ring-1 focus:ring-gray-600"
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" className="bg-red-500 hover:bg-red-600 text-white border-none rounded-full px-6">
                SIGN IN
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
    </nav>
  )
}
