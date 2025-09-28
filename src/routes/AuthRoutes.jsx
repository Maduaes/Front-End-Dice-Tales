import { Route } from 'react-router-dom'
import Login from '../auth/pages/Login'

export const AuthRoutes = (
  <Route>
    <Route path='/login' element={<Login />} />
  </Route>
) 