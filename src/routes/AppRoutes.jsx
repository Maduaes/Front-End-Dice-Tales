import { Routes } from "react-router-dom";
import { MainRoutes } from "./MainRoutes.jsx";
import { AuthRoutes } from "./authRoutes.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      {MainRoutes}
      {AuthRoutes}
    </Routes>
  )
}

export default AppRoutes;