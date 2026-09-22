import env from "dotenv";
import Stripe from "stripe";

env.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

export async function processPayment(
  orderId: string,
  userId: string,
  amount: number,
  item: string,
  cardNumber: string,
  expiryDate: string | Date
) {
  try {
    const expiry =
      expiryDate instanceof Date
        ? `${String(expiryDate.getUTCMonth() + 1).padStart(2, "0")}/${String(
            expiryDate.getUTCFullYear()
          ).slice(-2)}`
        : /^\d{4}-\d{2}-\d{2}/.test(expiryDate)
        ? (() => {
            const parsedExpiryDate = new Date(expiryDate);
            return `${String(parsedExpiryDate.getUTCMonth() + 1).padStart(
              2,
              "0"
            )}/${String(parsedExpiryDate.getUTCFullYear()).slice(-2)}`;
          })()
        : expiryDate;
    const [expMonth, expYear] = expiry
      .split("/")
      .map((part) => parseInt(part, 10));

    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        number: cardNumber,
        exp_month: expMonth,
        exp_year: expYear,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "inr",
      payment_method: paymentMethod.id,
      metadata: {
        orderId,
        userId,
        item,
      },
      confirm: true,
    });

    console.log(paymentIntent);
    return { success: true, paymentIntentId: paymentIntent.id };
  } catch (error: any) {
    console.error(`Payment failed for order ${orderId}:`, error.message);
    return { success: false, error: error.message };
  }
}
