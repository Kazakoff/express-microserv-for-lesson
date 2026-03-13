import env from "dotenv";

env.config();

type ServiceName =
  | "api-gateway"
  | "user-service"
  | "order-service"
  | "payment-service"
  | "notification-service";

type ConfigMap = Record<string, unknown>;

const baseConfig: ConfigMap = {
  kafkaBrokers: process.env.KAFKA_BROKERS || "kafka:9092",
};

const serviceConfigs: Record<ServiceName, ConfigMap> = {
  "api-gateway": {
    port: Number(process.env.API_GATEWAY_PORT) || 3000,
    userServiceUrl:
      process.env.USER_SERVICE_URL || "http://user-service:1000",
    orderServiceUrl:
      process.env.ORDER_SERVICE_URL || "http://order-service:2000",
  },
  "user-service": {
    port: Number(process.env.USER_SERVICE_PORT) || 1000,
    databaseUrl: process.env.USER_DATABASE_URL,
  },
  "order-service": {
    port: Number(process.env.ORDER_SERVICE_PORT) || 2000,
    databaseUrl: process.env.ORDER_DATABASE_URL,
  },
  "payment-service": {
    port: Number(process.env.PAYMENT_SERVICE_PORT) || 4000,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    userServiceUrl:
      process.env.USER_SERVICE_URL || "http://user-service:1000",
    apiGatewayUrl:
      process.env.API_GATEWAY_URL || "http://api-gateway:3000",
  },
  "notification-service": {
    port: Number(process.env.NOTIFICATION_SERVICE_PORT) || 5000,
    resendApiKey: process.env.RESEND_API_KEY,
  },
};

export function getConfig(service: ServiceName | "all") {
  if (service === "all") {
    return {
      base: baseConfig,
      services: serviceConfigs,
    };
  }

  return {
    base: baseConfig,
    service: serviceConfigs[service],
  };
}

