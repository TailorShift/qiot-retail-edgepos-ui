export class Item {
    barcode: string;
    shortdesc: string;
    category: string;
    price: number;
    weight: number;
    sn?: string;

    constructor(barcode: string, shortdesc: string, category: string, price: number, weight: number, sn?: string) {
        this.barcode = barcode;
        this.shortdesc = shortdesc;
        this.category = category;
        this.price = price;
        this.weight = weight;
        this.sn = sn;
    }
}
export class Alert {
    subject: Item;
    message: string;

    constructor(subject: Item, message: string) {
        this.subject = subject;
        this.message = message;
    }
}
export class Coupon {
    code: string;
    
    constructor(code: string) {
        this.code = code;
    }
}

export class LoyaltyCard {
    loyaltyID: string;
    
    constructor(loyaltyID: string) {
        this.loyaltyID = loyaltyID;
    }
}
