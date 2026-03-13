import env from "dotenv";
import { getConsulJson } from "./consul";

env.config();

export type OrderServiceConfig = {
    port: number;
};

export async function loadOrderServiceConfig(): Promise<OrderServiceConfig> {
    const fallback: OrderServiceConfig = {
        port: Number(process.env.PORT) || 2000,
    };

    try {
    const service = await getConsulJson<Partial<OrderServiceConfig>>("order-service");
    if (!service) return fallback;

        return {
            port: service.port ?? fallback.port,
        };
    } catch (error) {
        console.error(
      "Failed to load order-service config from Consul, using fallback:",
            error
        );
        return fallback;
    }
}

