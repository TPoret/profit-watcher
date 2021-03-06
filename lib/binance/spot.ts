import { endpoint } from "./endpoint";

interface SpotOrder {
  readonly symbol: string; // "LTCBTC"
  readonly orderId: number; // 1,
  readonly orderListId: number; // Unless OCO, the value will always be -1
  readonly clientOrderId: string; // "myOrder1",
  readonly price: number; // "0.1",
  readonly origQty: number; // "1.0",
  readonly executedQty: number; // "0.0",
  readonly cummulativeQuoteQty: number; // "0.0",
  readonly status: string; // "NEW",
  readonly timeInForce: string; // "GTC",
  readonly type: string; // "LIMIT",
  readonly side: string; // "BUY",
  readonly stopPrice: number; // "0.0",
  readonly icebergQty: number; // "0.0",
  readonly time: Date; // 1499827319559,
  readonly updateTime: Date; // 1499827319559,
  readonly isWorking: boolean; // true,
  readonly origQuoteOrderQty: number; // "0.000000"
}

// TODO interesting endpoints
//  Daily account snapshot
//  Deposit history
//  Withdraw history
//  Asset dividend record
//  Asset detail
//  Account information
//  Lending account
//  Get purchase record
//  Get redemption record
//  Get interest history
//  Earnings list
//  Extra bonus list

export const allOrders = async (): Promise<SpotOrder[]> => {
  const res = await endpoint.get("/api/v3/allOrders");
  const data = (await res.data) as any[];
  return data.map((value) => {
    return {
      ...value,
      price: parseFloat(value.price),
      origQty: parseFloat(value.origQty),
      executedQty: parseFloat(value.executedQty),
      cummulativeQuoteQty: parseFloat(value.cummulativeQuoteQty),
      stopPrice: parseFloat(value.stopPrice),
      icebergQty: parseFloat(value.icebergQty),
      time: new Date(value.time),
      updateTime: new Date(value.updateTime),
      origQuoteOrderQty: parseFloat(value.origQuoteOrderQty),
    };
  });
};
