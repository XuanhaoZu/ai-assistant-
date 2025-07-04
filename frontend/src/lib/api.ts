import axios from 'axios'

const BASE_URL = 'http://localhost:8000'  

export async function fetchFiles() {
  const res = await axios.get(`${BASE_URL}/files`)
  return res.data
}

export async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await axios.post(`${BASE_URL}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

  return res.data
}

export async function askQuestion(fileId: string | string[], question: string) {
  const cleanedFileId = Array.isArray(fileId) ? fileId[0] : fileId;

  const res = await axios.post(`${BASE_URL}/query`, {
    file_id: cleanedFileId,
    question: question,
  });

  const { result, chart } = res.data;

  return {
    answer: result,
    chart: chart || null,
  };
}



export async function fetchDemoFiles() {
  const res = await axios.get(`${BASE_URL}/demo-files`)
  return res.data
}


export async function fetchDemoFileByName(filename: string) {
  const res = await axios.get(`${BASE_URL}/demo-files/${filename}`, {
    responseType: 'blob', 
  })
  return res
}

export async function fetchPreviewData(fileId: string) {
  const res = await axios.get(`${BASE_URL}/preview`, {
    params: { file_id: fileId },
  })
  return res.data
}


export async function askMultiFiles(fileIds: string[], question: string) {
  const res = await axios.post(`${BASE_URL}/multi-query`, {
    file_ids: fileIds, 
    question: question,
  })

  const { result, chart } = res.data

  return {
    answer: result,
    chart: chart || null,
  }
}