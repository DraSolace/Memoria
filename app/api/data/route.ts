import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const DATA_PATH = path.join(process.cwd(), 'data.json')

function readData() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      const defaultData = { items: [], customPhrases: [] }
      fs.writeFileSync(DATA_PATH, JSON.stringify(defaultData, null, 2))
      return defaultData
    }
    const raw = fs.readFileSync(DATA_PATH, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { items: [], customPhrases: [] }
  }
}

function writeData(data: unknown) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
}

export async function GET() {
  const data = readData()
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    writeData(data)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  }
}
