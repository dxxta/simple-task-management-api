import {
  IsString,
  IsNotEmpty,
  validate,
  IsOptional,
  ValidateIf,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  IsEnum,
} from "class-validator";
import { Request } from "express";
import { IResponValidator } from ".";
import { statusType } from "@prisma/client";

function isDate(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isDate",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return value instanceof Date || new Date(value) instanceof Date;
        },
      },
    });
  };
}

const message = {
  required: "field required",
  string: "type must be a string",
};

class TasksSchema {
  isUpdate?: Boolean = false;

  @ValidateIf((x) => x.isUpdate == true)
  @IsNotEmpty({
    message: message.required,
  })
  @IsString({
    message: message.string,
  })
  id?: string;

  @ValidateIf((x) => x.isUpdate == false || x.title)
  @IsNotEmpty({
    message: message.required,
  })
  @IsString({
    message: message.string,
  })
  title?: string;

  @ValidateIf((x) => x.isUpdate == false || x.description)
  @IsNotEmpty({
    message: message.required,
  })
  @IsString({
    message: message.string,
  })
  description?: string;

  @ValidateIf((x) => x.isUpdate == false || x.status)
  @IsNotEmpty({
    message: message.required,
  })
  @IsString({
    message: message.string,
  })
  @IsEnum(statusType)
  status?: string;

  @ValidateIf((x) => x.isUpdate == false || x.dueDate)
  @IsNotEmpty({
    message: message.required,
  })
  @isDate()
  dueDate?: Date;
}

export default async function TaskValidation(
  req: Request,
  isUpdate: Boolean = false
): Promise<IResponValidator<TasksSchema>> {
  let task: TasksSchema = new TasksSchema();
  task.isUpdate = isUpdate;
  task.id = req.body.id;
  task.title = req.body.title;
  task.description = req.body.description;
  task.status = req.body.status;
  task.dueDate = req.body.dueDate;
  return {
    payload: task,
    validate: await validate(task, { validationError: { target: false } }).then(
      (errors) => {
        if (errors.length > 0) {
          return Object.assign(
            {},
            ...errors?.map((it) => ({
              [it.property]:
                (it.constraints && Object.values(it.constraints)) || [],
            }))
          );
        }
        return [];
      }
    ),
  };
}
