// Sample fixture data (non-secret). Tests should generate unique emails at runtime.
export const SAMPLE_USERS = {
  basic: {
    email: 'qa+basic@example.com',
    password: '<GENERATE_AT_RUNTIME>'
  },
  billing: {
    email: 'qa+billing@example.com',
    password: '<GENERATE_AT_RUNTIME>'
  },
  admin: {
    email: 'qa+admin@example.com',
    password: '<GENERATE_AT_RUNTIME>'
  }
};
