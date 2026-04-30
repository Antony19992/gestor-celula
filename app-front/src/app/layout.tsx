import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { DrawNotificationProvider } from "@/components/DrawNotificationProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Peixinhos de Cristo",
  description: "Gerenciamento de células",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Peixinhos de Cristo",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Previne flash de tema errado antes da hidratação */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('gc:theme');
            if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            }
          } catch(e) {}
        `}} />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

          {/* ── Header ── */}
          <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
            <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-blue-600"
              >
                <span className="text-xl">✝️</span>
                <span className="text-base leading-tight sm:text-lg">
                  Peixinhos de Cristo
                </span>
              </Link>

              <div className="flex items-center gap-1">
                {/* Nav desktop — oculta em mobile (tem bottom bar) */}
                <nav className="hidden items-center gap-1 sm:flex">
                  <Link href="/" className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">
                    Reuniões
                  </Link>
                  <Link href="/studies" className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">
                    Estudos
                  </Link>
                  <Link href="/members" className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">
                    Membros
                  </Link>
                  <Link href="/hinos" className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">
                    Hinos
                  </Link>
                  <Link href="/biblia" className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white">
                    Bíblia
                  </Link>
                </nav>

                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* ── Conteúdo — pb-20 em mobile para não sobrepor bottom bar ── */}
          <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-6">
            {children}
          </main>

          {/* ── Bottom Navigation (mobile only) ── */}
          <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90 sm:hidden">
            <div className="mx-auto flex max-w-2xl">

              <Link href="/" className="flex flex-1 flex-col items-center gap-0.5 py-3 text-gray-500 transition-colors hover:text-blue-600 active:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-[11px] font-medium">Reuniões</span>
              </Link>

              <Link href="/studies" className="flex flex-1 flex-col items-center gap-0.5 py-3 text-gray-500 transition-colors hover:text-blue-600 active:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-[11px] font-medium">Estudos</span>
              </Link>

              <Link href="/members" className="flex flex-1 flex-col items-center gap-0.5 py-3 text-gray-500 transition-colors hover:text-blue-600 active:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[11px] font-medium">Membros</span>
              </Link>

              <Link href="/hinos" className="flex flex-1 flex-col items-center gap-0.5 py-3 text-gray-500 transition-colors hover:text-blue-600 active:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <span className="text-[11px] font-medium">Hinos</span>
              </Link>

              <Link href="/biblia" className="flex flex-1 flex-col items-center gap-0.5 py-3 text-gray-500 transition-colors hover:text-blue-600 active:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM7 3v18" />
                </svg>
                <span className="text-[11px] font-medium">Bíblia</span>
              </Link>

            </div>
          </nav>

        </div>
        <DrawNotificationProvider />
      </body>
    </html>
  );
}
