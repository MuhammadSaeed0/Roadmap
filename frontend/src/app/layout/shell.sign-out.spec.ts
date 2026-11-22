import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { App } from '../app';
import { Account, AuthService } from '../core/auth.service';
import { ShellComponent } from './shell.component';

@Component({ template: 'home' }) class Home {}
@Component({ template: 'sign in' }) class SignIn {}
@Component({ template: 'notes' }) class Notes {}
@Component({ template: 'landing' }) class Landing {}

describe('Signing out', () => {
  it('leads to the front page, not to the sign-in form', async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([{ path: '', component: Home }, { path: 'sign-in', component: SignIn }, { path: 'notes', component: Notes }]),
        provideHttpClient(), provideHttpClientTesting(),
      ],
    });
    const auth = TestBed.inject(AuthService);
    auth.account.set({ id: 'u1', email: 'learner@example.com', fullName: 'Learner', status: 'Approved' } as Account);
    auth.ready.set(true);
    vi.spyOn(auth, 'signOut').mockImplementation(async () => { auth.signedOutByUser = true; auth.account.set(null); });

    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/notes');
    fixture.detectChanges();
    await fixture.whenStable();

    const shell = fixture.debugElement.query(By.directive(ShellComponent)).componentInstance as unknown as { signOut(): Promise<void> };
    await shell.signOut();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(router.url).toBe('/');
  });

  it('from the dashboard ("/") shows the landing page without a reload', async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        // As in app.routes.ts: signed out, "/" is the landing page; signed in, it is the dashboard.
        provideRouter([
          { path: '', pathMatch: 'full', canMatch: [() => !inject(AuthService).account()], component: Landing },
          { path: '', component: Home },
          { path: 'sign-in', component: SignIn },
        ]),
        provideHttpClient(), provideHttpClientTesting(),
      ],
    });
    const auth = TestBed.inject(AuthService);
    auth.account.set({ id: 'u1', email: 'learner@example.com', fullName: 'Learner', status: 'Approved' } as Account);
    auth.ready.set(true);
    vi.spyOn(auth, 'signOut').mockImplementation(async () => { auth.signedOutByUser = true; auth.account.set(null); });

    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('home');

    const shell = fixture.debugElement.query(By.directive(ShellComponent)).componentInstance as unknown as { signOut(): Promise<void> };
    await shell.signOut();
    for (let i = 0; i < 2; i++) { fixture.detectChanges(); await fixture.whenStable(); }

    expect(router.url).toBe('/');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('landing');
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('home');
  });

  it('still sends a learner whose session expired to sign-in, and back afterwards', async () => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([{ path: '', component: Home }, { path: 'sign-in', component: SignIn }, { path: 'notes', component: Notes }]),
        provideHttpClient(), provideHttpClientTesting(),
      ],
    });
    const auth = TestBed.inject(AuthService);
    auth.account.set({ id: 'u1', email: 'learner@example.com', fullName: 'Learner', status: 'Approved' } as Account);
    auth.ready.set(true);
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/notes');
    fixture.detectChanges();
    await fixture.whenStable();

    auth.sessionEnded(); // the API answered 401: the cookie expired
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toBe('/sign-in?returnUrl=%2Fnotes');
  });
});
