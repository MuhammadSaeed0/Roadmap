export interface ProductDto {
  readonly id: number;
  name: string;
  price: number;
  categoryId: number;
  description?: string;          // optional
}

// Derive request types instead of duplicating fields
export type CreateProductRequest = Omit<ProductDto, 'id'>;
export type UpdateProductRequest = Partial<CreateProductRequest>;
export type ProductListItem = Pick<ProductDto, 'id' | 'name' | 'price'>;

// Structural typing: no 'implements' needed
const p: ProductListItem = { id: 1, name: 'Mouse', price: 25 };
