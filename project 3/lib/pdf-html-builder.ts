import fs from 'fs';
import path from 'path';
import { format, addDays } from 'date-fns';

const LOGO_BASE64 = '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';

interface LeadData {
  betreuungFuer: string;
  pflegegrad: number;
  mobilitaet: string;
  nachteinsaetze: string;
  deutschkenntnisse: string;
  erfahrung: string;
  vertragsLink?: string;
}

interface KalkulationData {
  bruttopreis: number;
  pflegegeld: number;
  entlastungsbudgetMtl: number;
  steuervorteil: number;
  eigenanteil: number;
}

function formatDate(date: Date): string {
  return format(date, 'dd.MM.yyyy');
}

function formatEuro(amount: number): string {
  return amount.toLocaleString('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function buildKalkulationHTML(
  lead: LeadData,
  kalkulation: KalkulationData
): string {
  const templatePath = path.join(process.cwd(), 'lib', 'primundus-kalkulation-template-v2.html');
  let html = fs.readFileSync(templatePath, 'utf-8');

  const today = new Date();
  const gueltigBis = addDays(today, 14);

  html = html.replaceAll('{{DATUM}}', formatDate(today));
  html = html.replaceAll('{{GUELTIG_BIS}}', formatDate(gueltigBis));

  html = html.replaceAll('{{BETREUUNG_FUER}}', lead.betreuungFuer);
  html = html.replaceAll('{{PFLEGEGRAD}}', lead.pflegegrad.toString());
  html = html.replaceAll('{{MOBILITAET}}', lead.mobilitaet);
  html = html.replaceAll('{{NACHTEINSAETZE}}', lead.nachteinsaetze);
  html = html.replaceAll('{{DEUTSCHKENNTNISSE}}', lead.deutschkenntnisse);
  html = html.replaceAll('{{ERFAHRUNG}}', lead.erfahrung);

  html = html.replaceAll('{{BRUTTOPREIS}}', formatEuro(kalkulation.bruttopreis));
  html = html.replaceAll('{{PFLEGEGELD}}', formatEuro(kalkulation.pflegegeld));
  html = html.replaceAll('{{ENTLASTUNGSBUDGET_MTL}}', formatEuro(kalkulation.entlastungsbudgetMtl));
  html = html.replaceAll('{{STEUERVORTEIL}}', formatEuro(kalkulation.steuervorteil));
  html = html.replaceAll('{{EIGENANTEIL}}', formatEuro(kalkulation.eigenanteil));

  const pg = lead.pflegegrad;
  html = html.replaceAll('{{PG2_ACTIVE}}', pg === 2 ? 'active' : '');
  html = html.replaceAll('{{PG3_ACTIVE}}', pg === 3 ? 'active' : '');
  html = html.replaceAll('{{PG4_ACTIVE}}', pg === 4 ? 'active' : '');
  html = html.replaceAll('{{PG5_ACTIVE}}', pg === 5 ? 'active' : '');
  html = html.replaceAll('{{PG2_MARKER}}', pg === 2 ? ' ← Ihr Pflegegrad' : '');
  html = html.replaceAll('{{PG3_MARKER}}', pg === 3 ? ' ← Ihr Pflegegrad' : '');
  html = html.replaceAll('{{PG4_MARKER}}', pg === 4 ? ' ← Ihr Pflegegrad' : '');
  html = html.replaceAll('{{PG5_MARKER}}', pg === 5 ? ' ← Ihr Pflegegrad' : '');

  html = html.replaceAll('{{VERTRAGSLINK}}', lead.vertragsLink || '#');

  html = html.replaceAll('LOGO_BASE64_PLACEHOLDER', LOGO_BASE64);

  const pflegeheimCost = 3245;
  const ersparnis = pflegeheimCost - kalkulation.eigenanteil;

  if (ersparnis > 0) {
    html = html.replaceAll(
      '{{ERSPARNIS_BOX}}',
      `<div style="display: inline-block; background: #E8F5E9; color: #2D5A27; padding: 8px 12px; border-radius: 6px; font-size: 11pt; font-weight: bold;">
        ✓ Sie sparen bis zu ${formatEuro(ersparnis)} € monatlich
      </div>`
    );
  } else {
    html = html.replaceAll('{{ERSPARNIS_BOX}}', '');
  }

  return html;
}
