import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile } from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const data = await request.formData()
    const file = data.get('file') as File
    const title = data.get('title') as string
    const artist = data.get('artist') as string
    const category = data.get('category') as string
    const lrcFile = data.get('lrcFile') as File | null
    const staticLyrics = data.get('staticLyrics') as string | null

    if (!file || !title || !artist || !category) {
      return NextResponse.json({ error: '請求不完整' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = Date.now() + '-' + file.name.replace(/\s+/g, '-')
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename)
    await writeFile(filePath, buffer)

    let lyricsPath = null
    if (lrcFile) {
      const lrcBuffer = Buffer.from(await lrcFile.arrayBuffer())
      const lrcFilename = Date.now() + '-' + lrcFile.name.replace(/\s+/g, '-')
      const lrcFilePath = path.join(process.cwd(), 'public', 'lyrics', lrcFilename)
      await writeFile(lrcFilePath, lrcBuffer)
      lyricsPath = `/lyrics/${lrcFilename}`
    }

    const song = await prisma.song.create({
      data: {
        title,
        artist,
        category,
        filePath: `/uploads/${filename}`,
        lyricsPath,
        staticLyrics
      }
    })

    return NextResponse.json(song)
  } catch (error) {
    console.error('上傳錯誤:', error)
    return NextResponse.json({ error: '上傳失敗' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const songs = await prisma.song.findMany()
    return NextResponse.json(songs)
  } catch (error) {
    console.error('獲取歌曲失敗:', error)
    return NextResponse.json({ error: '獲取歌曲失敗' }, { status: 500 })
  }
}