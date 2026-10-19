import Razorpay from 'razorpay';

let razorpayInstance: Razorpay | null = null;

export function getRazorpayClient(): Razorpay | null {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (key_id && key_secret && !key_id.includes('YourTestKey') && !key_id.includes('demo_mock')) {
    if (!razorpayInstance) {
      razorpayInstance = new Razorpay({
        key_id,
        key_secret
      });
    }
    return razorpayInstance;
  }
  return null;
}

export function isRazorpayConfigured(): boolean {
  return getRazorpayClient() !== null;
}
