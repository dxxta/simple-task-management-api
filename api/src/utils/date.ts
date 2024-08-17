export const intoSqlDate = (date: Date = new Date()) =>
  new Date(date).toISOString().slice(0, 19).replace("T", " ");
