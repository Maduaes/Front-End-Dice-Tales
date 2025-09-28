import { Routes } from "react-router-dom";
import { MainRoutes } from "./MainRoutes.jsx";
import { AuthRoutes } from "./AuthRoutes.jsx";


const AppRoutes = () => {
  return (
    <Routes>
      {MainRoutes}
      {AuthRoutes}
    </Routes>
  )
}

export default AppRoutes;