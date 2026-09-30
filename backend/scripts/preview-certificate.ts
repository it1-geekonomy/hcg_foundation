/**
 * Writes sample donation certificates to ./certificate-previews for checking
 * the layout after changing the template or DonationCertificateService.
 *
 *   pnpm exec ts-node -r tsconfig-paths/register scripts/preview-certificate.ts
 */
import { mkdirSync, writeFileSync } from 'fs';
import * as path from 'path';
import { DonationCertificateService } from '../src/modules/email/donation-certificate.service';
import type { Donor } from '../src/modules/donors/entities/donor.entity';

const samples: Partial<Donor>[] = [
  {
    fullName: 'rahul sharma',
    amount: '5000.00',
    currency: 'INR',
    receiptNumber: 'HCG-20260930-AB12CD34',
    pan: 'abcde1234f',
  },
  {
    fullName: 'Venkata Subramanya Lakshminarayana Chandrasekhar Iyer',
    amount: '1250000.00',
    currency: 'INR',
    razorpayPaymentId: 'pay_QxYz1234567890AbCdEf',
    pan: null,
  },
  {
    fullName: 'Emily Watson',
    amount: '250.00',
    currency: 'USD',
    receiptNumber: 'HCG-20260930-9F8E7D6C',
    pan: null,
  },
];

async function main() {
  const service = new DonationCertificateService();
  const outDir = path.join(__dirname, '..', 'certificate-previews');
  mkdirSync(outDir, { recursive: true });
  for (const [i, sample] of samples.entries()) {
    const donor = { createdAt: new Date(), ...sample } as Donor;
    const file = path.join(outDir, `certificate-${i + 1}.pdf`);
    writeFileSync(file, await service.buildPdf(donor));
    console.log('wrote', file);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
