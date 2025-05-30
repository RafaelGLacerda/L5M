"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, Video, ImageIcon, Play, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function UploadPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)

  const [videoData, setVideoData] = useState({
    title: "",
    description: "",
    thumbnail: null,
    videoFile: null,
    videoUrl: "",
    duration: "0:00",
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Verificar se usuário está logado
    const user = localStorage.getItem("currentUser")
    console.log("Current user from localStorage:", user) // Debug

    if (!user) {
      console.log("No user found, redirecting to auth") // Debug
      router.push("/auth")
      return
    }

    try {
      const userData = JSON.parse(user)
      console.log("Parsed user data:", userData) // Debug
      setCurrentUser(userData)
    } catch (error) {
      console.error("Error parsing user data:", error) // Debug
      localStorage.removeItem("currentUser")
      router.push("/auth")
    }
  }, [router])

  const handleVideoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Verificar se é um arquivo de vídeo
      if (!file.type.startsWith("video/")) {
        setErrors({ ...errors, video: "Por favor, selecione um arquivo de vídeo válido." })
        return
      }

      // Verificar tamanho do arquivo (máximo 100MB para demo)
      if (file.size > 100 * 1024 * 1024) {
        setErrors({ ...errors, video: "O arquivo é muito grande. Máximo 100MB." })
        return
      }

      // Criar URL temporária para o vídeo
      const videoUrl = URL.createObjectURL(file)

      // Verificar duração
      const video = document.createElement("video")
      video.preload = "metadata"
      video.onloadedmetadata = () => {
        const duration = video.duration
        if (duration > 300) {
          // 5 minutos = 300 segundos
          setErrors({ ...errors, video: "O vídeo deve ter no máximo 5 minutos de duração." })
          URL.revokeObjectURL(videoUrl)
          return
        }

        const minutes = Math.floor(duration / 60)
        const seconds = Math.floor(duration % 60)
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`

        setVideoData({
          ...videoData,
          videoFile: file,
          videoUrl: videoUrl,
          duration: formattedDuration,
        })
        setErrors({ ...errors, video: null })
      }

      video.onerror = () => {
        setErrors({ ...errors, video: "Erro ao processar o vídeo. Tente outro arquivo." })
        URL.revokeObjectURL(videoUrl)
      }

      video.src = videoUrl
    }
  }

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors({ ...errors, thumbnail: "Por favor, selecione uma imagem válida." })
        return
      }

      setVideoData({ ...videoData, thumbnail: file })
      setErrors({ ...errors, thumbnail: null })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!videoData.title.trim()) {
      newErrors.title = "O título é obrigatório."
    }

    if (!videoData.description.trim()) {
      newErrors.description = "A descrição é obrigatória."
    }

    if (!videoData.videoFile) {
      newErrors.video = "Por favor, selecione um arquivo de vídeo."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!currentUser) {
      alert("Erro: usuário não encontrado. Faça login novamente.")
      router.push("/auth")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulação de upload com progresso mais realista
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(uploadInterval)

            // Finalizar upload
            setTimeout(() => {
              try {
                // Criar thumbnail se não foi fornecida
                let thumbnailUrl = "/placeholder.svg?height=200&width=350"
                if (videoData.thumbnail) {
                  thumbnailUrl = URL.createObjectURL(videoData.thumbnail)
                }

                // Criar novo vídeo
                const newVideo = {
                  id: Date.now().toString(),
                  title: videoData.title,
                  description: videoData.description,
                  thumbnail: thumbnailUrl,
                  duration: videoData.duration,
                  views: 0,
                  likes: 0,
                  comments: 0,
                  uploadDate: new Date().toISOString().split("T")[0],
                  userId: currentUser.id,
                  user: {
                    id: currentUser.id,
                    name: currentUser.name,
                    nickname: currentUser.nickname,
                    avatar: currentUser.avatar,
                  },
                  videoUrl: videoData.videoUrl,
                }

                console.log("Creating new video:", newVideo) // Debug

                // Salvar no localStorage
                const allVideos = JSON.parse(localStorage.getItem("allVideos") || "[]")
                allVideos.unshift(newVideo) // Adicionar no início
                localStorage.setItem("allVideos", JSON.stringify(allVideos))

                // Salvar nos vídeos do usuário
                const userVideos = JSON.parse(localStorage.getItem(`userVideos_${currentUser.id}`) || "[]")
                userVideos.unshift(newVideo)
                localStorage.setItem(`userVideos_${currentUser.id}`, JSON.stringify(userVideos))

                console.log("Video saved successfully") // Debug

                setUploadProgress(100)
                setIsUploading(false)
                setUploadComplete(true)

                // Redirecionar após 2 segundos
                setTimeout(() => {
                  router.push(`/video/${newVideo.id}`)
                }, 2000)
              } catch (error) {
                console.error("Error saving video:", error) // Debug
                alert("Erro ao salvar vídeo. Tente novamente.")
                setIsUploading(false)
              }
            }, 500)

            return 95
          }
          return prev + Math.random() * 10 + 5
        })
      }, 300)
    } catch (error) {
      console.error("Upload error:", error) // Debug
      setIsUploading(false)
      alert("Erro ao fazer upload. Tente novamente.")
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Carregando...</h2>
        </div>
      </div>
    )
  }

  if (uploadComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Concluído!</h2>
            <p className="text-gray-600 mb-4">Seu vídeo foi enviado com sucesso e já está disponível na plataforma.</p>
            <p className="text-sm text-gray-500">Redirecionando para o vídeo...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </Button>

              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">L5M</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enviar Novo Vídeo</h1>
          <p className="text-gray-600">
            Compartilhe seu conteúdo com a comunidade L5M. Lembre-se: máximo de 5 minutos!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              {/* Video Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="w-5 h-5" />
                    <span>Arquivo de Vídeo</span>
                  </CardTitle>
                  <CardDescription>Envie seu vídeo (máximo 5 minutos, formatos: MP4, MOV, AVI)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                      id="video-upload"
                      disabled={isUploading}
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      {videoData.videoFile ? (
                        <div className="space-y-2">
                          <Video className="w-12 h-12 text-green-600 mx-auto" />
                          <p className="text-sm font-medium text-gray-900">{videoData.videoFile.name}</p>
                          <p className="text-xs text-gray-500">Duração: {videoData.duration}</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              setVideoData({ ...videoData, videoFile: null, duration: "0:00" })
                            }}
                          >
                            Alterar Vídeo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                          <p className="text-sm font-medium text-gray-900">Clique para enviar seu vídeo</p>
                          <p className="text-xs text-gray-500">Ou arraste e solte aqui</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {errors.video && (
                    <Alert className="mt-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-600">{errors.video}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Thumbnail Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5" />
                    <span>Miniatura (Opcional)</span>
                  </CardTitle>
                  <CardDescription>Escolha uma imagem atrativa para representar seu vídeo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailUpload}
                      className="hidden"
                      id="thumbnail-upload"
                      disabled={isUploading}
                    />
                    <label htmlFor="thumbnail-upload" className="cursor-pointer">
                      {videoData.thumbnail ? (
                        <div className="space-y-2">
                          <img
                            src={URL.createObjectURL(videoData.thumbnail) || "/placeholder.svg"}
                            alt="Thumbnail preview"
                            className="w-32 h-20 object-cover rounded mx-auto"
                          />
                          <p className="text-sm font-medium text-gray-900">{videoData.thumbnail.name}</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              setVideoData({ ...videoData, thumbnail: null })
                            }}
                          >
                            Remover
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                          <p className="text-sm font-medium text-gray-900">Clique para enviar miniatura</p>
                          <p className="text-xs text-gray-500">JPG, PNG ou GIF</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {errors.thumbnail && (
                    <Alert className="mt-4 border-red-200 bg-red-50">
                      <AlertDescription className="text-red-600">{errors.thumbnail}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Video Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes do Vídeo</CardTitle>
                  <CardDescription>Adicione informações sobre seu vídeo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      placeholder="Digite um título atrativo para seu vídeo"
                      value={videoData.title}
                      onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                      disabled={isUploading}
                      maxLength={100}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{errors.title && <span className="text-red-600">{errors.title}</span>}</span>
                      <span>{videoData.title.length}/100</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição *</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva seu vídeo, adicione contexto e informações relevantes..."
                      value={videoData.description}
                      onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
                      disabled={isUploading}
                      className="min-h-[120px] resize-none"
                      maxLength={500}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{errors.description && <span className="text-red-600">{errors.description}</span>}</span>
                      <span>{videoData.description.length}/500</span>
                    </div>
                  </div>

                  {/* Preview */}
                  {(videoData.title || videoData.description) && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm text-gray-900 line-clamp-2">
                          {videoData.title || "Título do vídeo"}
                        </h5>
                        <p className="text-xs text-gray-600 line-clamp-3">
                          {videoData.description || "Descrição do vídeo"}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>@{currentUser.nickname}</span>
                          <span>•</span>
                          <span>0 visualizações</span>
                          <span>•</span>
                          <span>agora</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Enviando vídeo...</h3>
                    <span className="text-sm text-gray-600">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-gray-600">Por favor, não feche esta página durante o upload.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isUploading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700"
              disabled={isUploading || !videoData.videoFile}
            >
              {isUploading ? "Enviando..." : "Publicar Vídeo"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
