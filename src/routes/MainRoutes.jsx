import Layout from "../layout/Layout";
import Home from "../features/home/pages/Home";
import Teste from "../features/home/Teste";

const mainRoutes = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'teste', element: <Teste /> },
    ]
  }
]

export default mainRoutes