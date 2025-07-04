'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ChatBox from '@/components/ChatBox'
import { askQuestion as askQuestionAPI, fetchPreviewData } from '@/lib/api'
import { FileText } from 'lucide-react'

export default function ChatPage() {
  const { fileId } = useParams()
  const [preview, setPreview] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])

  useEffect(() => {
    if (!fileId || typeof fileId !== 'string') return
    fetchPreviewData(fileId).then((res) => {
      setPreview(res.preview || [])
      setColumns(res.columns || [])
    })
  }, [fileId])

  if (!fileId || typeof fileId !== 'string') {
    return <div className="text-red-500 text-center py-12">Invalid file ID.</div>
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-6 pt-28 pb-20 overflow-x-hidden">

      <div className="absolute -top-40 left-1/2 w-[70vw] h-[70vw] bg-purple-500/20 rounded-full blur-3xl -translate-x-1/2 pointer-events-none z-0" />

      <div className="relative z-10 mx-auto px-4 space-y-10 max-w-[1400px]">

        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 backdrop-blur-lg rounded-full shadow-sm">
            <FileText className="w-5 h-5 text-purple-300" />
            <span className="text-sm font-medium text-gray-200 truncate max-w-[200px]">
              {fileId}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-blue-300">
            Ask Your AI Revenue Assistant
          </h1>
          <p className="text-sm text-blue-300 italic">Ready to analyze and respond 💡</p>
        </div>

        {preview.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow overflow-auto">
            <p className="text-sm text-blue-200 font-semibold mb-3">🔍 Preview (5 random rows)</p>
            <div className="w-full overflow-x-auto">
              <table className="table-auto min-w-[800px] text-sm text-left border-collapse">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2 bg-white/10 text-gray-300 font-medium border-b border-white/10 text-sm max-w-[240px] truncate"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-b border-white/10 hover:bg-white/10 transition">
                      {columns.map((col) => (
                        <td
                          key={col}
                          className="px-4 py-2 text-gray-100 align-top max-w-[240px] truncate"
                          title={String(row[col])}
                        >
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="w-full max-w-[1000px] mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 shadow-lg space-y-4">
          <ChatBox fileId={fileId} onAsk={askQuestionAPI} />
        </div>
      </div>
    </main>
  )
}
