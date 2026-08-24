/*
 * dbHelper
 * Placeholder helpers for DB validation. Implementation must call a secure admin endpoint
 * which executes whitelisted SQL queries. Do NOT embed service_role keys in test code.
 */

export async function runReadOnlyQuery(query: string): Promise<any> {
  // TODO: implement admin endpoint call
  throw new Error('runReadOnlyQuery not implemented — implement admin endpoint client');
}

export async function cleanupTestData(identifier: string): Promise<void> {
  // TODO: implement teardown via admin endpoint
  return;
}
