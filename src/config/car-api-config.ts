

export const CAR_API_URL = process.env.CAR_API_URL;
export const CAR_API_USERNAME = process.env.CAR_API_USERNAME;
export const CAR_API_PASSWORD = process.env.CAR_API_PASSWORD;

if (!CAR_API_USERNAME || !CAR_API_PASSWORD) {
  throw new Error('Car Api credentials are not set in the environment variables');
}

