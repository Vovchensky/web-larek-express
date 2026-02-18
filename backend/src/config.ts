import dotenv from 'dotenv';

dotenv.config();

const {
  PORT = 3000,
  DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek',
  AUTH_ACCESS_TOKEN_SECRET = 'access-secret-key',
  AUTH_REFRESH_TOKEN_SECRET = 'refresh-secret-key',
  AUTH_ACCESS_TOKEN_EXPIRY = '10m',
  AUTH_REFRESH_TOKEN_EXPIRY = '7d',
  UPLOAD_PATH = 'images',
  UPLOAD_PATH_TEMP = 'temp',
} = process.env;

export {
  PORT,
  DB_ADDRESS,
  AUTH_ACCESS_TOKEN_SECRET,
  AUTH_REFRESH_TOKEN_SECRET,
  AUTH_ACCESS_TOKEN_EXPIRY,
  AUTH_REFRESH_TOKEN_EXPIRY,
  UPLOAD_PATH,
  UPLOAD_PATH_TEMP,
};
