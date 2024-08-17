import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: ["query"] });

const testDBConnection = async () => {
  try {
    await prisma.$connect();
    console.info("successfully connected to database");
  } catch (error) {
    console.error("failed to connect database,", error);
  }
};

export { testDBConnection };
export default prisma;
