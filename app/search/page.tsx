"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Search, Play, Heart, Eye, ArrowLeft, User, VideoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

function SearchContent() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [videos, setVideos] = useState([])
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    // Obter query da URL de forma segura
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const q = urlParams.get("q") || ""
      setQuery(q)
      setSearchQuery(q)
    }
  }, [])

  useEffect(() => {
    if (!query) {
      setIsLoading(false)
      return
    }

    // Carregar dados do localStorage
    setIsLoading(true)

    try {
      // Buscar vídeos
      const allVideosString = localStorage.getItem("allVideos")
      const allVideos = allVideosString ? JSON.parse(allVideosString) : []

      // Buscar usuários
      const allUsersString = localStorage.getItem("registeredUsers")
      const allUsers = allUsersString ? JSON.parse(allUsersString) : []

      // Filtrar com base na query
      const normalizedQuery = query.toLowerCase()

      // Filtrar vídeos - verificar se são arrays válidos
      const filteredVideos = Array.isArray(allVideos)
        ? allVideos.filter((video) => {
            if (!video || !video.title || !video.user) return false

            const title = video.title.toLowerCase()
            const description = video.description ? video.description.toLowerCase() : ""
            const nickname = video.user.nickname ? video.user.nickname.toLowerCase() : ""

            return (
              title.includes(normalizedQuery) ||
              description.includes(normalizedQuery) ||
              nickname.includes(normalizedQuery)
            )
          })
        : []

      // Filtrar usuários
      const filteredUsers = Array.isArray(allUsers)
        ? allUsers.filter((user) => {
            if (!user || !user.name || !user.nickname) return false

            const name = user.name.toLowerCase()
            const nickname = user.nickname.toLowerCase()
            const bio = user.bio ? user.bio.toLowerCase() : ""

            return name.includes(normalizedQuery) || nickname.includes(normalizedQuery) || bio.includes(normalizedQuery)
          })
        : []

      setVideos(filteredVideos)
      setUsers(filteredUsers)
    } catch (error) {
      console.error("Error loading search data:", error)
      setVideos([])
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [query])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
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
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) return "há 1 dia"
      if (diffDays < 7) return `há ${diffDays} dias`
      if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`
      return `há ${Math.floor(diffDays / 30)} meses`
    } catch (error) {
      return "Data inválida"
    }
  }

  const formatJoinDate = (dateString) => {
    if (!dateString) return ""

    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("pt-BR", {
        year: "numeric",
        month: "long",
      })
    } catch (error) {
      return ""
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Search className="w-5 h-5 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Buscando...</h2>
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
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resultados da busca</h1>
          <p className="text-gray-600">
            {query
              ? `Encontramos ${videos.length} vídeos e ${users.length} usuários para "${query}"`
              : "Digite algo para buscar"}
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="all" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Todos ({videos.length + users.length})</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center space-x-2">
              <VideoIcon className="w-4 h-4" />
              <span>Vídeos ({videos.length})</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Usuários ({users.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* All Results */}
          <TabsContent value="all">
            {videos.length > 0 || users.length > 0 ? (
              <div className="space-y-8">
                {/* Users Section */}
                {users.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Usuários</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {users.slice(0, 3).map((user) => {
                        if (!user || !user.id || !user.name || !user.nickname) return null

                        return (
                          <Card key={user.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div
                                className="flex items-center space-x-4 cursor-pointer"
                                onClick={() => router.push(`/profile/${user.nickname}`)}
                              >
                                <Avatar className="w-16 h-16">
                                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                  <p className="text-sm text-gray-600 mb-1">@{user.nickname}</p>
                                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                                    <span>{user.followers || 0} seguidores</span>
                                    <span>•</span>
                                    <span>Desde {formatJoinDate(user.joinDate)}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>

                    {users.length > 3 && (
                      <div className="mt-4 text-center">
                        <Button variant="outline" onClick={() => setActiveTab("users")}>
                          Ver todos os {users.length} usuários
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Videos Section */}
                {videos.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Vídeos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {videos.slice(0, 8).map((video) => {
                        if (!video || !video.id || !video.title || !video.user) return null

                        return (
                          <Card
                            key={video.id}
                            className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                          >
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
                                      <Heart className="w-4 h-4" />
                                      <span>{video.likes || 0}</span>
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

                    {videos.length > 8 && (
                      <div className="mt-6 text-center">
                        <Button variant="outline" onClick={() => setActiveTab("videos")}>
                          Ver todos os {videos.length} vídeos
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : query ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum resultado encontrado</h3>
                <p className="text-gray-600 mb-4">Não encontramos nenhum vídeo ou usuário para "{query}".</p>
                <p className="text-sm text-gray-500">Tente buscar por outros termos ou verifique a ortografia.</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Digite algo para buscar</h3>
                <p className="text-gray-600">Use a barra de pesquisa acima para encontrar vídeos e usuários.</p>
              </div>
            )}
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => {
                  if (!video || !video.id || !video.title || !video.user) return null

                  return (
                    <Card
                      key={video.id}
                      className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                    >
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
                                <Heart className="w-4 h-4" />
                                <span>{video.likes || 0}</span>
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
                  <VideoIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum vídeo encontrado</h3>
                <p className="text-gray-600 mb-4">
                  {query ? `Não encontramos nenhum vídeo para "${query}".` : "Digite algo para buscar vídeos."}
                </p>
                <p className="text-sm text-gray-500">Tente buscar por outros termos ou verifique a ortografia.</p>
              </div>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            {users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => {
                  if (!user || !user.id || !user.name || !user.nickname) return null

                  return (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div
                          className="flex items-center space-x-4 cursor-pointer"
                          onClick={() => router.push(`/profile/${user.nickname}`)}
                        >
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-600 mb-1">@{user.nickname}</p>
                            {user.bio && <p className="text-sm text-gray-700 mb-2 line-clamp-2">{user.bio}</p>}
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <span>{user.followers || 0} seguidores</span>
                              <span>•</span>
                              <span>Desde {formatJoinDate(user.joinDate)}</span>
                            </div>
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
                  <User className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum usuário encontrado</h3>
                <p className="text-gray-600 mb-4">
                  {query ? `Não encontramos nenhum usuário para "${query}".` : "Digite algo para buscar usuários."}
                </p>
                <p className="text-sm text-gray-500">Tente buscar por outros termos ou verifique a ortografia.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Search className="w-5 h-5 text-white animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Carregando busca...</h2>
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
