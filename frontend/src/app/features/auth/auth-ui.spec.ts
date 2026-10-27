import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiError } from '../../core/api-error';
import { safeReturnUrl } from '../../core/auth.guard';
import { I18nService } from '../../core/i18n/i18n.service';
import { authErrorKey, matchingPasswords, normaliseEmail, passwordStrength } from './auth-ui';

describe('passwordStrength', () => {
  const check = (value: string) => passwordStrength(new FormControl(value));

  it('accepts 8+ characters with a letter and a digit', () => {
    expect(check('secret12')).toBeNull();
    expect(check('كلمةسر123')).toBeNull();
  });

  it('rejects short passwords and passwords without a letter or a digit', () => {
    expect(check('abc123')).toEqual({ passwordWeak: true });
    expect(check('abcdefghij')).toEqual({ passwordWeak: true });
    expect(check('1234567890')).toEqual({ passwordWeak: true });
  });

  it('leaves empty values to the required validator', () => {
    expect(check('')).toBeNull();
  });
});

describe('matchingPasswords()', () => {
  const group = (password: string, confirmPassword: string) =>
    new FormGroup({ password: new FormControl(password), confirmPassword: new FormControl(confirmPassword) }, { validators: matchingPasswords() });

  it('flags different passwords on the group', () => {
    expect(group('secret12', 'secret13').hasError('passwordMismatch')).toBe(true);
    expect(group('secret12', 'secret12').hasError('passwordMismatch')).toBe(false);
    expect(group('secret12', '').hasError('passwordMismatch')).toBe(false);
  });
});

describe('safeReturnUrl()', () => {
  it('keeps paths inside the app', () => {
    expect(safeReturnUrl('/topics/12')).toBe('/topics/12');
    expect(safeReturnUrl('/library?skill=Angular')).toBe('/library?skill=Angular');
  });

  it('refuses other sites and account pages', () => {
    expect(safeReturnUrl('https://evil.example')).toBe('/');
    expect(safeReturnUrl('//evil.example')).toBe('/');
    expect(safeReturnUrl('/\\evil.example')).toBe('/');
    expect(safeReturnUrl('/sign-in')).toBe('/');
    expect(safeReturnUrl(null)).toBe('/');
  });
});

describe('authErrorKey()', () => {
  it('uses the API error code when it has a translation, and recognises an unreachable API', () => {
    const i18n = TestBed.inject(I18nService);
    expect(authErrorKey(i18n, new ApiError(401, 'invalid_credentials', ''))).toBe('invalid_credentials');
    expect(authErrorKey(i18n, new ApiError(409, 'email_taken', ''))).toBe('email_taken');
    expect(authErrorKey(i18n, new ApiError(0, 'offline', ''))).toBe('offline');
    expect(authErrorKey(i18n, new ApiError(500, 'something_new', ''))).toBe('generic');
    expect(authErrorKey(i18n, new Error('boom'))).toBe('generic');
  });
});

describe('normaliseEmail()', () => {
  it('trims and lower-cases', () => {
    expect(normaliseEmail('  Sara@Example.COM ')).toBe('sara@example.com');
  });
});
