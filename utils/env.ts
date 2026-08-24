/*
 * Environment utilities for Playwright tests
 */

export const TEST_BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';
export const ADMIN_ENDPOINT = process.env.ADMIN_ENDPOINT || '';
export const MAILTRAP_API_KEY = process.env.MAILTRAP_API_KEY || '';
export const PAYMENT_SANDBOX_KEY = process.env.PAYMENT_SANDBOX_KEY || '';

export default {
  TEST_BASE_URL,
  ADMIN_ENDPOINT,
  MAILTRAP_API_KEY,
  PAYMENT_SANDBOX_KEY
};
