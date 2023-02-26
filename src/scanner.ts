import { Item, Coupon, LoyaltyCard } from './types';

export function scanToObject(code: string): Item | Coupon | LoyaltyCard  {
    const mapped: Map<string, string> = new Map();
    const chunks = code.split(',');
    chunks.forEach((c) => {
        const [k, v] = c.split(':');
        mapped.set(k, v);
    });
    if (mapped.size === 1 && mapped.has('l')) {
        return new LoyaltyCard(mapped.get('l')!);
    }
    if (mapped.size === 1 && mapped.has('c')) {
        return new Coupon(mapped.get('c') ?? "void coupon");
    }
    if (mapped.has('b')) {
        const barcode = mapped.get('b')!;
        const shortdesc = mapped.get('d') ?? "Product ("+code+")";
        const category = mapped.get('c') ?? "MISC";
        const price = Number.parseFloat((mapped.get('p') ?? "3.99").toString());
        const weight = Number.parseFloat((mapped.get('w') ?? "1.00").toString());
        return new Item(barcode, shortdesc, category, price, weight, mapped.get('sn'));
    }
    return new Item(code, 'Product ('+code+')', "MISC", 3.99, 10);
}
