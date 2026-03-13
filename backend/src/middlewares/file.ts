import { Request } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { UPLOAD_PATH_TEMP } from '../config';

const tempDir = path.join(__dirname, '..', '..', 'public', UPLOAD_PATH_TEMP);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: { mimetype: string },
  cb: multer.FileFilterCallback,
) => {
  const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Недопустимый тип файла'));
  }
};

const fileMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export default fileMiddleware;
