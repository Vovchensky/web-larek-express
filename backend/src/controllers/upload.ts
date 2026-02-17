import { Request, Response, NextFunction } from 'express';
import { UPLOAD_PATH_TEMP } from '../config';
import BadRequestError from '../errors/bad-request-error';

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new BadRequestError('Файл не загружен');
    }

    return res.json({
      fileName: `/${UPLOAD_PATH_TEMP}/${req.file.filename}`,
      originalName: req.file.originalname,
    });
  } catch (err) {
    return next(err);
  }
};

export default uploadFile;
