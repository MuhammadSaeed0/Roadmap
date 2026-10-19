export type OrderStatus = 'Draft' | 'Submitted' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderLineDto {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderDto {
  id: number;
  createdAt: string;      // ISO 8601
  status: OrderStatus;
  total: number;
  lines: OrderLineDto[];
}

export type CreateOrderRequest = Omit<OrderDto, 'id' | 'createdAt' | 'status' | 'total' | 'lines'> & {
  lines: Pick<OrderLineDto, 'productId' | 'quantity'>[];   // the server looks up names and prices
};
