import {
  Request, Response, NextFunction, CookieOptions,
} from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import ms from 'ms';
import User from '../models/user';
import {
  AUTH_ACCESS_TOKEN_SECRET,
  AUTH_REFRESH_TOKEN_SECRET,
  AUTH_ACCESS_TOKEN_EXPIRY,
  AUTH_REFRESH_TOKEN_EXPIRY,
} from '../config';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';
import ConflictError from '../errors/conflict-error';

const COOKIE_NAME = 'refreshToken';

const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue),
  path: '/',
};

const generateTokens = (_id: string) => {
  const accessToken = jwt.sign({ _id }, AUTH_ACCESS_TOKEN_SECRET, {
    expiresIn: AUTH_ACCESS_TOKEN_EXPIRY as ms.StringValue,
  });
  const refreshToken = jwt.sign({ _id }, AUTH_REFRESH_TOKEN_SECRET, {
    expiresIn: AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue,
  });
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash });
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    await User.findByIdAndUpdate(user._id, {
      $push: { tokens: { token: refreshToken } },
    });

    res.cookie(COOKIE_NAME, refreshToken, cookieOptions);
    return res.status(201).json({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken,
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes('E11000')) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    return next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +tokens');

    if (!user) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    await User.findByIdAndUpdate(user._id, {
      $push: { tokens: { token: refreshToken } },
    });

    res.cookie(COOKIE_NAME, refreshToken, cookieOptions);
    return res.json({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken,
    });
  } catch (err) {
    return next(err);
  }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: tokenFromCookie } = req.cookies;

    if (!tokenFromCookie) {
      throw new UnauthorizedError('Токен не предоставлен');
    }

    let payload: { _id: string };
    try {
      payload = jwt.verify(tokenFromCookie, AUTH_REFRESH_TOKEN_SECRET) as { _id: string };
    } catch {
      throw new UnauthorizedError('Невалидный или просроченный токен');
    }

    const user = await User.findOne({
      _id: payload._id,
      'tokens.token': tokenFromCookie,
    }).select('+tokens');

    if (!user) {
      throw new UnauthorizedError('Токен не найден');
    }

    await User.findByIdAndUpdate(user._id, {
      $pull: { tokens: { token: tokenFromCookie } },
    });

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    await User.findByIdAndUpdate(user._id, {
      $push: { tokens: { token: refreshToken } },
    });

    res.cookie(COOKIE_NAME, refreshToken, cookieOptions);
    return res.json({
      user: { email: user.email, name: user.name },
      success: true,
      accessToken,
    });
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: tokenFromCookie } = req.cookies;

    if (!tokenFromCookie) {
      throw new BadRequestError('Токен не предоставлен');
    }

    let payload: { _id: string };
    try {
      payload = jwt.verify(tokenFromCookie, AUTH_REFRESH_TOKEN_SECRET) as { _id: string };
    } catch {
      throw new UnauthorizedError('Невалидный токен');
    }

    const user = await User.findByIdAndUpdate(payload._id, {
      $pull: { tokens: { token: tokenFromCookie } },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    res.clearCookie(COOKIE_NAME, { path: '/' });
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};

export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id } = (req as any).user;
    const user = await User.findById(_id);

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    return res.json({
      user: { email: user.email, name: user.name },
      success: true,
    });
  } catch (err) {
    return next(err);
  }
};
