import RouteExpress from ".";
import TasksController from "@controllers/tasks.controller";
import Logger from "@utils/logger";

class UserRoute extends RouteExpress {
  useRoutes() {
    try {
      this.router.get("/", TasksController.getAll);
      this.router.get("/:id", TasksController.getById);
      this.router.post("/", TasksController.create);
      this.router.patch("/", TasksController.update);
      this.router.patch("/:id", TasksController.update);
      this.router.delete("/:id", TasksController.delete);
    } catch (error: any) {
      Logger.error("tasks-routes", error?.message ?? error);
    }
  }
}

export default new UserRoute();
