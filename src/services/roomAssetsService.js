import api from './api'

export const getRoomAssets = async (roomId) => {
  const response = await api.get(`/rooms/assets/${roomId}`)
  return response.data
}

export const getRoomTabletop = async (roomId, pageId) => {
  const response = await api.get(`/rooms/tabletop/${roomId}`, {
    params: pageId == null ? undefined : { page_id: pageId },
  })
  return response.data
}

export const uploadRoomAsset = async (roomId, file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.patch(`/rooms/upload/asset/${roomId}`, formData)
  return response.data
}
