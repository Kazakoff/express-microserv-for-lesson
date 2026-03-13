import env from "dotenv";
import morgan from "morgan";
import express, { NextFunction, Request, Response } from "express";
import { runConsumer } from "./utils/kafka";
import { loadNotificationServiceConfig } from "./config";

env.config();

async function bootstrap() {
  const config = await loadNotificationServiceConfig();

  const server = express();

  // run kafka consumer
  runConsumer();

  // middleware's
  server.use(express.json());
  server.use(morgan("dev"));

  // Health Check Route
  server.get("/", (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: "Notification service is running",
    });
  });

  // Error handling middleware
  server.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(err.stack);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  );

  server.listen(config.port, () => {
    console.log(
      `Notification service is running on port ${config.port}`
    );
  });
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap Notification service:", error);
  process.exit(1);
});
