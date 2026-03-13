import env from "dotenv";
import { getConsulJson } from "./consul";

env.config();

export type NotificationServiceConfig = {
  port: number;
};

export async function loadNotificationServiceConfig(): Promise<NotificationServiceConfig> {
  const fallback: NotificationServiceConfig = {
    port: Number(process.env.PORT) || 5000,
  };

  try {
    const service =
      await getConsulJson<Partial<NotificationServiceConfig>>("notification-service");
    if (!service) return fallback;

    return {
      port: service.port ?? fallback.port,
    };
  } catch (error) {
    console.error(
      "Failed to load notification-service config from Consul, using fallback:",
      error
    );
    return fallback;
  }
}

