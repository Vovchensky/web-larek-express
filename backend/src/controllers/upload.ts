import { Request, Response, NextFunction } from 'express';
import BadRequestError from '../errors/bad-request-error';

const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new BadRequestError('Файл не загружен');
    }

    return res.json({
      fileName: `/temp/${req.file.filename}`,
      originalName: req.file.originalname,
    });
  } catch (err) {
    return next(err);
  }
};

export default uploadFile;
