import { useState } from "react"
import { Menu, X } from "lucide-react"

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        
        {/* Logo */}
        <a
          href="#"
          className="text-lg font-bold text-orange-500"
        >
          Smart Paw AI
        </a>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-lg p-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500 md:hidden"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <a
            href="#"
            className="text-sm font-medium text-gray-700 hover:text-orange-500"
          >
            Home
          </a>

          <a
            href="#"
            className="text-sm font-medium text-gray-700 hover:text-orange-500"
          >
            Health Check
          </a>

          <a
            href="#"
            className="text-sm font-medium text-gray-700 hover:text-orange-500"
          >
            Planner
          </a>

          <button
            type="button"
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Login
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-gray-100 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            <a
              href="#"
              className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
            >
              Home
            </a>

            <a
              href="#"
              className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
            >
              Health Check
            </a>

            <a
              href="#"
              className="rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-500"
            >
              Planner
            </a>

            <button
              type="button"
              className="mt-2 w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Login
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar