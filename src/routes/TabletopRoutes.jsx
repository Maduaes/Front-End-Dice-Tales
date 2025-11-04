import { Tabletop } from "../features/games/tabletop/Tabletop"

const tabletopRoutes = [
  {
    path: '/tabletop/:code',
    element: <Tabletop />,
  }
]

export default tabletopRoutes