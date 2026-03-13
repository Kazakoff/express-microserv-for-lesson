import cors from "cors";
import env from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import { runConsumer } from "./utils/kafka";
import { orderRoute } from "./routes/order.routes";
import { loadOrderServiceConfig } from "./config";

env.config();

async function bootstrap() {
  const config = await loadOrderServiceConfig();

  const server = express();

  // run kafka consumer
  runConsumer();

  // middleware's
  server.use(express.json());
  server.use(cookieParser());
  server.use(
    cors({
      origin: "http://localhost:3000",
    })
  );
  server.use(morgan("dev"));

  // order route
  server.use("/order", orderRoute);

  // Health Check Route
  server.get("/", (req: Request, res: Response) => {
    res
      .status(200)
      .json({ success: true, message: "Order service is running" });
  });

  // Error handling middleware
  server.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  });

  // 404 handler
  server.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
    });
  });

  server.listen(config.port, () => {
    console.log(`Order service is running on port ${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to bootstrap Order service:", error);
  process.exit(1);
});
