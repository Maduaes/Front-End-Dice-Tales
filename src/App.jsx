import './App.css';

import { Route, Routes } from 'react-router-dom';

import Home from './features/home/Home';
import Teste from './features/home/Teste';
import Layout from './layout/Layout';

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Layout />}>
          <Route index element={<Home />} />
          <Route path='/teste' element={<Teste />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
