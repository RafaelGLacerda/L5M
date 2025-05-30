"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, User, Mail, Edit3, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function EditProfilePage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const [profileData, setProfileData] = useState({
    name: "",
    nickname: "",
    email: "",
    bio: "",
    avatar: null,
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    // Verificar se usuário está logado
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/auth")
      return
    }

    try {
      const userData = JSON.parse(user)
      setCurrentUser(userData)
      setProfileData({
        name: userData.name,
        nickname: userData.nickname,
        email: userData.email,
        bio: userData.bio || "",
        avatar: null,
      })
      console.log("Dados do usuário carregados para edição:", userData)
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error)
      router.push("/auth")
    }
  }, [router])

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors({ ...errors, avatar: "Por favor, selecione uma imagem válida." })
        return
      }

      setProfileData({ ...profileData, avatar: file })
      setErrors({ ...errors, avatar: null })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!profileData.name.trim()) {
      newErrors.name = "O nome é obrigatório."
    }

    if (!profileData.nickname.trim()) {
      newErrors.nickname = "O nickname é obrigatório."
    } else if (profileData.nickname.length < 3) {
      newErrors.nickname = "O nickname deve ter pelo menos 3 caracteres."
    }

    if (!profileData.email.trim()) {
      newErrors.email = "O email é obrigatório."
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Por favor, insira um email válido."
    }

    // Verificar se nickname já existe (exceto o próprio usuário)
    try {
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      const nicknameExists = registeredUsers.find(
        (u) => u.nickname.toLowerCase() === profileData.nickname.toLowerCase() && u.id !== currentUser.id,
      )
      if (nicknameExists) {
        newErrors.nickname = "Este nickname já está em uso por outro usuário."
      }

      // Verificar se email já existe (exceto o próprio usuário)
      const emailExists = registeredUsers.find(
        (u) => u.email.toLowerCase() === profileData.email.toLowerCase() && u.id !== currentUser.id,
      )
      if (emailExists) {
        newErrors.email = "Este email já está em uso por outro usuário."
      }
    } catch (error) {
      console.error("Erro ao validar dados:", error)
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Simular delay de salvamento
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Criar URL do avatar se foi enviado um novo
      let avatarUrl = currentUser.avatar
      if (profileData.avatar) {
        avatarUrl = URL.createObjectURL(profileData.avatar)
      }

      // Dados atualizados do usuário
      const updatedUserData = {
        ...currentUser,
        name: profileData.name.trim(),
        nickname: profileData.nickname.toLowerCase().trim(),
        email: profileData.email.toLowerCase().trim(),
        bio: profileData.bio.trim(),
        avatar: avatarUrl,
      }

      console.log("Salvando dados atualizados:", updatedUserData)

      // Atualizar no localStorage - currentUser
      localStorage.setItem("currentUser", JSON.stringify(updatedUserData))

      // Atualizar no localStorage - registeredUsers
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
      const updatedUsers = registeredUsers.map((user) => {
        if (user.id === currentUser.id) {
          return {
            ...user,
            name: updatedUserData.name,
            nickname: updatedUserData.nickname,
            email: updatedUserData.email,
            bio: updatedUserData.bio,
            avatar: avatarUrl,
          }
        }
        return user
      })

      localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers))
      console.log("Usuários registrados atualizados:", updatedUsers)

      // Atualizar vídeos do usuário (se o nickname mudou)
      const allVideos = JSON.parse(localStorage.getItem("allVideos") || "[]")
      const updatedVideos = allVideos.map((video) => {
        if (video.userId === currentUser.id) {
          return {
            ...video,
            user: {
              ...video.user,
              name: updatedUserData.name,
              nickname: updatedUserData.nickname,
              avatar: avatarUrl,
            },
          }
        }
        return video
      })

      localStorage.setItem("allVideos", JSON.stringify(updatedVideos))
      console.log("Vídeos atualizados com novos dados do usuário")

      // Atualizar estado local
      setCurrentUser(updatedUserData)
      setIsLoading(false)
      setIsSaved(true)

      console.log("✅ Perfil atualizado com sucesso!")

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push(`/profile/${updatedUserData.nickname}`)
      }, 2000)
    } catch (error) {
      console.error("Erro ao salvar perfil:", error)
      alert("Erro ao salvar perfil. Tente novamente.")
      setIsLoading(false)
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

  if (isSaved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Save className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil Atualizado!</h2>
            <p className="text-gray-600 mb-4">Suas informações foram salvas com sucesso.</p>
            <p className="text-sm text-gray-500">Redirecionando para seu perfil...</p>
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
                  <Edit3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Editar Perfil</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Editar Perfil</h1>
          <p className="text-gray-600">Atualize suas informações pessoais e como você aparece na plataforma.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle>Foto do Perfil</CardTitle>
              <CardDescription>Escolha uma foto que represente você na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={profileData.avatar ? URL.createObjectURL(profileData.avatar) : currentUser.avatar}
                    />
                    <AvatarFallback className="text-2xl">{currentUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full cursor-pointer inline-flex items-center justify-center transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </label>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">Alterar foto</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Recomendamos uma imagem quadrada de pelo menos 200x200 pixels.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("avatar-upload").click()}
                    disabled={isLoading}
                  >
                    Escolher Arquivo
                  </Button>
                </div>
              </div>
              {errors.avatar && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600">{errors.avatar}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Suas informações básicas que aparecerão no seu perfil</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">@</span>
                  <Input
                    id="nickname"
                    type="text"
                    placeholder="seunickname"
                    value={profileData.nickname}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        nickname: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""),
                      })
                    }
                    className="pl-8"
                    disabled={isLoading}
                    minLength={3}
                  />
                </div>
                <p className="text-xs text-gray-500">Apenas letras minúsculas e números. Mínimo 3 caracteres.</p>
                {errors.nickname && <p className="text-sm text-red-600">{errors.nickname}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  placeholder="Conte um pouco sobre você, seus interesses e o que você gosta de compartilhar..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="min-h-[100px] resize-none"
                  disabled={isLoading}
                  maxLength={300}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Opcional - aparecerá no seu perfil público</span>
                  <span>{profileData.bio.length}/300</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview do Perfil</CardTitle>
              <CardDescription>Veja como seu perfil aparecerá para outros usuários</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="w-16 h-16">
                  <AvatarImage
                    src={profileData.avatar ? URL.createObjectURL(profileData.avatar) : currentUser.avatar}
                  />
                  <AvatarFallback className="text-xl">{profileData.name[0] || currentUser.name[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{profileData.name || "Seu Nome"}</h3>
                  <p className="text-sm text-gray-600 mb-2">@{profileData.nickname || "seunickname"}</p>
                  <p className="text-sm text-gray-700">{profileData.bio || "Sua biografia aparecerá aqui..."}</p>

                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <span>{currentUser.followers} seguidores</span>
                    <span>{currentUser.following} seguindo</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
