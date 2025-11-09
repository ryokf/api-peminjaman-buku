import { config } from 'dotenv';

config({ path: `.env` });

export const {
    PORT,
    DATABASE_URL, 
    JWT_SECRET,
    JWT_EXPIRES_IN,
    // NODE_ENV,
    // SERVER_URL,
    //   DB_URI,
    //   ARCJET_ENV, ARCJET_KEY,
    //   QSTASH_TOKEN, QSTASH_URL,
    //   EMAIL_PASSWORD,
} = process.env;