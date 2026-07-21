export interface PostGenerationParams {
  businessName: string;
  industry: string;
  platform: string;
  tone: string;
  goal: string;
}

export interface ReviewResponseParams {
  businessName: string;
  vibe: string;
  reviewText: string;
  starRating: number;
}

export async function generatePosts(params: PostGenerationParams) {
  const response = await fetch('/api/generate-posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate posts');
  }

  return response.json();
}

export async function generateReviewResponses(params: ReviewResponseParams) {
  const response = await fetch('/api/generate-review-response', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate review responses');
  }

  return response.json();
}

export async function createRazorpayOrder(tier: 'pro' | 'agency') {
  const response = await fetch('/api/create-razorpay-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create order');
  }
  return response.json();
}

export async function verifyRazorpayPayment(data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  tier: string;
}) {
  const response = await fetch('/api/verify-razorpay-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to verify payment');
  }
  return response.json();
}

export async function getSubscriptionStatus(currentTier: string) {
  const response = await fetch('/api/subscription-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentTier })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get subscription status');
  }
  return response.json();
}
