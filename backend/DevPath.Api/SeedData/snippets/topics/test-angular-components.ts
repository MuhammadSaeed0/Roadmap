import { TestBed } from '@angular/core/testing';
import { ProductCardComponent } from './product-card.component';

describe('ProductCardComponent', () => {
  it('shows "Out of stock" when stock is 0', async () => {
    const fixture = TestBed.createComponent(ProductCardComponent);
    fixture.componentRef.setInput('product', { id: 1, name: 'Mouse', price: 20, stock: 0 });
    await fixture.whenStable();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Out of stock');
  });

  it('emits the product id when Add is clicked', async () => {
    const fixture = TestBed.createComponent(ProductCardComponent);
    fixture.componentRef.setInput('product', { id: 7, name: 'Keyboard', price: 50, stock: 3 });
    const emitted: number[] = [];
    fixture.componentInstance.addToCart.subscribe(id => emitted.push(id));
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(emitted).toEqual([7]);
  });
});
