"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Play, Heart, MessageCircle, Eye, UserPlus, Users, Video, Edit3, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(null)
  const [profileUser, setProfileUser] = useState(null)
  const [userVideos, setUserVideos] = useState([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState("videos")

  useEffect(() => {
    // Verificar usuário logado
    const user = localStorage.getItem("currentUser")
    if (user) {
      try {
        const userData = JSON.parse(user)
        setCurrentUser(userData)
        console.log("Current user loaded:", userData) // Debug
      } catch (error) {
        console.error("Error parsing current user:", error) // Debug
      }
    }

    // Buscar usuário do perfil
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    console.log("All registered users:", registeredUsers) // Debug
    console.log("Looking for nickname:", params.nickname) // Debug

    const foundUser = registeredUsers.find((u) => u.nickname === params.nickname)
    console.log("Found profile user:", foundUser) // Debug

    if (foundUser) {
      // Garantir que o usuário tenha todas as propriedades necessárias
      const completeUser = {
        ...foundUser,
        totalViews: foundUser.totalViews || 0,
        followers: foundUser.followers || 0,
        following: foundUser.following || 0,
        bio: foundUser.bio || "",
      }

      setProfileUser(completeUser)

      // Buscar vídeos do usuário
      const allVideos = JSON.parse(localStorage.getItem("allVideos") || "[]")
      const videos = allVideos.filter((v) => v.userId === foundUser.id)
      console.log("User videos found:", videos) // Debug
      setUserVideos(videos)
    } else {
      console.log("User not found with nickname:", params.nickname) // Debug
    }
  }, [params.nickname])

  const handleFollow = () => {
    if (!currentUser) {
      alert("Faça login para seguir usuários!")
      return
    }

    const newFollowState = !isFollowing
    setIsFollowing(newFollowState)

    // Atualizar contador de seguidores
    const updatedProfileUser = {
      ...profileUser,
      followers: newFollowState ? profileUser.followers + 1 : profileUser.followers - 1,
    }
    setProfileUser(updatedProfileUser)

    // Salvar no localStorage
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
    const updatedUsers = registeredUsers.map((u) => (u.id === profileUser.id ? updatedProfileUser : u))
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))

    // Salvar dados de seguimento
    const followData = JSON.parse(localStorage.getItem("followData") || "{}")
    if (!followData[currentUser.id]) followData[currentUser.id] = []

    if (newFollowState) {
      followData[currentUser.id].push(profileUser.id)
    } else {
      followData[currentUser.id] = followData[currentUser.id].filter((id) => id !== profileUser.id)
    }

    localStorage.setItem("followData", JSON.stringify(followData))
  }

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "há 1 dia"
    if (diffDays < 7) return `há ${diffDays} dias`
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`
    return `há ${Math.floor(diffDays / 30)} meses`
  }

  const formatJoinDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
    })
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Usuário não encontrado</h2>
          <Button onClick={() => router.push("/")}>Voltar ao início</Button>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser && currentUser.id === profileUser.id

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
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <Avatar className="w-32 h-32 mx-auto md:mx-0">
              <AvatarImage src={profileUser.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-3xl">{profileUser.name[0]}</AvatarFallback>
            </Avatar>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{profileUser.name}</h1>
                <Badge variant="secondary" className="w-fit mx-auto md:mx-0">
                  @{profileUser.nickname}
                </Badge>
              </div>

              <p className="text-gray-600 mb-4 max-w-2xl">{profileUser.bio}</p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{userVideos.length}</div>
                  <div className="text-sm text-gray-600">vídeos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{formatViews(profileUser.totalViews)}</div>
                  <div className="text-sm text-gray-600">visualizações</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profileUser.followers}</div>
                  <div className="text-sm text-gray-600">seguidores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{profileUser.following}</div>
                  <div className="text-sm text-gray-600">seguindo</div>
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-6">Membro desde {formatJoinDate(profileUser.joinDate)}</div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {isOwnProfile ? (
                  <>
                    <Button
                      onClick={() => router.push("/profile/edit")}
                      variant="outline"
                      className="flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Editar Perfil</span>
                    </Button>
                    <Button
                      onClick={() => router.push("/upload")}
                      className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
                    >
                      <Video className="w-4 h-4" />
                      <span>Novo Vídeo</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleFollow}
                      className={`flex items-center space-x-2 ${
                        isFollowing ? "bg-gray-600 hover:bg-gray-700" : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{isFollowing ? "Seguindo" : "Seguir"}</span>
                    </Button>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>Mensagem</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="videos" className="flex items-center space-x-2">
              <Video className="w-4 h-4" />
              <span>Vídeos ({userVideos.length})</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Sobre</span>
            </TabsTrigger>
            <TabsTrigger value="playlists" className="flex items-center space-x-2">
              <Play className="w-4 h-4" />
              <span>Playlists</span>
            </TabsTrigger>
          </TabsList>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-6">
            {userVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {userVideos.map((video) => (
                  <Card key={video.id} className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={video.thumbnail || "/placeholder.svg"}
                          alt={video.title}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
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

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{formatViews(video.views)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{video.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-4 h-4" />
                              <span>{video.comments}</span>
                            </div>
                          </div>
                          <span>{formatDate(video.uploadDate)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Video className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isOwnProfile ? "Você ainda não postou nenhum vídeo" : "Nenhum vídeo encontrado"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {isOwnProfile
                    ? "Comece criando seu primeiro vídeo e compartilhe com a comunidade!"
                    : "Este usuário ainda não publicou nenhum vídeo."}
                </p>
                {isOwnProfile && (
                  <Button onClick={() => router.push("/upload")} className="bg-red-600 hover:bg-red-700">
                    Criar Primeiro Vídeo
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sobre {profileUser.name}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Biografia</h4>
                    <p className="text-gray-600">{profileUser.bio}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Estatísticas</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total de vídeos:</span>
                          <span className="font-medium">{userVideos.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total de visualizações:</span>
                          <span className="font-medium">{formatViews(profileUser.totalViews)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Seguidores:</span>
                          <span className="font-medium">{profileUser.followers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Seguindo:</span>
                          <span className="font-medium">{profileUser.following}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informações</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Membro desde:</span>
                          <span className="font-medium">{formatJoinDate(profileUser.joinDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nickname:</span>
                          <span className="font-medium">@{profileUser.nickname}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Playlists Tab */}
          <TabsContent value="playlists" className="space-y-6">
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma playlist criada</h3>
              <p className="text-gray-600">
                {isOwnProfile
                  ? "Crie playlists para organizar seus vídeos favoritos!"
                  : "Este usuário ainda não criou nenhuma playlist."}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
