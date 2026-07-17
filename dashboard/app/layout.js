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
  description: "Sophisticated, high-performance pull request and engineering dynamics analytics.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0c] text-slate-400 selection:bg-indigo-500/30 selection:text-white">
        {/* Diffused mesh background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-[#0a0a0c] to-[#0a0a0c] pointer-events-none z-0" />

        {/* Navigation Bar */}
        <header className="relative z-10 border-b border-white/10 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="text-white text-lg font-black tracking-tight hover:text-indigo-400 transition-colors">
                Gitto
              </a>
              <span className="text-[10px] font-mono text-indigo-400/80 tracking-wider font-semibold">
                // PR ANALYTICS
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-none border border-white/10 bg-[#141415] text-slate-300 font-mono">
                v2.0
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-slate-50 transition-colors font-mono"
              >
                Docs
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-slate-50 transition-colors font-mono"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="relative z-10 flex-grow flex flex-col">
          {children}
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 py-8 bg-[#0a0a0c]">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[10px] text-slate-500 font-mono">
              &copy; {new Date().getFullYear()} Gitto. All rights reserved.
            </p>
            <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
              <span>High-Performance Mesh Canvas</span>
              <span>•</span>
              <span>Sub-second Interactive Investigator</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
