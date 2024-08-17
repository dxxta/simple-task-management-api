import express, { Application } from "express";
import { createServer } from "http";
import helmet from "helmet";
import cors from "cors";
import rateLimit, { MemoryStore } from "express-rate-limit";
import { testDBConnection } from "@src/config/db.mysql";
import TasksRoutes from "@routes/tasks.route";
import Logger from "@utils/logger";
import swaggerUI from "swagger-ui-express";
import docs from "./docs.json";

class Server {
  port: number = +(process.env.PORT ?? 8080);
  app: Application = express();
  server = createServer(this.app);
  async preload(): Promise<void> {
    await testDBConnection();
    this.app.use("/docs", swaggerUI.serve, swaggerUI.setup(docs));
  }
  async plugins(): Promise<void> {
    try {
      this.app.use(express.json());
      this.app.use(express.urlencoded({ extended: false }));
      this.app.use(helmet({ hidePoweredBy: true, frameguard: true }));
      this.app.use(
        cors({
          methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
          origin: "*", // []
        })
      );
      this.app.use(function (req?: any, res?: any, next?: any) {
        Logger.info(
          "request",
          `${req.url} with status ${req?.statusCode || 200}`
        );
        next();
      });
      this.app.use(
        rateLimit({
          windowMs: 2500, // 2.5s]
          handler: (request, response, next, options) =>
            response.status(options.statusCode).json({
              message:
                "Terlalu banyak request dari IP ini. Coba beberapa saat lagi.",
              success: false,
            }),
          max: 2,
          standardHeaders: true,
          store: new MemoryStore(),
        })
      );
    } catch (error) {
      Logger.error("server", `plugins failed : ${error}`);
    }
  }

  async routes(): Promise<void> {
    try {
      this.app.use("/tasks", TasksRoutes.router);
      this.app.use(
        "/ping",
        async (
          req: express.Request,
          res: express.Response,
          next: express.NextFunction
        ) => {
          return res.status(200).json({
            success: true,
            message: "pong!",
          });
        }
      );
      this.app.use((err: any, req: any, res: any, next: any) => {
        if (err.status === 400 && "body" in err) {
          Logger.error("request", ` ${err}`);
          return res
            .status(400)
            .send({ success: false, message: err?.message });
        }
        next();
      });
      this.app.get("*", (req: express.Request, res: express.Response) => {
        res.status(404).json({
          message: "endpoint not found",
          success: false,
        });
      });
    } catch (error: any) {
      Logger.error("error", error?.message);
    }
  }

  async initialize(): Promise<void> {
    await this.preload();
    await this.plugins();
    await this.routes();
    this.server.listen(this.port, () => {
      Logger.info("server", `connected to port http://localhost:${this.port}`);
    });
  }
}

new Server().initialize();
