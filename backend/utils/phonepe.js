import crypto from 'crypto';
import fetch from 'node-fetch';

const DEFAULT_PHONEPE_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';

const ensurePhonePeConfig = () => {
  const missing = [];

  if (!process.env.PHONEPE_MERCHANT_ID) {
    missing.push('PHONEPE_MERCHANT_ID');
  }

  if (!process.env.PHONEPE_SALT_KEY) {
    missing.push('PHONEPE_SALT_KEY');
  }

  if (!process.env.PHONEPE_SALT_INDEX) {
    missing.push('PHONEPE_SALT_INDEX');
  }

  if (missing.length > 0) {
    throw new Error(
      `PhonePe configuration missing: ${missing.join(', ')}. Please add them to your environment variables.`
    );
  }
};

export const isPhonePeConfigured = () => {
  try {
    ensurePhonePeConfig();
    return true;
  } catch (error) {
    return false;
  }
};

const getPhonePeBaseUrl = () => process.env.PHONEPE_BASE_URL || DEFAULT_PHONEPE_BASE_URL;

const buildChecksum = (payload, path) => {
  const saltKey = process.env.PHONEPE_SALT_KEY;
  const saltIndex = process.env.PHONEPE_SALT_INDEX;

  const stringToSign = `${payload}${path}${saltKey}`;
  const checksum = crypto.createHash('sha256').update(stringToSign).digest('hex');

  return `${checksum}###${saltIndex}`;
};

export const initiatePhonePePayment = async ({
  transactionId,
  amount,
  userId,
  customerName,
  customerPhone,
}) => {
  ensurePhonePeConfig();

  const merchantId = process.env.PHONEPE_MERCHANT_ID;
  const baseUrl = getPhonePeBaseUrl();
  const path = '/pg/v1/pay';

  const payload = {
    merchantId,
    merchantTransactionId: transactionId,
    merchantUserId: String(userId),
    amount: Math.round(Number(amount) * 100),
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };

  if (process.env.PHONEPE_REDIRECT_URL) {
    payload.redirectUrl = process.env.PHONEPE_REDIRECT_URL;
    payload.redirectMode = 'POST';
  }

  if (process.env.PHONEPE_CALLBACK_URL) {
    payload.callbackUrl = process.env.PHONEPE_CALLBACK_URL;
  }

  if (customerName) {
    payload.customerName = customerName;
  }

  if (customerPhone) {
    payload.mobileNumber = customerPhone;
  }

  if (Number.isNaN(payload.amount) || payload.amount <= 0) {
    throw new Error('Invalid amount passed to PhonePe payment initiation');
  }

  const requestPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const checksum = buildChecksum(requestPayload, path);

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
    },
    body: JSON.stringify({ request: requestPayload }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PhonePe payment initiation failed: ${response.status} ${errorText}`);
  }

  const body = await response.json();

  if (!body.success) {
    throw new Error(body.message || 'Unable to initiate PhonePe payment');
  }

  const instrumentResponse = body.data?.instrumentResponse || {};
  const checkoutUrl = instrumentResponse.redirectInfo?.url || instrumentResponse.intentUrl;

  if (!checkoutUrl) {
    throw new Error('PhonePe did not return a checkout or intent URL');
  }

  return {
    transactionId,
    checkoutUrl,
    rawResponse: body,
  };
};

export const fetchPhonePePaymentStatus = async (transactionId) => {
  ensurePhonePeConfig();

  const merchantId = process.env.PHONEPE_MERCHANT_ID;
  const baseUrl = getPhonePeBaseUrl();
  const path = `/pg/v1/status/${merchantId}/${transactionId}`;
  const checksum = buildChecksum('', path);

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      'X-VERIFY': checksum,
      'X-MERCHANT-ID': merchantId,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PhonePe status check failed: ${response.status} ${errorText}`);
  }

  return response.json();
};
