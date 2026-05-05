import api, { authApi } from "./api"

const normalizeUser = (user) => {
  if (!user) {
    return null
  }

  const profileImageUrl =
    user.profilepic_image_url?.trim() ||
    user.profilepic_image_image_url?.trim() ||
    null

  return {
    ...user,
    profilepic_image_url: profileImageUrl,
    profilepic_image_image_url: profileImageUrl,
    profileImageUrl,
  }
}

export const createUser = async (email, username, password) => {
  try {
    const response = await authApi.post("/users/", { email, username, password })
    return normalizeUser(response.data)
  } catch (error) {
    console.error(error || "Erro ao criar o usuário!")
    throw error
  }
}

export const getUser = async () => {
  const response = await api.get("/users/")
  return normalizeUser(response.data)
}

export const updateUser = async (payload) => {
  const response = await api.patch("/users/", payload)
  return normalizeUser(response.data)
}

export const uploadProfilePicture = async (file) => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await api.patch("/users/upload/profilepic", formData)
  return normalizeUser(response.data)
}
