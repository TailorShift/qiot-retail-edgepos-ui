import { scanToObject } from "./scanner";
import { Item, Coupon, LoyaltyCard } from './types';

test('scanToObject tests', () => {
    expect(scanToObject('978')).toBeInstanceOf(Item);
    expect(scanToObject('c:OFF20')).toBeInstanceOf(Coupon);
    expect(scanToObject('c:OFF20')).toEqual(new Coupon("OFF20"));
    expect(scanToObject('b:987654321,d:Smoked Salmon,c:GROCERY,p:5.00,w:10.00,sn:87634576'))
        .toEqual(new Item("987654321", "Smoked Salmon", "GROCERY", 5.00, 10.00, "87634576"));
    expect(scanToObject('l:loyalty123')).toEqual(new LoyaltyCard("loyalty123"));
});