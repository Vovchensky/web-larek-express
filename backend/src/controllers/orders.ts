import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import validator from 'validator';
import mongoose from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    if (!payment || !['card', 'online'].includes(payment)) {
      throw new BadRequestError('Некорректный способ оплаты');
    }

    if (!email || !validator.isEmail(email)) {
      throw new BadRequestError('Некорректный email');
    }

    if (!phone) {
      throw new BadRequestError('Телефон обязателен');
    }

    if (!address) {
      throw new BadRequestError('Адрес обязателен');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new BadRequestError('Список товаров не может быть пустым');
    }

    const invalidIds = items.some(
      (id: string) => !mongoose.Types.ObjectId.isValid(id),
    );
    if (invalidIds) {
      throw new BadRequestError('Некорректный ID товара');
    }

    const products = await Product.find({ _id: { $in: items } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const allExist = items.every((id: string) => productMap.has(id));
    if (!allExist) {
      throw new NotFoundError('Некоторые товары не найдены');
    }

    const hasNullPrice = items.some(
      (id: string) => productMap.get(id)!.price === null,
    );
    if (hasNullPrice) {
      throw new BadRequestError('Некоторые товары не продаются');
    }

    const calculatedTotal = items.reduce(
      (sum: number, id: string) => sum + (productMap.get(id)!.price || 0),
      0,
    );
    if (calculatedTotal !== total) {
      throw new BadRequestError('Неверная сумма заказа');
    }

    res.json({ id: faker.string.uuid(), total });
  } catch (err) {
    next(err);
  }
};

export default createOrder;
