import env from "dotenv";
import { getConsulJson } from "./consul";

env.config();

export type PaymentServiceConfig = {
  port: number;
  apiGatewayUrl: string;
};

export async function loadPaymentServiceConfig(): Promise<PaymentServiceConfig> {
  const fallback: PaymentServiceConfig = {
    port: Number(process.env.PORT) || 4000,
    apiGatewayUrl:
      process.env.API_GATEWAY_URL || "http://api-gateway:3000",
  };

  try {
    const service =
      await getConsulJson<Partial<PaymentServiceConfig>>("payment-service");
    if (!service) return fallback;

    return {
      port: service.port ?? fallback.port,
      apiGatewayUrl: service.apiGatewayUrl ?? fallback.apiGatewayUrl,
    };
  } catch (error) {
    console.error(
      "Failed to load payment-service config from Consul, using fallback:",
      error
    );
    return fallback;
  }
}

