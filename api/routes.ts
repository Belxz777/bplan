import { planRoutes } from "./ends/plans";
import { taskRoutes } from "./ends/tasks";

export const routes = {
  ...planRoutes,
  ...taskRoutes
};