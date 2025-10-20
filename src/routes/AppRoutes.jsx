import mainRoutes from "./mainRoutes";
import authRoutes from "./authRoutes";

const appRoutes = [
  ...mainRoutes,
  ...authRoutes
]

export default appRoutes;