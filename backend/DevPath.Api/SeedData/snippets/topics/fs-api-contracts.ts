// C#:  public record OrderDto(int Id, DateTime CreatedAt, OrderStatus Status, decimal Total, IReadOnlyList<OrderLineDto> Lines);
//      JSON options: camelCase + JsonStringEnumConverter

// TypeScript mirror of the same contract
export type OrderStatus = 'Draft' | 'Submitted' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderLineDto { productId: number; productName: string; quantity: number; unitPrice: number; }

export interface OrderDto {
  id: number;
  createdAt: string;          // ISO 8601: "2026-10-19T08:30:00Z"
  status: OrderStatus;        // enums travel as strings
  total: number;
  lines: OrderLineDto[];
}

// Errors follow RFC 7807 ProblemDetails
export interface ProblemDetails { status: number; title: string; code?: string; errors?: Record<string, string[]>; }
