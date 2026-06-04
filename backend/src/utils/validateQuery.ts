import BadRequestError from "../errors/bad-request-error";
import { Request } from "express";

type Query = Request['query'];
type QueryValue = Query[string];

function isPlainString(value: QueryValue): value is string | undefined {
    return typeof value === 'string' || value === undefined;
}

export default function validateQuery(query: Query, allowedFields: string[]) {
    const allowedFieldsSet = new Set(allowedFields);

    Object.entries(query).forEach(([key, value]) => {
        if (
            !allowedFieldsSet.has(key) ||
            key.includes('$') ||
            key.includes('.')
        ) {
            throw new BadRequestError('Invalid query parameter');
        }
        if (!isPlainString(value)) {
            throw new BadRequestError('Invalid query parameter');
        }
    });
}