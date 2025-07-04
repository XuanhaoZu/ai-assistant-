'use client'

import Link from 'next/link'
import { FileText, ArrowRight } from 'lucide-react'

export type FileInfo = {
  id: string
  filename: string
  upload_time: string
}

type FileListProps = {
  files: FileInfo[]
}

export default function FileList({ files }: FileListProps) {
  if (files.length === 0) {
    return <p className="text-gray-400 text-center mt-6">No files uploaded yet.</p>
  }

  return (
    <ul className="space-y-4">
      {files.map((file) => (
        <li
          key={file.id}
          className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm hover:shadow transition"
        >
          <div className="flex items-center justify-between gap-4">
            {/* File Info */}
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-purple-300" />
              <div>
                <p className="text-white font-medium">{file.filename}</p>
                <p className="text-sm text-gray-400">
                  Uploaded at: {new Date(file.upload_time).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Action Link */}
            <Link
              href={`/chat/${file.id}`}
              className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition"
            >
              Open Agent <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </li>
      ))}
    </ul>
  )
}