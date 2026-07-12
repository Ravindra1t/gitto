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
  title: "PR Analyzer // Engine",
  description: "High-performance GitHub PR dynamics and reviewer feedback analysis.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground selection:bg-zinc-800 selection:text-zinc-100">
        {/* Navigation Bar */}
        <header className="border-b border-border bg-zinc-950/40 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/" className="font-mono text-sm tracking-wider font-bold hover:text-zinc-300 transition-colors">
                PR_ANALYZER //
              </a>
              <span className="text-xs px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400 font-mono">
                v2.0
              </span>
            </div>
            <nav className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors font-mono"
              >
                Docs
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 hover:text-zinc-100 transition-colors font-mono"
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
        <footer className="border-t border-border py-6 bg-zinc-950/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-zinc-500 font-mono">
              &copy; {new Date().getFullYear()} PR_Analyzer. All rights reserved.
            </p>
            <div className="flex gap-4 text-[11px] text-zinc-500 font-mono">
              <span>RSC Architecture</span>
              <span>•</span>
              <span>Zero-JS Loading</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
