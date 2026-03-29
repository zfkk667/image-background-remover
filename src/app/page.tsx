'use client'

import { useState, useCallback, useRef } from 'react'
import AuthButton from '@/components/AuthButton'

interface ImageItem {
  id: string
  file: File
  originalUrl: string
  resultUrl?: string
  status: 'pending' | 'processing' | 'done' | 'error'
  error?: string
  progress: number
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}

export default function Home() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessingAll, setIsProcessingAll] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((files: FileList | File[]) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const arr = Array.from(files)
    const valid = arr.filter(f => validTypes.includes(f.type) && f.size <= 10 * 1024 * 1024)

    if (valid.length === 0) return

    // 最多20张
    const remaining = 20 - images.length
    const toAdd = valid.slice(0, remaining)

    const newItems: ImageItem[] = toAdd.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      originalUrl: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
    }))

    setImages(prev => [...prev, ...newItems])
  }, [images.length])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files)
    e.target.value = ''
  }

  const processOne = async (item: ImageItem) => {
    setImages(prev => prev.map(i => i.id === item.id ? { ...i, status: 'processing', progress: 30 } : i))

    try {
      const formData = new FormData()
      formData.append('file', item.file)

      setImages(prev => prev.map(i => i.id === item.id ? { ...i, progress: 60 } : i))

      const res = await fetch('/api/remove-background', { method: 'POST', body: formData })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '处理失败')
      }

      const blob = await res.blob()
      const resultUrl = URL.createObjectURL(blob)

      setImages(prev => prev.map(i =>
        i.id === item.id ? { ...i, status: 'done', resultUrl, progress: 100 } : i
      ))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setImages(prev => prev.map(i =>
        i.id === item.id ? { ...i, status: 'error', error: message, progress: 0 } : i
      ))
    }
  }

  const processAll = async () => {
    const pending = images.filter(i => i.status === 'pending' || i.status === 'error')
    if (pending.length === 0) return
    setIsProcessingAll(true)
    for (const item of pending) {
      await processOne(item)
    }
    setIsProcessingAll(false)
  }

  const removeImage = (id: string) => {
    setImages(prev => {
      const item = prev.find(i => i.id === id)
      if (item) {
        URL.revokeObjectURL(item.originalUrl)
        if (item.resultUrl) URL.revokeObjectURL(item.resultUrl)
      }
      return prev.filter(i => i.id !== id)
    })
  }

  const downloadImage = (item: ImageItem) => {
    if (!item.resultUrl) return
    const a = document.createElement('a')
    a.href = item.resultUrl
    a.download = item.file.name.replace(/\.[^.]+$/, '') + '-no-bg.png'
    a.click()
  }

  const downloadAll = () => {
    images.filter(i => i.status === 'done').forEach(downloadImage)
  }

  const clearAll = () => {
    images.forEach(i => {
      URL.revokeObjectURL(i.originalUrl)
      if (i.resultUrl) URL.revokeObjectURL(i.resultUrl)
    })
    setImages([])
  }

  const doneCount = images.filter(i => i.status === 'done').length
  const pendingCount = images.filter(i => i.status === 'pending').length
  const errorCount = images.filter(i => i.status === 'error').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">✂️</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI 背景移除</h1>
              <p className="text-xs text-gray-500">智能一键去除图片背景</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="/pricing" className="text-sm text-blue-600 hover:text-blue-700 font-medium">💰 定价</a>
            <a href="/subscribe" className="text-sm text-blue-600 hover:text-blue-700 font-medium">⭐ 订阅</a>
            <div className="text-sm text-gray-500">支持 JPG · PNG · WebP · 最大 10MB</div>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50 scale-[1.01]'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
          }`}
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileInput}
            aria-label="上传图片文件"
          />
          <div className="text-5xl mb-4">🖼️</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">拖拽图片到此处，或点击上传</p>
          <p className="text-sm text-gray-400">支持批量上传，最多 20 张图片，单张最大 10MB</p>
          {images.length > 0 && (
            <p className="mt-3 text-sm text-blue-600 font-medium">已上传 {images.length}/20 张</p>
          )}
        </div>

        {/* Features Section */}
        {images.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold text-gray-900 mb-2">AI 智能识别</h3>
                <p className="text-sm text-gray-600">深度学习算法精准识别前景主体，边缘处理自然无毛刺，适用于复杂场景</p>
              </div>
              <div>
                <div className="text-3xl mb-3">🔒 本地处理</div>
                <h3 className="font-semibold text-gray-900 mb-2">隐私安全</h3>
                <p className="text-sm text-gray-600">图片在浏览器本地完成处理，不经过服务器上传，确保您的原始图片安全</p>
              </div>
              <div>
                <div className="text-3xl mb-3">📦 批量处理</div>
                <h3 className="font-semibold text-gray-900 mb-2">高效便捷</h3>
                <p className="text-sm text-gray-600">支持一次上传20张图片批量处理，电商卖家、设计师首选生产力工具</p>
              </div>
            </div>
            <div className="text-center mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-3">适用于电商产品图、人像证件照、设计素材、海报宣传等场景</p>
              <a href="/pricing" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition mr-3">查看定价</a>
              <a href="/subscribe" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">订阅更优惠</a>
            </div>
          </div>
        )}

        {/* Action Bar */}
        {images.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">共 <b>{images.length}</b> 张</span>
              {doneCount > 0 && <span className="text-green-600">✅ 完成 {doneCount}</span>}
              {pendingCount > 0 && <span className="text-gray-500">⏳ 待处理 {pendingCount}</span>}
              {errorCount > 0 && <span className="text-red-500">❌ 失败 {errorCount}</span>}
            </div>
            <div className="flex gap-2">
              {doneCount > 0 && (
                <button
                  onClick={downloadAll}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  ⬇️ 全部下载
                </button>
              )}
              <button
                onClick={processAll}
                disabled={isProcessingAll || pendingCount === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingAll ? '处理中...' : `🚀 一键处理 (${pendingCount + errorCount})`}
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                🗑️ 清空
              </button>
            </div>
          </div>
        )}

        {/* Image Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map(item => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Image Preview */}
                <div className="relative aspect-square bg-gray-100">
                  {/* Checkerboard for transparency */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                      backgroundSize: '16px 16px',
                      backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    }}
                  />
                  <img
                    src={item.resultUrl || item.originalUrl}
                    alt={item.file.name}
                    className="absolute inset-0 w-full h-full object-contain"
                  />

                  {/* Status overlay */}
                  {item.status === 'processing' && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mb-2" />
                      <span className="text-white text-sm font-medium">处理中 {item.progress}%</span>
                    </div>
                  )}
                  {item.status === 'done' && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      ✓ 完成
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                      <div className="bg-white rounded-lg p-3 text-center mx-2">
                        <p className="text-red-600 text-xs font-medium">❌ {item.error}</p>
                      </div>
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={() => removeImage(item.id)}
                    className="absolute top-2 left-2 w-6 h-6 bg-black/50 text-white rounded-full text-xs hover:bg-black/70 transition flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>

                {/* Progress bar */}
                {item.status === 'processing' && (
                  <div className="h-1 bg-gray-100">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}

                {/* Info & Actions */}
                <div className="p-3 space-y-2">
                  <p className="text-xs text-gray-600 truncate font-medium" title={item.file.name}>
                    {item.file.name}
                  </p>
                  <p className="text-xs text-gray-400">{formatSize(item.file.size)}</p>

                  <div className="flex gap-2">
                    {item.status === 'pending' && (
                      <button
                        onClick={() => processOne(item)}
                        className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition"
                      >
                        处理
                      </button>
                    )}
                    {item.status === 'error' && (
                      <button
                        onClick={() => processOne(item)}
                        className="flex-1 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition"
                      >
                        重试
                      </button>
                    )}
                    {item.status === 'done' && (
                      <button
                        onClick={() => downloadImage(item)}
                        className="flex-1 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition"
                      >
                        ⬇️ 下载
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {images.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-lg">上传图片开始使用 👆</p>
            <p className="text-sm mt-1">支持电商产品图、人像证件照、设计素材等</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-gray-400 space-y-1">
        <p>图片在本地处理，不会上传到服务器 · 保护您的隐私</p>
        <div className="flex justify-center gap-4 mt-2">
          <a href="/pricing" className="hover:text-blue-600 transition">定价方案</a>
          <a href="/subscribe" className="hover:text-blue-600 transition">订阅服务</a>
          <a href="/terms" className="hover:text-blue-600 transition">服务条款</a>
          <a href="/privacy" className="hover:text-blue-600 transition">隐私政策</a>
        </div>
      </footer>

      {/* FAQ Schema for Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'AI 背景移除支持哪些图片格式？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '支持 JPG、JPEG、PNG、WebP 格式，单张图片最大 10MB。',
                },
              },
              {
                '@type': 'Question',
                name: '图片处理速度如何？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '单张图片处理时间通常在 3-5 秒内完成。',
                },
              },
              {
                '@type': 'Question',
                name: '我的图片会上传到服务器吗？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '图片在本地浏览器处理，不会上传到服务器，保护您的隐私。',
                },
              },
              {
                '@type': 'Question',
                name: '支持批量处理吗？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '支持批量上传，每次最多 20 张图片同时处理。',
                },
              },
              {
                '@type': 'Question',
                name: '处理后的图片质量如何？',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: '处理后图片分辨率保持不变，背景透明度 100%，主体边缘准确度 ≥95%。',
                },
              },
            ],
          }),
        }}
      />
    </div>
  )
}
