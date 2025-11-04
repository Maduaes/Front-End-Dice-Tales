import mainRoutes from "./mainRoutes";
import authRoutes from "./authRoutes";
import tabletopRoutes from "./TabletopRoutes";

const appRoutes = [
  ...mainRoutes,
  ...authRoutes,
  ...tabletopRoutes
]

export default appRoutes;