import { authApi } from "../../services/api"

export const login = async (email, password) => {
  const formData = new URLSearchParams()
  formData.set("username", email)
  formData.set("password", password)

  const { data } = await authApi.post("/auth/login/", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })

  return data
}

export const refresh = async () => {
  try {
    const { data } = await authApi.post("/auth/refresh/")
    return data
  } catch (error) {
    console.warn("Usuário não logado ou refresh falhou:", error)
    throw error
  }
}

export const logout = async () => {
  await authApi.post("/auth/logout/")
}
