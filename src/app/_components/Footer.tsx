import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black py-12 text-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
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
            <p className="text-gray-400">
              Connecting top players to esports scholarships and opportunities.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Platform</h4>
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
            <h4 className="mb-4 font-semibold">Company</h4>
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
            <h4 className="mb-4 font-semibold">Support</h4>
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

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2025 EVAL Gaming. All rights reserved.</p>
          <p className="mt-2 text-sm">
            EVAL Gaming isn&apos;t endorsed by Riot Games and doesn&apos;t
            reflect the views or opinions of Riot Games or anyone officially
            involved in producing or managing Riot Games properties. Riot Games
            and all associated properties are trademarks or registered
            trademarks of Riot Games, Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
