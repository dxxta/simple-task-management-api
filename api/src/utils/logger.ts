import moment from "moment";
export default abstract class Logger {
  static error(title: string, msg: string) {
    console.error(
      `${moment(Date.now()).format(
        "dddd, MMMM D, YYYY h:mm:ss A"
      )} [ERROR] [${title}] ${msg}`
    );
  }
  static nativeError(...data: any[]) {
    console.error(
      `${moment(Date.now()).format(
        "dddd, MMMM D, YYYY h:mm:ss A"
      )} [ERROR] ${data?.join("..")}`
    );
  }
  static info(title: string, msg: string) {
    console.info(
      `${moment(Date.now()).format(
        "dddd, MMMM D, YYYY h:mm:ss A"
      )} [INFO] [${title}] ${msg}`
    );
  }
}
