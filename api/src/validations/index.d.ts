import {} from "class-validator";

export interface IResponValidator<T> {
  validate: [any];
  payload: T;
}
