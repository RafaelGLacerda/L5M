"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Play, Heart, Eye, Share2, ThumbsUp, Send, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(null)
  const [video, setVideo] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [hasViewed, setHasViewed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!params?.id) {
      setIsLoading(false)
      return
    }

    try {
      // Verificar usuário logado
      const user = localStorage.getItem("currentUser")
      if (user) {
        const userData = JSON.parse(user)
        if (userData && userData.name && userData.nickname) {
          setCurrentUser(userData)
        }
      }

      // Buscar vídeo no localStorage
      const allVideos = JSON.parse(localStorage.getItem("allVideos") || "[]")
      const foundVideo = Array.isArray(allVideos) ? allVideos.find((v) => v && v.id === params.id) : null

      if (foundVideo && foundVideo.title && foundVideo.user) {
        setVideo(foundVideo)
        // Incrementar visualização após 3 segundos
        setTimeout(() => {
          if (!hasViewed) {
            const updatedVideo = { ...foundVideo, views: (foundVideo.views || 0) + 1 }
            setVideo(updatedVideo)

            // Atualizar no localStorage
            const updatedVideos = allVideos.map((v) => (v && v.id === params.id ? updatedVideo : v))
            localStorage.setItem("allVideos", JSON.stringify(updatedVideos))

            setHasViewed(true)
          }
        }, 3000)
      }

      // Buscar comentários
      const allComments = JSON.parse(localStorage.getItem("videoComments") || "{}")
      const videoComments = allComments[params.id] || []
      setComments(Array.isArray(videoComments) ? videoComments : [])
    } catch (error) {
      console.error("Error loading video data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [params?.id, hasViewed])

  const handleLike = () => {
    if (!currentUser) {
      alert("Faça login para curtir vídeos!")
      return
    }

    if (!video) return

    setIsLiked(!isLiked)
    setVideo((prev) => ({
      ...prev,
      likes: isLiked ? (prev.likes || 0) - 1 : (prev.likes || 0) + 1,
    }))
  }

  const handleComment = (e) => {
    e.preventDefault()
    if (!currentUser) {
      alert("Faça login para comentar!")
      return
    }

    if (!video || !newComment.trim()) return

    try {
      const comment = {
        id: Date.now().toString(),
        videoId: video.id,
        userId: currentUser.id,
        user: currentUser,
        content: newComment,
        likes: 0,
        date: new Date().toISOString(),
        replies: [],
      }

      const newComments = [comment, ...comments]
      setComments(newComments)
      setNewComment("")

      // Salvar comentários no localStorage
      const allComments = JSON.parse(localStorage.getItem("videoComments") || "{}")
      allComments[video.id] = newComments
      localStorage.setItem("videoComments", JSON.stringify(allComments))

      // Atualizar contador de comentários no vídeo
      const updatedVideo = { ...video, comments: (video.comments || 0) + 1 }
      setVideo(updatedVideo)

      // Atualizar no localStorage
      const allVideos = JSON.parse(localStorage.getItem("allVideos") || "[]")
      const updatedVideos = allVideos.map((v) => (v && v.id === video.id ? updatedVideo : v))
      localStorage.setItem("allVideos", JSON.stringify(updatedVideos))
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const formatViews = (views) => {
    const numViews = views || 0
    if (numViews >= 1000000) return `${(numViews / 1000000).toFixed(1)}M`
    if (numViews >= 1000) return `${(numViews / 1000).toFixed(1)}K`
    return numViews.toString()
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Data inválida"

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return "Data inválida"
    }
  }

  const formatCommentDate = (dateString) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffMinutes = Math.ceil(diffTime / (1000 * 60))
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffMinutes < 60) return `há ${diffMinutes} minutos`
      if (diffHours < 24) return `há ${diffHours} horas`
      if (diffDays === 1) return "há 1 dia"
      return `há ${diffDays} dias`
    } catch (error) {
      return ""
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Play className="w-5 h-5 text-white fill-white animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Carregando vídeo...</h2>
        </div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vídeo não encontrado</h2>
          <Button onClick={() => router.push("/")}>Voltar ao início</Button>
        </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player and Info */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="bg-black rounded-lg overflow-hidden mb-6">
              <video
                className="w-full aspect-video"
                controls
                poster={video.thumbnail}
                src={video.videoUrl}
                onPlay={() => {
                  if (!hasViewed) {
                    setVideo((prev) => ({ ...prev, views: (prev.views || 0) + 1 }))
                    setHasViewed(true)
                  }
                }}
              >
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatViews(video.views)} visualizações</span>
                  </div>
                  <span>•</span>
                  <span>{formatDate(video.uploadDate)}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={handleLike}
                    className={`flex items-center space-x-2 ${isLiked ? "bg-red-600 hover:bg-red-700" : ""}`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-white" : ""}`} />
                    <span>{video.likes || 0}</span>
                  </Button>

                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <Share2 className="w-4 h-4" />
                    <span>Compartilhar</span>
                  </Button>
                </div>
              </div>

              {/* Channel Info */}
              {video.user && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={video.user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{video.user.name ? video.user.name[0] : "U"}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <Link
                              href={`/profile/${video.user.nickname || "unknown"}`}
                              className="font-semibold text-gray-900 hover:text-red-600 transition-colors"
                            >
                              {video.user.nickname || "Usuário"}
                            </Link>
                            <p className="text-sm text-gray-600">{video.user.followers || 0} seguidores</p>
                          </div>

                          {currentUser && currentUser.id !== video.user.id && (
                            <Button size="sm" className="bg-red-600 hover:bg-red-700">
                              Seguir
                            </Button>
                          )}
                        </div>

                        <p className="text-gray-700 mt-2">{video.description || ""}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comments Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{video.comments || 0} comentários</h3>

                {/* Add Comment */}
                {currentUser ? (
                  <form onSubmit={handleComment} className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={currentUser.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{currentUser.name ? currentUser.name[0] : "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Adicione um comentário..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => setNewComment("")}>
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!newComment.trim()}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Comentar
                        </Button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-4 bg-gray-100 rounded-lg">
                    <p className="text-gray-600 mb-2">Faça login para comentar</p>
                    <Button onClick={() => router.push("/auth")} size="sm" className="bg-red-600 hover:bg-red-700">
                      Fazer Login
                    </Button>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => {
                    if (!comment || !comment.id || !comment.user) return null

                    return (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{comment.user.name ? comment.user.name[0] : "U"}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Link
                              href={`/profile/${comment.user.nickname || "unknown"}`}
                              className="font-semibold text-sm text-gray-900 hover:text-red-600 transition-colors"
                            >
                              {comment.user.nickname || "Usuário"}
                            </Link>
                            <span className="text-xs text-gray-500">{formatCommentDate(comment.date)}</span>
                          </div>

                          <p className="text-gray-700 text-sm mb-2">{comment.content}</p>

                          <div className="flex items-center space-x-4">
                            <button className="flex items-center space-x-1 text-xs text-gray-500 hover:text-red-600 transition-colors">
                              <ThumbsUp className="w-3 h-3" />
                              <span>{comment.likes || 0}</span>
                            </button>
                            <button className="text-xs text-gray-500 hover:text-red-600 transition-colors">
                              Responder
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Related Videos */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Vídeos relacionados</h3>

            <div className="space-y-3">
              {JSON.parse(localStorage.getItem("allVideos") || "[]")
                .filter((v) => v && v.id && v.id !== video.id)
                .map((relatedVideo) => {
                  if (!relatedVideo || !relatedVideo.title || !relatedVideo.user) return null

                  return (
                    <Card key={relatedVideo.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex space-x-3" onClick={() => router.push(`/video/${relatedVideo.id}`)}>
                          <div className="relative flex-shrink-0">
                            <img
                              src={relatedVideo.thumbnail || "/placeholder.svg"}
                              alt={relatedVideo.title}
                              className="w-24 h-16 object-cover rounded"
                            />
                            <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                              {relatedVideo.duration || "0:00"}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                              {relatedVideo.title}
                            </h4>
                            <p className="text-xs text-gray-600 mb-1">{relatedVideo.user.nickname || "Usuário"}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>{formatViews(relatedVideo.views)} views</span>
                              <span>•</span>
                              <span>{formatDate(relatedVideo.uploadDate)}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
