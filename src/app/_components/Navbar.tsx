import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronDown, Search } from "lucide-react"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
          <DropdownMenu>
            <DropdownMenuTrigger className="font-orbitron hover:text-cyan-400 transition-colors tracking-wide flex items-center cursor-context-menu">
              TRYOUTS <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-700">
              <Link href="/tryouts/combines">
                <DropdownMenuItem className="font-orbitron text-white hover:bg-gray-800 focus:bg-gray-800 focus:text-white cursor-pointer">
                  EVAL COMBINES
                </DropdownMenuItem>
              </Link>
              <Link href="/tryouts/college">
                <DropdownMenuItem className="font-orbitron text-white hover:bg-gray-800 focus:bg-gray-800 focus:text-white cursor-pointer">
                  COLLEGE
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/recruiting" className="hover:text-cyan-400 transition-colors">
            RECRUITING
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="font-orbitron hover:text-cyan-400 transition-colors tracking-wide flex items-center cursor-context-menu">
              RANKINGS <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-700">
              <Link href="/rankings/leagues">
                <DropdownMenuItem className="font-orbitron text-white hover:bg-gray-800 focus:bg-gray-800 focus:text-white cursor-pointer">
                  LEAGUES
                </DropdownMenuItem>
              </Link>
              <Link href="/rankings/combines">
                <DropdownMenuItem className="font-orbitron text-white hover:bg-gray-800 focus:bg-gray-800 focus:text-white cursor-pointer">
                  COMBINES
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/pricing" className="hover:text-cyan-400 transition-colors">
            PRICING
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="font-orbitron hover:text-cyan-400 transition-colors tracking-wide flex items-center cursor-context-menu">
              ABOUT US <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-gray-700">
              <Link href="/about/partners">
                <DropdownMenuItem className="font-orbitron text-white data-[highlighted]:bg-gray-800 data-[highlighted]:text-white focus:bg-gray-800 focus:text-white cursor-pointer">
                  OUR PARTNERS
                </DropdownMenuItem>
              </Link>
              <Link href="/about/team">
                <DropdownMenuItem className="font-orbitron text-white data-[highlighted]:bg-gray-800 data-[highlighted]:text-white focus:bg-gray-800 focus:text-white cursor-pointer">
                  OUR TEAM
                </DropdownMenuItem>
              </Link>
              <Link href="/about/contact">
                <DropdownMenuItem className="font-orbitron text-white data-[highlighted]:bg-gray-800 data-[highlighted]:text-white focus:bg-gray-800 focus:text-white cursor-pointer">
                  CONTACT
                </DropdownMenuItem>
              </Link>
              <Link href="/about/faq">
                <DropdownMenuItem className="font-orbitron text-white data-[highlighted]:bg-gray-800 data-[highlighted]:text-white focus:bg-gray-800 focus:text-white cursor-pointer">
                  FAQs
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>
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
