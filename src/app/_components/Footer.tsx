import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Image
                src="/eval/logos/eLOGO_white.png"
                alt="EVAL Logo"
                width={100}
                height={50}
                className="object-contain"
              />
            </div>
            <p className="text-gray-400">Connecting top players to esports scholarships and opportunities.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/rankings/combines" className="hover:text-white">
                  Rankings
                </Link>
              </li>
              <li>
                <Link href="/recruiting" className="hover:text-white">
                  Recruiting
                </Link>
              </li>
              <li>
                <Link href="/rankings/leagues" className="hover:text-white">
                  Leagues
                </Link>
              </li>
              <li>
                <Link href="/tryouts/combines" className="hover:text-white">
                  Combines
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/about/team" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/about/partners" className="hover:text-white">
                  Partnerships
                </Link>
              </li>
              <li>
                <Link href="/about/contact" className="hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/privacy-policy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/tos" className="hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-white">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 EVAL Gaming. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
