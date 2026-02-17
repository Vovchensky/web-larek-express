import fs from 'fs';
import path from 'path';
import { UPLOAD_PATH, UPLOAD_PATH_TEMP } from '../config';

const publicDir = path.join(__dirname, '..', '..', 'public');

export const moveFile = (fileName: string): string => {
  const tempPath = path.join(publicDir, fileName);
  const newFileName = fileName.replace(`/${UPLOAD_PATH_TEMP}/`, `/${UPLOAD_PATH}/`);
  const destPath = path.join(publicDir, newFileName);

  if (fs.existsSync(tempPath)) {
    fs.copyFileSync(tempPath, destPath);
    fs.unlinkSync(tempPath);
  }

  return newFileName;
};

export const deleteFile = (fileName: string) => {
  const filePath = path.join(publicDir, fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
