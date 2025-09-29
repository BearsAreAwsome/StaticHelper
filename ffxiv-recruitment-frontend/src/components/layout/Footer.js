import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              FFXIV Recruitment
            </h3>
            <p className="text-sm">
              The premier platform for finding and forming static groups in Final Fantasy XIV.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/listings" className="hover:text-primary-400 transition">
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link href="/search/players" className="hover:text-primary-400 transition">
                  Find Players
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary-400 transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Support
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-primary-400 transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Data Centers */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Data Centers
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="text-blue-400">Aether</li>
              <li className="text-purple-400">Crystal</li>
              <li className="text-red-400">Primal</li>
              <li className="text-orange-400">Dynamis</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>
            © {currentYear} FFXIV Recruitment Platform. All rights reserved.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.
            This is a fan-made project and is not affiliated with Square Enix.
          </p>
        </div>
      </div>
    </footer>
  )
}