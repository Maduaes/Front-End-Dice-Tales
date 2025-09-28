import Layout from "../layout/Layout";
import Home from "../features/home/pages/Home";
import Teste from "../features/home/Teste";
import { Route } from "react-router-dom";

export const MainRoutes = (
  <Route path='/' element={<Layout />}>
    <Route index element={<Home />} />
    <Route path='teste' element={<Teste />} />
  </Route>
)