import "server-only";
import { enquiry } from "../enquiry/service";
import { letflows } from "../letflows/service";
import { staffmain } from "../staffmain/service";

/** Every lead-capture section, keyed by its URL slug (/staffmain, /letflows, /enquiry). */
export const PRODUCTS = { staffmain, letflows, enquiry } as const;
export type ProductKey = keyof typeof PRODUCTS;

export const getProduct = (key: string) => (key in PRODUCTS ? PRODUCTS[key as ProductKey] : null);
