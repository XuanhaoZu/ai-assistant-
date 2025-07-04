'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchDemoFiles } from '@/lib/api'
import { FileText, Sparkles } from 'lucide-react'

export default function HomePage() {
  const [demoFiles, setDemoFiles] = useState<string[]>([])
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchDemoFiles()
      .then((res) => setDemoFiles(res.files || []))
      .catch((err) => console.error('Failed to fetch demo files:', err))
  }, [])

  const toggleFile = (filename: string) => {
    setSelectedFiles(prev =>
      prev.includes(filename) ? prev.filter(f => f !== filename) : [...prev, filename]
    )
  }

  const startAnalysis = () => {
    if (selectedFiles.length === 0) return

    if (selectedFiles.length === 1) {
      // ✅ 单个文件 → 跳转到 /chat/[fileId]
      router.push(`/chat/${encodeURIComponent(selectedFiles[0])}`)
    } else {
      // ✅ 多个文件 → 跳转到 /chat/multi?files=...
      const query = selectedFiles.map(f => encodeURIComponent(f)).join(',')
      router.push(`/chat/multi?files=${query}`)
    }
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-6 py-24 overflow-hidden">

      <div className="absolute -top-40 left-1/2 w-[80vw] h-[80vw] bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 pointer-events-none z-0" />

      <div className="relative z-10 max-w-4xl mx-auto text-center mb-20">
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-blue-300">
          Your AI Revenue Copilot
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          Select one or more files below, then click "Analyze" to uncover sales insights.
        </p>
        <button
          onClick={startAnalysis}
          disabled={selectedFiles.length === 0}
          className="mt-6 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-full shadow transition disabled:opacity-40"
        >
          Analyze Selected ({selectedFiles.length})
        </button>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {demoFiles.map((filename, i) => {
          const selected = selectedFiles.includes(filename)
          return (
            <div
              key={filename}
              onClick={() => toggleFile(filename)}
              className={`group p-6 border rounded-2xl shadow-lg cursor-pointer transition-all duration-300 backdrop-blur-xl transform 
                ${selected ? 'bg-purple-600/30 border-purple-400' : 'bg-white/10 border-white/10 hover:bg-white/20 hover:shadow-2xl'}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <FileText className="w-6 h-6 text-purple-300 group-hover:scale-110 transition-transform" />
                <span className="text-xs text-gray-400">Updated: 2025-07-{i + 1}</span>
              </div>
              <h2 className="text-xl font-semibold text-white group-hover:text-purple-200 truncate">
                {filename}
              </h2>
              <p className="text-sm text-gray-300 mt-2">
                {selected ? "✅ Selected" : "Click to select this file"}
              </p>
            </div>
          )
        })}
      </div>
    </main>
  )
}
