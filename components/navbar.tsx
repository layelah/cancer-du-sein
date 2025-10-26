"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Heart, BarChart3, FileText, Database } from "lucide-react"

export function Navbar() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Statistiques", icon: BarChart3 },
    { href: "/form", label: "Formulaire", icon: FileText },
    { href: "/records", label: "Enregistrements", icon: Database },
  ]

  return (
    <nav className="glass-effect sticky top-0 z-50 border-b border-primary/20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link 
            href="/" 
            className="flex items-center gap-2 sm:gap-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <Image 
                src="/images/ruban-rose.png" 
                alt="Ruban Rose Cancer du Sein" 
                width={32} 
                height={32} 
                className="w-8 h-8 sm:w-10 sm:h-10 floating-animation"
              />
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-primary rounded-full pulse-glow"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-lg lg:text-xl font-bold gradient-primary bg-clip-text text-transparent">
                <span className="hidden sm:inline">Dépistage Cancer du Sein</span>
                <span className="sm:hidden">Dépistage</span>
              </span>
              <span className="text-xs text-muted-foreground -mt-1 hidden sm:block">
                Octobre Rose 2025
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex items-center gap-1 sm:gap-2 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 ${
                    isActive
                      ? "gradient-primary text-primary-foreground shadow-medium scale-105"
                      : "text-muted-foreground hover:text-primary hover:bg-accent/50 hover:scale-105"
                  }`}
                >
                  <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-medium text-xs sm:text-sm hidden sm:inline">{link.label}</span>
                  
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 sm:w-8 h-1 bg-primary-foreground rounded-full"></div>
                  )}
                </Link>
              )
            })}
            
            <div className="ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-primary/20 hidden lg:block">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="w-4 h-4 text-primary" />
                <span>Ensemble contre le cancer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
