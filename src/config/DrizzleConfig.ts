import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import dotenv from 'dotenv';
import * as schema from '../infrastructure/databases/drizzle/model';
import {DATABASE_URL} from "../interfaces/utils/constants";

dotenv.config();

const sql = neon(DATABASE_URL!);
export const db = drizzle(sql, { schema });