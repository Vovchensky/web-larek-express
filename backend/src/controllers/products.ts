import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import { moveFile } from '../helpers/file-utils';
import { UPLOAD_PATH_TEMP } from '../config';

export const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({});
    return res.json({ items: products, total: products.length });
  } catch (err) {
    return next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title, image, category, description, price,
    } = req.body;

    const data: Record<string, unknown> = {
      title, image, category, description, price,
    };

    if (data.image && typeof data.image === 'object') {
      const img = data.image as { fileName?: string; originalName?: string };
      if (img.fileName && img.fileName.startsWith(`/${UPLOAD_PATH_TEMP}/`)) {
        img.fileName = moveFile(img.fileName);
      }
    }

    const product = await Product.create(data);
    return res.status(201).json(product);
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(err.message));
    }
    if (err instanceof Error && err.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }
    return next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      title, image, category, description, price,
    } = req.body;

    const data: Record<string, unknown> = {};

    if (title !== undefined) data.title = title;
    if (image !== undefined) data.image = image;
    if (category !== undefined) data.category = category;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = price;

    if (data.image && typeof data.image === 'object') {
      const img = data.image as { fileName?: string; originalName?: string };
      if (img.fileName && img.fileName.startsWith(`/${UPLOAD_PATH_TEMP}/`)) {
        img.fileName = moveFile(img.fileName);
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      data,
      { new: true, runValidators: true },
    );

    if (!product) {
      throw new NotFoundError('Товар не найден');
    }

    return res.json(product);
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) {
      return next(new BadRequestError(err.message));
    }
    if (err instanceof Error && err.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким названием уже существует'));
    }
    return next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);

    if (!product) {
      throw new NotFoundError('Товар не найден');
    }

    return res.json(product);
  } catch (err) {
    return next(err);
  }
};
