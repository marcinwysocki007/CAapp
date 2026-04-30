export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://primundus.de';

  const staticPages = [
    '',
    '/24-stunden-pflege',
    '/was-ist-24-stunden-pflege',
    '/kosten-24-stunden-pflege',
    '/leistungen-24-stunden-pflege',
    '/voraussetzungen-24-stunden-pflege',
    '/ablauf-24-stunden-pflege',
    '/pflegekasse-24-stunden-pflege',
    '/arbeitszeiten-und-ruhezeiten-24-stunden-pflege',
    '/premium-polnische-pflegekraft',
    '/premium-ansatz',
    '/24h-pflege-kostenrechner',
    '/pflege-infos',
    '/ratgeber/pflegegrade',
    '/ratgeber/pflegegrade/pflegegrad-vergleich',
    '/ratgeber/pflegegrade/pflegegrad-beantragen',
    '/ratgeber/pflegegrade/mdk-begutachtung',
    '/ratgeber/pflegegrade/pflegegrad-widerspruch',
    '/ratgeber/pflegegrade/pflegegrad-tabelle',
    '/pflege-und-finanzen',
    '/pflege-und-finanzen/entlastungsbetrag',
    '/pflege-und-finanzen/verhinderungspflege-kurzzeitpflege',
    '/pflege-und-finanzen/pflegegeld',
    '/ratgeber/pflege-finanzen/pflegekasse-was-bezahlt',
    '/ratgeber/pflege-finanzen/steuerliche-vorteile-pflege',
    '/ratgeber/pflege-zuhause',
    '/ratgeber/angehoerige',
    '/ratgeber/krankheitsbilder',
    '/ratgeber/vergleiche',
    '/pflegerecht',
    '/hilfsmittel-fuer-senioren',
    '/barrierefreies-wohnen-bauen',
    '/24-stunden-pflege-berlin',
    '/24-stunden-pflege-muenchen',
    '/24-stunden-pflege-hamburg',
    '/24-stunden-pflege-koeln',
    '/24-stunden-pflege-frankfurt',
    '/24-stunden-pflege-stuttgart',
    '/24-stunden-pflege-duesseldorf',
    '/24-stunden-pflege-dortmund',
    '/24-stunden-pflege-essen',
    '/24-stunden-pflege-bremen',
    '/jetzt-anfragen',
    '/pflegekraft-kostenfrei-anfragen',
    '/partner-werden',
    '/kontakt',
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map((page) => {
    return `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
