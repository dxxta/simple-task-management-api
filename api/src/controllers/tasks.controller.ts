import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "@src/utils/error";
import { statusType } from "@prisma/client";
import { intoSqlDate } from "@src/utils/date";
import { v4 } from "uuid";
import dbClient from "@config/db.mysql";
import TaskValidation from "@src/validations/task.validation";

export default class TasksController {
  static readonly tableName: string = "Tasks";

  static async getAll(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const { title = null, dueDate = null, page = 1, limit = 10 } = req.query;
      let status = req.query.status;

      if (status && String(status) in statusType) {
        status = statusType[status as keyof typeof statusType];
      }

      const filter = {
        skip: (+page - 1) * +limit,
        take: +limit,
        where: {
          ...(!!title && {
            title: {
              contains: title as string,
            },
          }),
          ...(!!dueDate && {
            dueDate: {
              equals: new Date(dueDate as string),
            },
          }),
          ...(!!status && {
            status: {
              equals: status as unknown as statusType,
            },
          }),
        },
      };

      const executed = await dbClient.$transaction([
        dbClient.tasks.findMany(filter),
        dbClient.tasks.count({ ...filter, take: undefined }),
      ]);

      res.status(200).json({
        success: true,
        message: "",
        result: executed[0],
        count: executed[1],
        pagesLength: Math.ceil(executed[1] / +limit),
      });
    } catch (error) {
      ErrorHandler(error as any, req, res, next);
    }
  }

  static async getById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const id = req.params.id;
      const query = await dbClient.tasks.findFirst({
        where: {
          id,
        },
      });

      if (!query) {
        return res.status(404).json({
          message: `task with id ${id} not found`,
        });
      }

      res.status(200).json({
        success: true,
        message: "",
        result: query,
      });
    } catch (error) {
      ErrorHandler(error as any, req, res, next);
    }
  }

  static async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const validatedBody = await TaskValidation(req);
      if (Object.values(validatedBody.validate).length > 0) {
        return res.status(400).json({
          success: false,
          message: "please check again",
          result: validatedBody.validate,
        });
      }

      const id = v4();
      await dbClient.$queryRawUnsafe(
        `INSERT INTO ${
          TasksController.tableName
        } (id, title, description, status, dueDate) VALUES ('${id}', '${
          validatedBody.payload.title
        }', '${validatedBody.payload.description}', '${
          validatedBody.payload.status
        }', '${intoSqlDate(validatedBody.payload.dueDate as Date)}')`
      );

      res.status(201).json({
        success: true,
        message: "successfully create a task",
        result: {
          id,
          ...JSON.parse(JSON.stringify(validatedBody.payload)),
        },
      });
    } catch (error) {
      ErrorHandler(error as any, req, res, next);
    }
  }

  static async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const isReturnOriginal = req.query.returnOriginal;
      req.body.id = req.params.id ?? req.body.id;
      const validatedBody = await TaskValidation(req, true);
      if (Object.values(validatedBody.validate).length > 0) {
        return res.status(400).json({
          success: false,
          message: "please check again",
          result: validatedBody.validate,
        });
      }

      let resTaskById = await dbClient.tasks.findFirst({
        where: {
          id: validatedBody.payload.id,
        },
      });

      if (!resTaskById) {
        return res.status(404).json({
          message: `task with id ${validatedBody.payload.id} not found`,
        });
      }

      let result;
      let queryString = `UPDATE ${TasksController.tableName}`;
      (function query_inject() {
        const SET = "SET";
        delete validatedBody.payload.isUpdate;
        for (const [key, value] of Object.entries(validatedBody.payload)) {
          if (key?.includes("id") || key?.includes("isUpdate") || !value)
            continue;
          if (!queryString?.includes(SET)) {
            queryString = queryString.concat(" ", SET);
          }
          queryString = queryString.concat(" ", `${key} = '${value}',`);
        }
        queryString = queryString.concat(" ", `updatedAt = '${intoSqlDate()}'`);
        queryString += ` WHERE id = '${validatedBody.payload.id}'`;
      })();

      await dbClient.$queryRawUnsafe(queryString);

      if (isReturnOriginal) {
        result = {
          ...JSON.parse(JSON.stringify(resTaskById)),
          ...JSON.parse(JSON.stringify(validatedBody.payload)),
        };
      } else {
        result = JSON.parse(JSON.stringify(validatedBody.payload));
      }

      res.status(201).json({
        success: true,
        message: `successfully updating task with id ${validatedBody.payload.id}`,
        result,
      });
    } catch (error) {
      ErrorHandler(error as any, req, res, next);
    }
  }

  static async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      const id = req.params.id;

      let resTaskById = await dbClient.tasks.findUnique({
        where: {
          id,
        },
      });

      if (!resTaskById) {
        return res.status(404).json({
          message: `task with id ${id} not found`,
        });
      }

      await dbClient.tasks.delete({
        where: {
          id,
        },
      });

      res.status(201).json({
        success: true,
        message: `successfully deleting task with id ${id}`,
      });
    } catch (error) {
      ErrorHandler(error as any, req, res, next);
    }
  }
}
