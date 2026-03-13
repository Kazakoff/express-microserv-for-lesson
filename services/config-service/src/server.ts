import cors from "cors";
import env from "dotenv";
import morgan from "morgan";
import express, { Request, Response } from "express";
import { getConfig } from "./config";

env.config();

const server = express();
const PORT = process.env.PORT || 6000;

server.use(express.json());
server.use(
  cors({
    origin: "*",
  })
);
server.use(morgan("dev"));

server.get("/config/:service", (req: Request, res: Response) => {
  const service = req.params.service as
    | "api-gateway"
    | "user-service"
    | "order-service"
    | "payment-service"
    | "notification-service"
    | "all";

  try {
    const config = getConfig(service);
    res.status(200).json({ success: true, data: config });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid service name",
    });
  }
});

server.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Config service is running",
  });
});

server.listen(PORT, () => {
  console.log(`Config service is running on port ${PORT}`);
});

