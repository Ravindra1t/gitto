import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Gitto // PR Analytics",
  description: "Sophisticated, minimalist pull request and engineering dynamics analytics.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-neutral-400 selection:bg-white/20 selection:text-white">
        {/* Navigation Bar */}
        <header className="border-b border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="text-white text-lg font-black tracking-tight hover:opacity-80 transition-opacity">
                Gitto
              </a>
              <span className="text-[10px] font-mono text-neutral-500 tracking-wider">
                // PR ANALYTICS
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded border border-white/10 bg-neutral-900 text-neutral-400 font-mono">
                v2.0
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neutral-400 hover:text-neutral-50 transition-colors font-mono"
              >
                Docs
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-neutral-400 hover:text-neutral-50 transition-colors font-mono"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-6 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-neutral-500 font-mono">
              &copy; {new Date().getFullYear()} Gitto. All rights reserved.
            </p>
            <div className="flex gap-4 text-[10px] text-neutral-500 font-mono">
              <span>Minimalist Architecture</span>
              <span>•</span>
              <span>Sub-second Interactive Investigator</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
