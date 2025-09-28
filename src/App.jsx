import { useEffect, useState } from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import api, { setAccessToken } from './services/api.js';

const App = () => {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data } = await api.post("/auth/refresh")
        setAccessToken(data.accessToken)
      } catch (err) {
        console.error("Usuário não logado ou refresh falhou:", err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  if (loading) {
    return <div>Carregando...</div> // spinner ou algo assim
  }

  return (
    <AppRoutes />
  )
}

export default App
