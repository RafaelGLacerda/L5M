"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, User, Mail, Lock, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Estados para login
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })

  // Estados para registro
  const [registerData, setRegisterData] = useState({
    name: "",
    nickname: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Abordagem simplificada - obter todos os usuários
      const usersString = localStorage.getItem("registeredUsers")

      if (!usersString) {
        alert("Nenhum usuário registrado. Por favor, crie uma conta.")
        setIsLoading(false)
        return
      }

      // Converter para objeto JavaScript
      const users = JSON.parse(usersString)

      // Verificar se é um array
      if (!Array.isArray(users)) {
        console.error("Dados de usuários não estão em formato de array:", users)
        alert("Erro no formato dos dados. Por favor, tente novamente.")
        setIsLoading(false)
        return
      }

      // Normalizar o email de login (trim e lowercase)
      const normalizedLoginEmail = loginData.email.trim().toLowerCase()

      // Procurar o usuário pelo email (mostrando cada comparação)
      let foundUser = null
      console.log("=== PROCURANDO USUÁRIO ===")
      console.log("Email digitado:", `"${normalizedLoginEmail}"`)
      console.log("Emails registrados:")

      for (let i = 0; i < users.length; i++) {
        const user = users[i]
        const userEmail = user.email ? user.email.trim().toLowerCase() : ""

        console.log(`${i + 1}. "${userEmail}" ${userEmail === normalizedLoginEmail ? "✅ MATCH!" : "❌"}`)

        if (userEmail === normalizedLoginEmail) {
          foundUser = user
          console.log("Usuário encontrado:", foundUser)
          break
        }
      }

      if (!foundUser) {
        // Mostrar emails similares para ajudar o usuário
        const similarEmails = users.filter((user) => {
          const userEmail = user.email ? user.email.trim().toLowerCase() : ""
          return (
            userEmail.includes(normalizedLoginEmail.split("@")[0]) ||
            normalizedLoginEmail.includes(userEmail.split("@")[0])
          )
        })

        if (similarEmails.length > 0) {
          console.log(
            "Emails similares encontrados:",
            similarEmails.map((u) => u.email),
          )
          alert(`Email não encontrado. Você quis dizer: ${similarEmails[0].email}?`)
        } else {
          alert("Email não encontrado. Verifique suas credenciais ou crie uma conta.")
        }
        setIsLoading(false)
        return
      }

      // Verificar senha
      console.log("Verificando senha...")
      console.log("Senha digitada:", loginData.password)
      console.log("Senha salva:", foundUser.password)

      if (foundUser.password !== loginData.password) {
        alert("Senha incorreta. Tente novamente.")
        setIsLoading(false)
        return
      }

      // Login bem-sucedido
      const userToStore = {
        id: foundUser.id,
        name: foundUser.name,
        nickname: foundUser.nickname,
        email: foundUser.email,
        bio: foundUser.bio || "",
        avatar: foundUser.avatar || "/placeholder.svg?height=40&width=40",
        followers: foundUser.followers || 0,
        following: foundUser.following || 0,
        joinDate: foundUser.joinDate,
        totalViews: foundUser.totalViews || 0,
      }

      localStorage.setItem("currentUser", JSON.stringify(userToStore))
      console.log("✅ Login bem-sucedido:", userToStore)

      setIsLoading(false)

      // Limpar formulário
      setLoginData({ email: "", password: "" })

      router.push("/")
    } catch (error) {
      console.error("Erro no login:", error)
      alert("Erro ao fazer login. Tente novamente.")
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Validações
    if (registerData.password !== registerData.confirmPassword) {
      alert("As senhas não coincidem!")
      setIsLoading(false)
      return
    }

    if (registerData.nickname.length < 3) {
      alert("O nickname deve ter pelo menos 3 caracteres!")
      setIsLoading(false)
      return
    }

    if (registerData.password.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres!")
      setIsLoading(false)
      return
    }

    try {
      // Get existing users
      const registeredUsersString = localStorage.getItem("registeredUsers")
      const registeredUsers = registeredUsersString ? JSON.parse(registeredUsersString) : []

      // Normalizar o email para comparação
      const normalizedEmail = registerData.email.trim().toLowerCase()

      // Check if email already exists (case insensitive)
      if (registeredUsers.find((u) => (u.email || "").trim().toLowerCase() === normalizedEmail)) {
        alert("Este email já está cadastrado!")
        setIsLoading(false)
        return
      }

      // Check if nickname already exists (case insensitive)
      const normalizedNickname = registerData.nickname.trim().toLowerCase()
      if (registeredUsers.find((u) => (u.nickname || "").trim().toLowerCase() === normalizedNickname)) {
        alert("Este nickname já está em uso!")
        setIsLoading(false)
        return
      }

      // Create new user with complete data
      const newUser = {
        id: Date.now().toString(),
        name: registerData.name.trim(),
        nickname: normalizedNickname,
        email: normalizedEmail,
        password: registerData.password,
        bio: "",
        avatar: "/placeholder.svg?height=40&width=40",
        followers: 0,
        following: 0,
        totalViews: 0,
        joinDate: new Date().toISOString(),
      }

      // Save to registered users
      registeredUsers.push(newUser)
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers))
      console.log("✅ Usuário registrado com sucesso:", newUser)

      // Login the user automatically (without password)
      const userToStore = {
        id: newUser.id,
        name: newUser.name,
        nickname: newUser.nickname,
        email: newUser.email,
        bio: newUser.bio,
        avatar: newUser.avatar,
        followers: newUser.followers,
        following: newUser.following,
        totalViews: newUser.totalViews,
        joinDate: newUser.joinDate,
      }

      localStorage.setItem("currentUser", JSON.stringify(userToStore))
      console.log("✅ Usuário logado automaticamente:", userToStore)

      setIsLoading(false)

      // Clear form
      setRegisterData({
        name: "",
        nickname: "",
        email: "",
        password: "",
        confirmPassword: "",
      })

      // Redirect
      router.push("/")
    } catch (error) {
      console.error("Erro no registro:", error)
      alert("Erro ao criar conta. Tente novamente.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
              <Play className="w-7 h-7 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">L5M</h1>
              <p className="text-sm text-gray-600">Limit 5 Minutes</p>
            </div>
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Bem-vindo ao L5M</CardTitle>
            <CardDescription>Entre na sua conta ou crie uma nova para começar a compartilhar vídeos</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Criar Conta</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-nickname">Nickname</Label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-nickname"
                        type="text"
                        placeholder="seunickname"
                        value={registerData.nickname}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            nickname: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""),
                          })
                        }
                        className="pl-10"
                        required
                        minLength={3}
                        disabled={isLoading}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Apenas letras minúsculas e números. Mínimo 3 caracteres.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="pl-10"
                        required
                        minLength={6}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirmar Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
                    {isLoading ? "Criando conta..." : "Criar Conta"}
                  </Button>

                  {/* Botão temporário para corrigir email */}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => {
                      try {
                        const users = JSON.parse(localStorage.getItem("registeredUsers") || "[]")
                        if (users.length > 0) {
                          // Corrigir o email do primeiro usuário
                          users[0].email = "rafaellacerda2004@gmail.com" // com 2 L's
                          localStorage.setItem("registeredUsers", JSON.stringify(users))
                          alert("Email corrigido! Agora você pode fazer login com: rafaellacerda2004@gmail.com")
                          console.log("Email corrigido:", users[0])
                        }
                      } catch (error) {
                        console.error("Erro ao corrigir email:", error)
                      }
                    }}
                  >
                    🔧 Corrigir Email (Temporário)
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-600 hover:text-red-600 transition-colors">
            ← Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  )
}
