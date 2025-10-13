import { useEffect, useState } from 'react';
import AppRoutes from './routes/AppRoutes.jsx';
import { useNavigate } from 'react-router-dom';
import { refresh } from './auth/services/authService.js';

const App = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refresh()
      } catch {
        setLoading(true)
        // navigate('/login', {replace: true} )
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [navigate])

  if (loading) {
    return <div>Carregando...</div> // spinner ou algo assim depois faço
  }

  return (
    <AppRoutes />
  )
}

export default App
