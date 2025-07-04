'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchDemoFiles } from '@/lib/api'
import { FileText, Sparkles } from 'lucide-react'

export default function HomePage() {
  const [demoFiles, setDemoFiles] = useState<string[]>([])

  useEffect(() => {
    fetchDemoFiles()
      .then((res) => setDemoFiles(res.files || []))
      .catch((err) => {
        console.error('Failed to fetch demo files:', err)
      })
  }, [])

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-6 py-24 overflow-hidden">

      <div className="absolute -top-40 left-1/2 w-[80vw] h-[80vw] bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 pointer-events-none z-0" />

      <div className="relative z-10 max-w-4xl mx-auto text-center mb-20">
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
          Your AI Revenue Copilot
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Select a demo file below or upload your own to uncover key sales insights powered by LLM.
        </p>
        <p className="mt-2 text-sm text-blue-400 italic animate-pulse">Our assistant is ready when you are 🚀</p>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto mb-12 text-center">
        <div className="flex justify-center items-center gap-2 mb-6 text-purple-200">
          <Sparkles className="w-5 h-5 animate-bounce" />
          <span className="uppercase tracking-wide text-sm font-semibold">
            Recommended files to try
          </span>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {demoFiles.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-4 animate-bounce">📂</div>
            <p className="text-gray-400 text-xl">No demo files yet. Try uploading yours!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoFiles.map((filename, i) => (
              <Link
                key={filename}
                href={`/chat/${encodeURIComponent(filename)}`}
                className="group p-6 bg-white/10 border border-white/10 rounded-2xl shadow-lg hover:shadow-2xl hover:bg-white/20 transition-all duration-300 backdrop-blur-xl transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <FileText className="w-6 h-6 text-purple-300 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-gray-400">Updated: 2025-07-{i + 1}</span>
                </div>
                <h2 className="text-xl font-semibold text-white group-hover:text-purple-200 truncate">
                  {filename}
                </h2>
                <p className="text-sm text-gray-300 mt-2">
                  Discover hidden revenue signals in this dataset.
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
