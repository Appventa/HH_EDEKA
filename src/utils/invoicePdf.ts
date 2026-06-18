import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { BrandConfig } from '@/brands';
import { Branch, Invoice } from '@/data/types';

export function formatEUR(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  return `${day}.${month}.${year}`;
}

function buildInvoiceHtml(invoice: Invoice, branch: Branch | undefined, brand: BrandConfig, businessName: string): string {
  const netByRate: Record<number, number> = {};
  let netTotal = 0;

  const rows = invoice.items
    .map((item, index) => {
      const lineNet = item.quantity * item.unitPrice;
      netTotal += lineNet;
      netByRate[item.vatRate] = (netByRate[item.vatRate] ?? 0) + lineNet;
      return `<tr>
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td class="num">${item.quantity}</td>
        <td>${item.unit}</td>
        <td class="num">${formatEUR(item.unitPrice)} €</td>
        <td class="num">${item.vatRate}%</td>
        <td class="num">${formatEUR(lineNet)} €</td>
      </tr>`;
    })
    .join('');

  const vatRows = Object.entries(netByRate)
    .map(([rate, net]) => {
      const vat = net * (Number(rate) / 100);
      return `<div class="row"><span>zzgl. ${rate}% MwSt.</span><span>${formatEUR(vat)} €</span></div>`;
    })
    .join('');

  const grossTotal = Object.entries(netByRate).reduce(
    (sum, [rate, net]) => sum + net + net * (Number(rate) / 100),
    0,
  );

  const branchAddress = branch ? `${branch.street}, ${branch.zip} ${branch.city}` : '';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: Helvetica, Arial, sans-serif; color: #1A1A1A; padding: 28px; font-size: 12px; }
  .header { background: ${brand.colors.primary}; color: ${brand.colors.textOnPrimary}; padding: 18px 22px; border-radius: 10px; margin-bottom: 20px; }
  .header h1 { margin: 0; font-size: 20px; }
  .header p { margin: 4px 0 0; font-size: 11px; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 18px; }
  .meta div { font-size: 11px; line-height: 1.6; }
  .meta .label { color: #5C6470; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { text-align: left; padding: 6px 4px; font-size: 11px; border-bottom: 1px solid #E2E5EA; }
  th { text-transform: uppercase; font-size: 9px; color: #5C6470; letter-spacing: 0.5px; }
  td.num, th.num { text-align: right; }
  .totals { margin-top: 18px; width: 280px; margin-left: auto; font-size: 12px; }
  .totals .row { display: flex; justify-content: space-between; padding: 3px 0; }
  .totals .grand { display: flex; justify-content: space-between; font-weight: 700; font-size: 15px; border-top: 2px solid ${brand.colors.primary}; padding-top: 6px; margin-top: 4px; }
  .footer { margin-top: 36px; font-size: 9px; color: #5C6470; text-align: center; line-height: 1.6; }
</style>
</head>
<body>
  <div class="header">
    <h1>${brand.name}</h1>
    <p>${branch?.name ?? ''}${branchAddress ? ` · ${branchAddress}` : ''}</p>
  </div>

  <div class="meta">
    <div>
      <span class="label">Kunde</span><br />
      <strong>${businessName}</strong>
    </div>
    <div>
      <span class="label">Rechnungs-Nr.</span> ${invoice.invoiceNumber}<br />
      <span class="label">Rechnungsdatum</span> ${formatDate(invoice.date)}<br />
      <span class="label">Lieferdatum</span> ${formatDate(invoice.date)}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Pos.</th>
        <th>Bezeichnung</th>
        <th class="num">Menge</th>
        <th>Einheit</th>
        <th class="num">Preis</th>
        <th class="num">MwSt</th>
        <th class="num">Netto</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Zwischensumme (netto)</span><span>${formatEUR(netTotal)} €</span></div>
    ${vatRows}
    <div class="grand"><span>Gesamtbetrag</span><span>${formatEUR(grossTotal)} €</span></div>
  </div>

  <div class="footer">
    Diese Rechnung wurde im Rahmen der Demo-App „${brand.appLabel}" mit Beispieldaten erstellt
    und dient ausschließlich zu Demonstrationszwecken.
  </div>
</body>
</html>`;
}

export async function shareInvoicePdf(
  invoice: Invoice,
  branch: Branch | undefined,
  brand: BrandConfig,
  businessName: string,
): Promise<void> {
  const html = buildInvoiceHtml(invoice, branch, brand, businessName);
  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }
}
