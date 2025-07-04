'use client'

import { useEffect, useState, useRef } from 'react'
import { Loader2, SendHorizonal } from 'lucide-react'

type Message = {
  question: string
  answer: string
  chart?: string | null
}

type ChatBoxProps = {
  fileId: string | string[]
  onAsk: (fileIds: string[], question: string) => Promise<{ answer: string; chart?: string | null }>
}

export default function ChatBox({ fileId, onAsk }: ChatBoxProps) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleAsk = async () => {
    if (!question.trim()) return

    const newMsg: Message = { question, answer: 'Thinking...', chart: null }
    setMessages((prev) => [...prev, newMsg])
    setLoading(true)

    try {
      const res = await onAsk(Array.isArray(fileId) ? fileId : [fileId], question)
      const updatedMsg = {
        question,
        answer: res.answer,
        chart: res.chart || null,
      }
      setMessages((prev) => [...prev.slice(0, -1), updatedMsg])
      setQuestion('')
    } catch (err) {
      console.error(err)
      setMessages((prev) => [...prev.slice(0, -1), { question, answer: 'Something went wrong.', chart: null }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  return (
    <div className="space-y-6" ref={containerRef}>
      {messages.map((msg, idx) => (
        <div key={idx} className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-2 shadow-sm">
          <div className="text-sm text-blue-300 font-medium">🧑‍💼 You asked:</div>
          <div className="text-gray-100">{msg.question}</div>
          <div className="text-sm text-purple-300 font-medium mt-3">🤖 Assistant replied:</div>
          <div className="text-gray-50 whitespace-pre-line">{msg.answer}</div>
          {msg.chart && (
            <img
              src={msg.chart}
              alt="chart"
              onClick={() => setEnlargedImage(msg.chart)}
              className="mt-4 max-w-full rounded-xl border border-white/10 shadow cursor-pointer hover:opacity-80 transition"
            />
          )}
        </div>
      ))}

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setEnlargedImage(null)}
        >
          <img
            src={enlargedImage}
            alt="Enlarged chart"
            onClick={(e) => e.stopPropagation()}
            className="max-w-[90%] max-h-[90%] rounded-xl border border-white/20 shadow-lg"
          />
        </div>
      )}

      <div className="flex items-center gap-3 border border-white/10 bg-white/5 backdrop-blur-sm p-3 rounded-2xl">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Ask a question, e.g. Which customers are likely to churn?"
          className="flex-1 bg-transparent text-white placeholder:text-gray-400 focus:outline-none"
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="text-white hover:text-blue-300 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <SendHorizonal className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}
