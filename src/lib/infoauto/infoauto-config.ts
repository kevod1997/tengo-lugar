

export const INFOAUTO_API_URL = process.env.INFOAUTO_API_URL;
export const INFOAUTO_USERNAME = process.env.INFOAUTO_USERNAME;
export const INFOAUTO_PASSWORD = process.env.INFOAUTO_PASSWORD;

if (!INFOAUTO_USERNAME || !INFOAUTO_PASSWORD) {
  throw new Error('InfoAuto credentials are not set in the environment variables');
}

