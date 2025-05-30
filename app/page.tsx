"use client"

import { useState, useEffect } from "react"
import { Search, Play, Heart, MessageCircle, Eye, Upload, LogIn, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [videos, setVideos] = useState([])
  const [filteredVideos, setFilteredVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    try {
      const user = localStorage.getItem("currentUser")
      console.log("Loading current user:", user) // Debug

      if (user) {
        const userData = JSON.parse(user)
        // Verificar se os dados do usuário são válidos
        if (userData && userData.name && userData.nickname) {
          setCurrentUser(userData)
          console.log("Current user set:", userData) // Debug
        } else {
          console.log("Invalid user data, removing from localStorage")
          localStorage.removeItem("currentUser")
        }
      }
    } catch (error) {
      console.error("Error parsing user:", error) // Debug
      localStorage.removeItem("currentUser")
    }

    // Carregar vídeos do localStorage
    loadVideos()
  }, [])

  const loadVideos = () => {
    try {
      const storedVideos = localStorage.getItem("allVideos")
      console.log("Loading videos from storage:", storedVideos) // Debug

      if (storedVideos) {
        const videosData = JSON.parse(storedVideos)
        // Verificar se é um array válido
        if (Array.isArray(videosData)) {
          // Filtrar vídeos com dados válidos
          const validVideos = videosData.filter(
            (video) => video && video.id && video.title && video.user && video.user.name && video.user.nickname,
          )
          console.log("Valid videos loaded:", validVideos) // Debug
          setVideos(validVideos)
          setFilteredVideos(validVideos)
        } else {
          console.log("Videos data is not an array, initializing empty array")
          setVideos([])
          setFilteredVideos([])
        }
      } else {
        console.log("No videos found in storage") // Debug
        setVideos([])
        setFilteredVideos([])
      }
    } catch (error) {
      console.error("Error parsing videos:", error) // Debug
      setVideos([])
      setFilteredVideos([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Filtrar vídeos baseado na busca
    if (searchQuery.trim() === "") {
      setFilteredVideos(videos)
    } else {
      const filtered = videos.filter((video) => {
        // Verificar se o vídeo e suas propriedades existem antes de acessar
        if (!video || !video.title || !video.user) return false

        const title = video.title.toLowerCase()
        const nickname = video.user.nickname ? video.user.nickname.toLowerCase() : ""
        const description = video.description ? video.description.toLowerCase() : ""
        const query = searchQuery.toLowerCase()

        return title.includes(query) || nickname.includes(query) || description.includes(query)
      })
      setFilteredVideos(filtered)
    }
  }, [searchQuery, videos])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLike = (videoId) => {
    if (!currentUser) {
      alert("Faça login para curtir vídeos!")
      return
    }

    try {
      const updatedVideos = videos.map((video) => {
        if (video && video.id === videoId) {
          const userLikes = JSON.parse(localStorage.getItem("userLikes") || "{}")
          const hasLiked = userLikes[currentUser.id]?.includes(videoId)

          if (hasLiked) {
            userLikes[currentUser.id] = userLikes[currentUser.id].filter((id) => id !== videoId)
            return { ...video, likes: (video.likes || 0) - 1 }
          } else {
            if (!userLikes[currentUser.id]) userLikes[currentUser.id] = []
            userLikes[currentUser.id].push(videoId)
            return { ...video, likes: (video.likes || 0) + 1 }
          }
        }
        return video
      })

      setVideos(updatedVideos)
      localStorage.setItem("allVideos", JSON.stringify(updatedVideos))
    } catch (error) {
      console.error("Error handling like:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    setCurrentUser(null)
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
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) return "há 1 dia"
      if (diffDays < 7) return `há ${diffDays} dias`
      if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`
      return `há ${Math.floor(diffDays / 30)} meses`
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Data inválida"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Play className="w-5 h-5 text-white fill-white animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Carregando L5M...</h2>
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
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">L5M</span>
                <Badge variant="secondary" className="text-xs">
                  Limit 5 Minutes
                </Badge>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar vídeos ou criadores..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full rounded-full border-gray-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>
              </form>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/upload")}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/profile/${currentUser.nickname}`)}
                    className="flex items-center space-x-2"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={currentUser.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{currentUser.name ? currentUser.name[0] : "U"}</AvatarFallback>
                    </Avatar>
                    <span>{currentUser.nickname || "Usuário"}</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center space-x-2">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => router.push("/auth")}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Entrar</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentUser && currentUser.name ? `Bem-vindo de volta, ${currentUser.name}!` : "Descubra vídeos incríveis"}
          </h1>
          <p className="text-gray-600">
            {currentUser
              ? "Confira os últimos vídeos da comunidade L5M"
              : "Vídeos de até 5 minutos para você assistir quando quiser"}
          </p>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map((video) => {
              // Verificar se o vídeo tem dados válidos
              if (!video || !video.id || !video.title || !video.user) {
                return null
              }

              return (
                <Card key={video.id} className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={video.thumbnail || "/placeholder.svg?height=200&width=350"}
                        alt={video.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {video.duration || "0:00"}
                      </div>
                      <div
                        className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-t-lg flex items-center justify-center"
                        onClick={() => router.push(`/video/${video.id}`)}
                      >
                        <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 fill-white" />
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                        {video.title}
                      </h3>

                      <div className="flex items-center space-x-2 mb-3">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={video.user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>{video.user.name ? video.user.name[0] : "U"}</AvatarFallback>
                        </Avatar>
                        <Link
                          href={`/profile/${video.user.nickname || "unknown"}`}
                          className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                        >
                          {video.user.nickname || "Usuário"}
                        </Link>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{formatViews(video.views)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleLike(video.id)
                              }}
                              className="flex items-center space-x-1 hover:text-red-600 transition-colors"
                            >
                              <Heart className="w-4 h-4" />
                              <span>{video.likes || 0}</span>
                            </button>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{video.comments || 0}</span>
                          </div>
                        </div>
                        <span>{formatDate(video.uploadDate)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {videos.length === 0 ? "Nenhum vídeo ainda" : "Nenhum vídeo encontrado"}
            </h3>
            <p className="text-gray-600 mb-4">
              {videos.length === 0
                ? "Seja o primeiro a compartilhar um vídeo na plataforma!"
                : "Tente buscar por outros termos ou explore diferentes criadores."}
            </p>
            {currentUser && videos.length === 0 && (
              <Button onClick={() => router.push("/upload")} className="bg-red-600 hover:bg-red-700">
                Fazer Primeiro Upload
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
