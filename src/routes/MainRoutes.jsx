import Layout from "../layout/Layout";
import Home from "../features/home/pages/Home";
import Teste from "../features/home/Teste";
import SheetsPage from "../features/sheets/pages/SheetsPage";
import RoomPage from "../features/rooms/pages/RoomPage";
import { Navigate } from "react-router-dom";

const mainRoutes = [
  { path: '/rooms/:roomId', element: <RoomPage /> },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'sheets', element: <SheetsPage /> },
      { path: 'games', element: <Teste /> },
      { path: 'teste', element: <Navigate to="/games" replace /> },
    ]
  }
]

export default mainRoutes
