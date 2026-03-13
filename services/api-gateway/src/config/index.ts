import env from "dotenv";
import { getConsulJson } from "./consul";

env.config();

export type GatewayConfig = {
  port: number;
  userServiceUrl: string;
  orderServiceUrl: string;
};

export async function loadGatewayConfig(): Promise<GatewayConfig> {
  const fallback: GatewayConfig = {
    port: Number(process.env.PORT) || 3000,
    userServiceUrl:
      process.env.USER_SERVICE_URL || "http://user-service:1000",
    orderServiceUrl:
      process.env.ORDER_SERVICE_URL || "http://order-service:2000",
  };

  try {
    const service = await getConsulJson<Partial<GatewayConfig>>("api-gateway");
    if (!service) return fallback;

    return {
      port: service.port ?? fallback.port,
      userServiceUrl: service.userServiceUrl ?? fallback.userServiceUrl,
      orderServiceUrl: service.orderServiceUrl ?? fallback.orderServiceUrl,
    };
  } catch (error) {
    console.error("Failed to load config from Consul, using fallback:", error);
    return fallback;
  }
}
