import { PublicCertificate } from '../../core/models';

/** The title LinkedIn shows; English, since the profile entry is read by recruiters in any language. */
export function linkedInTitle(phaseOrder: number, phaseTitleEn: string): string {
  return `DevPath roadmap — Phase ${phaseOrder}: ${phaseTitleEn}`;
}

/** LinkedIn's "Add licence or certification" form, filled in; the verify link goes in certUrl. */
export function linkedInAddUrl(c: Pick<PublicCertificate, 'code' | 'issuedAt'>, title: string, verifyUrl: string): string {
  const issued = new Date(c.issuedAt);
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME', name: title, organizationName: 'DevPath',
    issueYear: String(issued.getUTCFullYear()), issueMonth: String(issued.getUTCMonth() + 1),
    certUrl: verifyUrl, certId: c.code,
  });
  return 'https://www.linkedin.com/profile/add?' + params.toString();
}

/** The public verify link of a certificate. */
export function verifyUrl(origin: string, code: string): string {
  return `${origin}/c/${code}`;
}
