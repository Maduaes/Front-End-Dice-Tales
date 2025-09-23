import { Route, Routes } from "react-router-dom";
import Layout from "../layout/Layout";
import Home from "../features/home/Home";
import Teste from "../features/home/Teste";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<Home />} />
        <Route path='teste' element={<Teste />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes;