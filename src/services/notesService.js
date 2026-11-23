import api from './api'

export const createRoomNote = async (roomId, note) => {
  const response = await api.post('/notes/', {
    room_id: roomId,
    page_id: note.pageId,
    color: note.color,
    tittle: note.title,
    content: note.description,
    position_x: String(note.x),
    position_y: String(note.y),
  })
  return response.data
}

export const updateRoomNote = async (noteId, changes) => {
  const payload = {}
  if (Object.hasOwn(changes, 'title')) payload.tittle = changes.title
  if (Object.hasOwn(changes, 'description')) payload.content = changes.description
  if (Object.hasOwn(changes, 'color')) payload.color = changes.color
  if (Object.hasOwn(changes, 'x')) payload.position_x = String(changes.x)
  if (Object.hasOwn(changes, 'y')) payload.position_y = String(changes.y)
  if (Object.hasOwn(changes, 'width')) payload.width = String(changes.width)
  if (Object.hasOwn(changes, 'height')) payload.height = String(changes.height)
  if (Object.hasOwn(changes, 'folder_id')) payload.folder_id = changes.folder_id
  if (Object.hasOwn(changes, 'colors_hidden')) payload.colors_hidden = changes.colors_hidden
  if (Object.hasOwn(changes, 'colors_centered')) payload.colors_centered = changes.colors_centered
  const response = await api.patch(`/notes/${noteId}`, payload)
  return response.data
}

export const deleteRoomNote = (noteId) => api.delete(`/notes/${noteId}`)

export const createRoomNoteFolder = async (roomId) => {
  const response = await api.post('/notes/folders', { room_id: roomId })
  return response.data
}

export const renameRoomNoteFolder = async (folderId, name) => {
  const response = await api.patch(`/notes/folders/${folderId}`, { name })
  return response.data
}
