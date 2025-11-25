import { NextFunction, Response } from 'express';
import { ExpressRequestInterface } from '../interface/ExpressRequestInterface';
import { UnAuthorizedError } from '../errors/UnAuthorizedError';

/**
 * Yetkilendirme kontrolü yapan bir middleware fabrika fonksiyonu.
 * @param {string} requiredAction - Gerekli olan iznin eylem adı (örn: "create_organisation").
 * @returns Express middleware fonksiyonu.
 */
export const AuthorizationMiddleware = (requiredAction: string) => {
    return (
        req: ExpressRequestInterface,
        res: Response,
        next: NextFunction
    ) => {
        try {
            if (!req.user) {
                return next(new UnAuthorizedError('Authentication required.'));
            }

            // AuthenticationMiddleware'de eklenen izinleri kontrol et.
            const hasPermission = req.user.permissions?.includes(requiredAction);

            if (hasPermission) {
                return next();
            }

            return next(new UnAuthorizedError('You do not have permission to perform this action.'));
        } catch (err) {
            next(new UnAuthorizedError('An error occurred during authorization.'));
        }
    };
};

