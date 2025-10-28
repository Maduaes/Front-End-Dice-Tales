import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useRoutes } from 'react-router-dom';
import { refresh } from './auth/services/authService.js';
import appRoutes from './routes/appRoutes';

const App = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)

  const element = useRoutes(appRoutes)

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true)
        await refresh()
      } catch {
        setLoading(false)
        if(location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login', {replace: true} )
        }
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [navigate])

  if (loading) {
    return <div>Carregando...</div> // spinner ou algo assim depois faço
  }

  return element
}

export default App
