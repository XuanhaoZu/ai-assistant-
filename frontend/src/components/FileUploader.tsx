'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)

    try {
      setUploading(true)
      const res = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const fileId = res.data.file_id // 假设你的后端返回了 file_id 字段
      router.push(`/chat/${fileId}`)  // 上传后跳转到该文件的聊天界面
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        onChange={handleFileChange}
        className="block"
      />
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {uploading ? '上传中...' : '上传并分析'}
      </button>
    </div>
  )
}
