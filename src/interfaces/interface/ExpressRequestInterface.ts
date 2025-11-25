import { Request } from "express";
import {UserDocument} from "../../infrastructure/databases/drizzle/model/UserModel";

export interface ExpressRequestInterface extends Request {
  user?: UserDocument & { permissions?: string[] };
}
