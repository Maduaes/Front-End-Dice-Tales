import { Route } from 'react-router-dom'
import Login from '../auth/pages/Login'
import { Register } from '../auth/pages/Register'

export const AuthRoutes = (
  <Route>
    <Route path='/login' element={<Login />} />
    <Route path='/register' element={<Register />} />
  </Route>
) 