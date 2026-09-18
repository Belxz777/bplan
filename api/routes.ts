import { statsRoutes } from "./ends/dbinfo";
import { planRoutes } from "./ends/plans";
import { taskRoutes } from "./ends/tasks";
import { userRoutes } from "./ends/users";

export const routes = {
  ...planRoutes,
  ...taskRoutes,
  ...userRoutes,
  ...statsRoutes,
};