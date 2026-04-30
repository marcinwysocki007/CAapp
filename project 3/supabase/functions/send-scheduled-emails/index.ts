import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import nodemailer from "npm:nodemailer@6.9.10";
 
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};
 
interface ScheduledEmail {
  id: string;
  lead_id: string;
  email_type: string;
  recipient_email: string;
  scheduled_for: string;
  status: string;
}
 
interface Lead {
  id: string;
  email: string;
  vorname: string;
  nachname: string;
  anrede_text: string;
  kalkulation: any;
  token: string;
  status: string;
}
 
interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  fromName: string;
  siteUrl: string;
}
 
async function getSmtpConfig(
  supabase: any
): Promise<SmtpConfig> {
  const { data, error } = await supabase.rpc("get_smtp_config");
 
  if (error) {
    console.error("Error fetching SMTP config:", error.message);
    throw new Error(`Failed to get SMTP config: ${error.message}`);
  }
 
  return {
    host: data?.host || "smtp.ionos.de",
    port: parseInt(data?.port || "587"),
    user: data?.user || "",
    pass: data?.pass || "",
    from: data?.from || "",
    fromName: data?.fromName || "Primundus 24h-Pflege",
    siteUrl: data?.siteUrl || "https://kostenrechner.primundus.de",
  };
}
 
const FEMALE_NAMES_SET = new Set(["aaliya","abby","ada","adela","adelheid","adeline","adriana","agata","agatha","agnes","aiko","aila","aileen","aimee","aisha","alana","alba","aleksandra","alexa","alexandra","alexia","alexis","alice","alicia","alina","alissa","aliyah","alke","allie","allison","alma","almut","alona","alva","alwine","amalia","amanda","amara","amaya","amelia","amelie","ami","amira","amy","ana","anastasia","andrea","andreja","angela","angelika","angelina","anita","anja","anna","annalena","anne","annegret","annelies","annelore","annette","anni","annika","antje","antonia","anuschka","aoife","arabell","ariadne","ariane","astrid","aurora","ava","babette","barbara","beatrice","beatrix","belen","bella","bente","berit","bernadette","bettina","bianca","birgit","birgitt","birgitta","birgitte","borbala","brigitta","brigitte","britt","brittany","bruna","brunhilde","camila","camilla","cara","carina","carla","carlotta","caro","carola","carolina","caroline","catharina","catharine","catrina","cecile","cecilia","charlotte","chiara","chloe","christel","christiane","christina","christine","claudia","claudine","constanze","corinna","cornelia","dagmar","dana","daniela","daria","deborah","diana","dina","dominique","dorothea","edda","edith","elena","eleonora","eliane","elisa","elisabeth","elizabeth","elke","ella","ellen","elsa","elsbeth","else","elvira","emilia","emma","erika","erna","ernestine","eva","eveline","evelyn","fatima","felicitas","filippa","fiona","franziska","frauke","frederike","frieda","gabriela","gabriele","gabi","gaby","gerda","gertrud","gisela","greta","gudrun","hanna","hannah","hannelore","heidemarie","heidi","heike","helene","helga","henriette","hildegard","hildegarde","hilke","hilde","ida","ilka","ilona","ilse","imke","ines","ingeborg","ingrid","irina","iris","irmgard","irmtraud","isabel","isabelle","isadora","jacqueline","jana","janet","janna","jasmin","jennifer","jessica","jette","johanna","jolanta","josefine","josephine","julia","juliane","justine","karin","karla","katharina","katharine","kathrin","katja","katrin","katrina","katrine","klara","klaudia","klarissa","kordula","kristin","kristina","lara","larissa","laura","lea","leah","lena","leonie","leonora","lieselotte","lilli","lillian","lilly","lina","linda","lisa","lisbeth","lore","lori","lotte","lotta","louisa","louise","lucia","luisa","luise","luzie","lydia","magdalena","maja","malin","mara","margarita","margareta","margarethe","margit","margot","marianna","marie","marielle","marina","marita","marlene","marta","martina","mary","mathilde","maud","melanie","melinda","melissa","merle","mia","michelle","mira","miriam","mirja","monika","nadine","natalia","natalie","nathalie","nele","nicola","nicole","nina","nora","natascha","odette","olivia","ottilie","patrizia","paula","pauline","petra","pia","renate","ronja","rosa","rosalie","roswitha","ruth","sabrina","sandra","sara","sarah","silke","silvia","simona","simone","sina","sofia","sonja","sophie","stefanie","stella","stephanie","susanne","sybille","sylvia","tamara","tanja","tatjana","teresa","theresa","theres","tina","ulrike","ursula","uta","veronika","victoria","viola","virginia","walburga","waltraud","wanda","wiebke","wilhelmine","xenia","yvonne","zoe"]);
const MALE_NAMES_SET = new Set(["aaron","adam","alexander","alfred","alois","andre","andreas","axel","bastian","benedikt","benjamin","bernd","bo","burkhard","carsten","christian","christoph","claus","clemens","cornelius","damian","daniel","david","dieter","dietmar","dirk","dominik","edgar","elias","emilio","eric","erik","ernst","eugen","fabian","felix","finn","florian","frank","franz","frederik","gabriel","georg","gerhard","gottfried","guido","gunnar","hans","harry","hartmut","heinz","helge","helmut","henning","henrik","herbert","heiko","holger","horst","hubert","hugo","jakob","jan","jens","joachim","joe","joel","joerg","johannes","jonas","jonathan","jochen","kai","karl","kilian","Klaus","kevin","konrad","kristian","lars","leo","leon","leopold","lorenz","lothar","lucas","lukas","manfred","marco","markus","martin","matthias","max","maximilian","michael","mike","moritz","nikolaj","nikolaus","nils","norbert","oliver","oscar","oskar","otto","patrice","patrick","paul","peter","philipp","ralf","reinhard","richard","robert","rolf","sebastian","simon","stefan","steffen","stephan","steven","sven","thomas","thorsten","tillman","tim","tobias","tom","torsten","ulrich","uwe","valentin","victor","volker","werner","willi","will","wolf","wolfram","xaver"]);
 
function capitalize(name: string): string {
  if (!name) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
}
 
function detectGenderFromName(vorname: string): "Frau" | "Herr" | "Familie" | null {
  if (!vorname?.trim()) return null;
  const v = vorname.trim();
  if (v.toLowerCase().includes(" und ") || v.includes(" & ") || v.includes("/")) return "Familie";
  const first = v.split(" ")[0].toLowerCase();
  if (FEMALE_NAMES_SET.has(first)) return "Frau";
  if (MALE_NAMES_SET.has(first)) return "Herr";
  return null;
}
 
function buildAnredeText(anrede: string | null, nachname: string, vorname: string): string {
  const effectiveAnrede = anrede || detectGenderFromName(vorname);
  const n = capitalize(nachname);
  if (effectiveAnrede === "Frau" && n) return `Sehr geehrte Frau ${n}`;
  if (effectiveAnrede === "Herr" && n) return `Sehr geehrter Herr ${n}`;
  if (effectiveAnrede === "Familie" && n) return `Sehr geehrte Familie ${n}`;
  return "Sehr geehrte Damen und Herren";
}
 
function buildHalloAnrede(anrede: string | null, nachname: string, vorname: string): string {
  const effectiveAnrede = anrede || detectGenderFromName(vorname);
  const n = capitalize(nachname);
  if (effectiveAnrede === "Frau" && n) return `Hallo Frau ${n}`;
  if (effectiveAnrede === "Herr" && n) return `Hallo Herr ${n}`;
  if (effectiveAnrede === "Familie" && n) return `Hallo Familie ${n}`;
  return "Sehr geehrte Damen und Herren";
}
 
function buildEmailWrapper(lead: Lead, siteUrl: string, content: string): string {
  const logoUrl = `${siteUrl}/images/primundus_logo_header.webp`;
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Primundus 24h-Pflege</title>
</head>
<body style="margin:0;padding:0;background-color:#f0ede6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center" style="padding:20px 16px;">
      <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.08);">
        <div style="background:#fff;padding:14px 20px 12px;border-bottom:3px solid #B5A184;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="vertical-align:middle;"><img src="${logoUrl}" alt="Primundus" style="height:24px;width:auto;display:block;" /></td>
              <td style="vertical-align:middle;text-align:right;"><span style="display:inline-block;background:#2D6A4F;color:#fff;font-size:10px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap;">✓ 100% sorgenfrei und ohne Risiko</span></td>
            </tr>
          </table>
        </div>
        <div style="padding:28px 28px;text-align:left;">
          ${content}
        </div>
        <div style="background:#f8f9fa;padding:18px 24px;text-align:center;border-top:1px solid #e0e0e0;">
          <div style="font-weight:600;font-size:13px;color:#3D2B1F;margin-bottom:4px;">Primundus Deutschland</div>
          <div style="font-size:12px;color:#888;line-height:1.7;">
            <a href="tel:+4989200000830" style="color:#B5A184;text-decoration:none;">+49 89 200 000 830</a> &middot;
            <a href="mailto:info@primundus.de" style="color:#B5A184;text-decoration:none;">info@primundus.de</a> &middot;
            <a href="https://primundus.de" style="color:#B5A184;text-decoration:none;">www.primundus.de</a>
          </div>
          <div style="font-size:11px;color:#bbb;margin-top:10px;line-height:1.5;">
            Diese E-Mail wurde versendet an: ${lead.email}<br>
            Primundus Deutschland | Vitanas Group
          </div>
        </div>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
}
 
function buildIlkaSig(siteUrl: string): string {
  const ilkaUrl = `${siteUrl}/images/ilka-wysocki_pm-mallorca.webp`;
  return `
    <div style="margin-top:20px;padding-top:16px;border-top:1px solid #eee;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <img src="${ilkaUrl}" alt="Ilka Wysocki" style="width:42px;height:42px;border-radius:50%;object-fit:cover;object-position:top;border:1.5px solid #F0997B;flex-shrink:0;" />
        <div>
          <div style="font-size:14px;font-weight:600;color:#2D1F0F;">Ilka Wysocki</div>
          <div style="font-size:12px;color:#aaa;">Ihre persönliche Beraterin &middot; Mo&ndash;So 8&ndash;18 Uhr</div>
          <div style="font-size:13px;font-weight:600;color:#E76F63;margin-top:2px;">089 200 000 830</div>
        </div>
      </div>
      <div style="border-top:1px solid #f0ece5;padding-top:10px;text-align:center;">
        <div style="font-size:11px;color:#aaa;line-height:1.8;">
          20+ Jahre Erfahrung &nbsp;&middot;&nbsp; 60.000+ Einsätze &nbsp;&middot;&nbsp; Bestpreis-Garantie &nbsp;&middot;&nbsp; Testsieger DIE WELT
        </div>
      </div>
    </div>`;
}
 
function buildAngebotsEmailHtml(lead: Lead, siteUrl: string): string {
  const kalkulationUrl = `${siteUrl}/kalkulation/${lead.id}`;
  const anredeText = buildAnredeText(lead.anrede_text || null, lead.nachname || "", lead.vorname || "");
  const kalk = lead.kalkulation || {};
  const bruttopreis = kalk.bruttopreis || 0;
  const gesamteZuschuesse = kalk.zuschüsse?.gesamt || 0;
  const eigenanteil = kalk.eigenanteil || (bruttopreis - gesamteZuschuesse);
 
  const formatEuro = (n: number) => n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
 
  const content = `
    <p style="font-size:15px;line-height:1.75;color:#444;margin-bottom:14px;">${anredeText},</p>
    <p style="font-size:15px;line-height:1.75;color:#444;margin-bottom:14px;">vielen Dank für Ihre Anfrage. Auf Grundlage Ihrer Angaben haben wir Ihr <strong style="color:#2D1F0F;">persönliches Angebot</strong> für die 24-Stunden-Betreuung zu Hause erstellt.</p>
 
    <div style="background:#FAF7F0;border:1.5px solid #B5A184;border-radius:8px;padding:12px 14px;margin:18px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td style="vertical-align:top;padding-right:8px;">
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:#8B6914;margin-bottom:2px;">Monatssatz</div>
            <div style="font-size:17px;font-weight:700;color:#2D1F0F;">${formatEuro(bruttopreis)}</div>
            <div style="font-size:10px;color:#aaa;">inkl. Steuern &amp; Sozialabgaben</div>
          </td>
          <td style="vertical-align:top;text-align:right;border-left:1px solid #e8d9a0;padding-left:12px;">
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:#8B6914;margin-bottom:2px;">Eigenanteil möglich</div>
            <div style="font-size:16px;font-weight:700;color:#1E5C3A;">${formatEuro(eigenanteil)}</div>
            <div style="font-size:10px;color:#aaa;">nach Pflegekasse</div>
          </td>
        </tr>
      </table>
    </div>
 
    <div style="font-size:12px;color:#888;line-height:1.8;margin:0 0 18px;text-align:center;">
      <span style="color:#2D6A4F;font-weight:600;">✓ Keine Vertragsbindung</span>&ensp;&middot;&ensp;
      <span style="color:#2D6A4F;font-weight:600;">✓ Tagesgenaue Abrechnung</span>&ensp;&middot;&ensp;
      <span style="color:#2D6A4F;font-weight:600;">✓ Kosten erst bei Anreise</span>
    </div>
    <p style="font-size:15px;line-height:1.75;color:#444;margin-bottom:14px;">Im Angebot finden Sie alle Details zu Kosten, Konditionen und dem weiteren Ablauf.</p>
 
    <div style="text-align:center;margin:22px 0;">
      <a href="${kalkulationUrl}" style="display:inline-block;background:#2A9D5C;color:#fff;text-decoration:none;padding:13px 34px;border-radius:8px;font-weight:600;font-size:15px;">Angebot jetzt ansehen →</a>
    </div>
 
    <div style="background:#EEF6F0;border-left:3px solid #4CAF50;padding:12px 14px;border-radius:0 6px 6px 0;font-size:14px;color:#555;line-height:1.6;">
      Für Sie bleibt alles <strong>unverbindlich</strong>, bis Sie sich für eine passende Betreuungskraft entscheiden und diese anreist.
    </div>
 
    ${buildIlkaSig(siteUrl)}`;
 
  return buildEmailWrapper(lead, siteUrl, content);
}
 
function buildAngebotsEmailText(lead: Lead, siteUrl: string): string {
  const kalkulationUrl = `${siteUrl}/kalkulation/${lead.id}`;
  const anredeText = buildAnredeText(lead.anrede_text || null, lead.nachname || "", lead.vorname || "");
  return `${anredeText},
 
vielen Dank für Ihre Anfrage. Auf Grundlage Ihrer Angaben haben wir Ihr persönliches Angebot für die 24-Stunden-Betreuung zu Hause erstellt.
 
Angebot jetzt ansehen:
${kalkulationUrl}
 
Für Sie bleibt alles unverbindlich, bis Sie sich für eine passende Betreuungskraft entscheiden und diese anreist.
 
Mit freundlichen Grüßen
Ilka Wysocki
 
---
✓ Keine Vertragsbindung · ✓ Tagesgenaue Abrechnung · ✓ Kosten erst bei Anreise
Primundus Deutschland | 24h-Pflege und Betreuung
Telefon: +49 89 200 000 830 | info@primundus.de | www.primundus.de`;
}
 
function buildNachfass1Html(lead: Lead, siteUrl: string): string {
  const kalkulationUrl = `${siteUrl}/kalkulation/${lead.id}`;
  const halloAnrede = buildHalloAnrede(lead.anrede_text || null, lead.nachname || "", lead.vorname || "");
 
  const content = `
    <p style="font-size:15px;line-height:1.75;color:#444;margin-bottom:14px;">${halloAnrede},</p>
    <p style="font-size:15px;line-height:1.75;color:#444;margin-bottom:14px;">ich wollte kurz nachfragen, ob Sie unser Angebot schon anschauen konnten.</p>
    <p style="font-size:15px;line-height:1.75;color:#444;margin-bottom:14px;">Wir sind bereits dabei, nach passenden Betreuungskräften für Ihre Situation zu schauen. Passt das für Sie grundsätzlich so – oder gibt es noch etwas, das wir berücksichtigen sollten?</p>
 
    ${buildIlkaSig(siteUrl)}
 
    <div style="margin-top:16px;padding-top:14px;border-top:1px solid #eee;">
      <p style="font-size:13px;color:#888;">PS: Hier finden Sie Ihr Angebot: <a href="${kalkulationUrl}" style="color:#B5A184;font-weight:600;text-decoration:none;">Angebot ansehen →</a></p>
    </div>`;
 
  return buildEmailWrapper(lead, siteUrl, content);
}
 
function buildNachfass1Text(lead: Lead, siteUrl: string): string {
  const kalkulationUrl = `${siteUrl}/kalkulation/${lead.id}`;
  const halloAnrede = buildHalloAnrede(lead.anrede_text || null, lead.nachname || "", lead.vorname || "");
  return `${halloAnrede},
 
ich wollte kurz nachfragen, ob Sie unser Angebot schon anschauen konnten.
 
Wir sind bereits dabei, nach passenden Betreuungskräften für Ihre Situation zu schauen.
Passt das für Sie grundsätzlich so – oder gibt es noch etwas, das wir berücksichtigen sollten?
 
Mit freundlichen Grüßen
Ilka Wysocki
 
PS: Hier finden Sie Ihr Angebot: ${kalkulationUrl}
 
---
✓ Keine Vertragsbindung · ✓ Tagesgenaue Abrechnung · ✓ Kosten erst bei Anreise
Primundus Deutschland | +49 89 200 000 830 | www.primundus.de`;
}
 
function buildNachfass2Html(lead: Lead, siteUrl: string): string {
  const kalkulationUrl = `${siteUrl}/kalkulation/${lead.id}`;
  const halloAnrede = buildHalloAnrede(lead.anrede_text || null, lead.nachname || "", lead.vorname || "");
 
  const content = `
    <p style="font-size:15px;line-height:1.75;color:#444;margin-bottom:14px;">${halloAnrede},</p>
    <p style="font-size:15px;line-height:1.75;color:#444;margin-bottom:14px;">ich melde mich noch einmal kurz – vielleicht war einfach noch nicht der richtige Moment.</p>
    <p style="font-size:15px;line-height:1.75;color:#444;margin-bottom:14px;">Wenn Sie möchten, schaue ich gerne schon mal nach passenden Betreuungskräften für Ihre Situation. Das ist völlig unverbindlich und gibt Ihnen einen ersten Eindruck, was möglich ist.</p>
 
    <div style="background:#F7F5F0;border:1px solid #e5e0d8;border-radius:8px;padding:12px 16px;margin:16px 0;display:flex;align-items:center;justify-content:space-between;gap:12px;">
      <div>
        <div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.06em;margin-bottom:7px;">100% Sorglos – unsere Konditionen</div>
        <div style="font-size:13px;color:#555;line-height:1.9;">
          <div><span style="color:#2D6A4F;font-weight:600;">✓</span> Keine Vertragsbindung</div>
          <div><span style="color:#2D6A4F;font-weight:600;">✓</span> Tagesgenaue Abrechnung</div>
          <div><span style="color:#2D6A4F;font-weight:600;">✓</span> Kosten erst bei Anreise</div>
        </div>
      </div>
      <img src="${siteUrl}/images/primundus_testsieger-2021.webp" alt="Testsieger" style="height:64px;width:auto;border:1px solid #e8d9a0;border-radius:4px;flex-shrink:0;opacity:.9;" />
    </div>
 
    <p style="font-size:15px;line-height:1.75;color:#444;margin-bottom:14px;">Melden Sie sich einfach, wenn Sie Fragen haben oder wenn wir loslegen sollen.</p>
 
    ${buildIlkaSig(siteUrl)}
 
    <div style="margin-top:16px;padding-top:14px;border-top:1px solid #eee;">
      <p style="font-size:13px;color:#888;">PS: Hier finden Sie Ihr Angebot: <a href="${kalkulationUrl}" style="color:#B5A184;font-weight:600;text-decoration:none;">Angebot ansehen →</a></p>
    </div>`;
 
  return buildEmailWrapper(lead, siteUrl, content);
}
 
function buildNachfass2Text(lead: Lead, siteUrl: string): string {
  const kalkulationUrl = `${siteUrl}/kalkulation/${lead.id}`;
  const halloAnrede = buildHalloAnrede(lead.anrede_text || null, lead.nachname || "", lead.vorname || "");
  return `${halloAnrede},
 
ich melde mich noch einmal kurz – vielleicht war einfach noch nicht der richtige Moment.
 
Wenn Sie möchten, schaue ich gerne schon mal nach passenden Betreuungskräften für Ihre Situation. Das ist völlig unverbindlich.
 
Zur Erinnerung:
✓ Keine Vorauszahlung – Kosten entstehen erst wenn die Betreuungskraft vor Ort ist
✓ Täglich kündbar – keinerlei Vertragsbindung
✓ Start in 4–7 Tagen – wenn Sie möchten
 
Melden Sie sich einfach, wenn Sie Fragen haben oder wenn wir loslegen sollen.
 
Mit freundlichen Grüßen
Ilka Wysocki
 
PS: Hier finden Sie Ihr Angebot: ${kalkulationUrl}
 
---
✓ Keine Vertragsbindung · ✓ Tagesgenaue Abrechnung · ✓ Kosten erst bei Anreise
Primundus Deutschland | +49 89 200 000 830 | www.primundus.de`;
}
 
 
async function sendEmailSmtp(
  smtpConfig: SmtpConfig,
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transport = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: false,
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    });
 
    await new Promise<void>((resolve, reject) => {
      transport.sendMail(
        {
          from: `"${smtpConfig.fromName}" <${smtpConfig.from}>`,
          to,
          subject,
          text,
          html,
        },
        (error: any) => {
          if (error) return reject(error);
          resolve();
        }
      );
    });
 
    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}
 
async function scheduleFollowUp(
  supabase: any,
  lead: Lead,
  emailType: string,
  delayMinutes: number
): Promise<void> {
  const scheduledFor = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
 
  await supabase
    .from("scheduled_emails")
    .update({ status: "cancelled" })
    .eq("lead_id", lead.id)
    .eq("email_type", emailType)
    .eq("status", "pending");
 
  await supabase.from("scheduled_emails").insert({
    lead_id: lead.id,
    email_type: emailType,
    recipient_email: lead.email,
    scheduled_for: scheduledFor,
    status: "pending",
  });
}
 
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
 
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
 
    const smtpConfig = await getSmtpConfig(supabase);
 
    if (!smtpConfig.user || !smtpConfig.pass) {
      throw new Error("SMTP credentials not found in vault");
    }
 
    const now = new Date().toISOString();
 
    const { data: pendingEmails, error: fetchError } = await supabase
      .from("scheduled_emails")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .limit(10);
 
    if (fetchError) {
      throw new Error(`Error fetching scheduled emails: ${fetchError.message}`);
    }
 
    if (!pendingEmails || pendingEmails.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending emails to send", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
 
    const results: { id: string; success: boolean; error?: string }[] = [];
 
    for (const scheduledEmail of pendingEmails as ScheduledEmail[]) {
      try {
        const { data: claimed, error: claimError } = await supabase
          .from("scheduled_emails")
          .update({ status: "processing", updated_at: new Date().toISOString() })
          .eq("id", scheduledEmail.id)
          .eq("status", "pending")
          .select("id")
          .maybeSingle();
 
        if (claimError || !claimed) {
          continue;
        }
        const { data: lead, error: leadError } = await supabase
          .from("leads")
          .select("*")
          .eq("id", scheduledEmail.lead_id)
          .maybeSingle();
 
        if (leadError || !lead) {
          await supabase
            .from("scheduled_emails")
            .update({
              status: "failed",
              error_message: leadError?.message || "Lead not found",
              updated_at: new Date().toISOString(),
            })
            .eq("id", scheduledEmail.id);
 
          results.push({ id: scheduledEmail.id, success: false, error: "Lead not found" });
          continue;
        }
 
        const isBeauftragt = lead.status === "vertrag_abgeschlossen" || lead.status === "betreuung_beauftragt" || lead.order_confirmed === true;
        const isNichtInteressiert = lead.status === "nicht_interessiert";
 
        if (
          (scheduledEmail.email_type === "nachfass_1" || scheduledEmail.email_type === "nachfass_2") &&
          (isBeauftragt || isNichtInteressiert)
        ) {
          await supabase
            .from("scheduled_emails")
            .update({ status: "cancelled", updated_at: new Date().toISOString() })
            .eq("id", scheduledEmail.id);
 
          await supabase.from("lead_events").insert({
            lead_id: scheduledEmail.lead_id,
            event_type: `email_${scheduledEmail.email_type}_cancelled`,
            data: { reason: isNichtInteressiert ? "nicht_interessiert" : "betreuung_beauftragt" },
          });
 
          results.push({ id: scheduledEmail.id, success: true });
          continue;
        }
 
        let subject = "";
        let html = "";
        let text = "";
        let eventTypeSent = "";
        let eventTypeFailed = "";
 
        if (scheduledEmail.email_type === "angebot") {
          subject = "Ihr pers\u00f6nliches Angebot zur 24-Stunden-Betreuung";
          html = buildAngebotsEmailHtml(lead as Lead, smtpConfig.siteUrl);
          text = buildAngebotsEmailText(lead as Lead, smtpConfig.siteUrl);
          eventTypeSent = "email_angebot_sent";
          eventTypeFailed = "email_angebot_failed";
        } else if (scheduledEmail.email_type === "nachfass_1") {
          subject = "AW: Kurze R\u00fcckfrage zu Ihrem Angebot";
          html = buildNachfass1Html(lead as Lead, smtpConfig.siteUrl);
          text = buildNachfass1Text(lead as Lead, smtpConfig.siteUrl);
          eventTypeSent = "email_nachfass_1_sent";
          eventTypeFailed = "email_nachfass_1_failed";
        } else if (scheduledEmail.email_type === "nachfass_2") {
          subject = "Noch offen: Ihr Angebot zur 24h-Betreuung – ich helfe gerne weiter";
          html = buildNachfass2Html(lead as Lead, smtpConfig.siteUrl);
          text = buildNachfass2Text(lead as Lead, smtpConfig.siteUrl);
          eventTypeSent = "email_nachfass_2_sent";
          eventTypeFailed = "email_nachfass_2_failed";
        } else {
          await supabase
            .from("scheduled_emails")
            .update({
              status: "failed",
              error_message: `Unknown email type: ${scheduledEmail.email_type}`,
              updated_at: new Date().toISOString(),
            })
            .eq("id", scheduledEmail.id);
 
          results.push({ id: scheduledEmail.id, success: false, error: `Unknown email type: ${scheduledEmail.email_type}` });
          continue;
        }
 
        const emailResult = await sendEmailSmtp(smtpConfig, scheduledEmail.recipient_email, subject, html, text);
 
        if (emailResult.success) {
          await supabase
            .from("scheduled_emails")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", scheduledEmail.id);
 
          await supabase.from("lead_events").insert({
            lead_id: scheduledEmail.lead_id,
            event_type: eventTypeSent,
            data: { to: scheduledEmail.recipient_email, triggered_by: "scheduled_email" },
          });
 
          if (scheduledEmail.email_type === "angebot") {
            await scheduleFollowUp(supabase, lead as Lead, "nachfass_1", 24 * 60);
          } else if (scheduledEmail.email_type === "nachfass_1") {
            await scheduleFollowUp(supabase, lead as Lead, "nachfass_2", 48 * 60);
          }
 
          results.push({ id: scheduledEmail.id, success: true });
        } else {
          await supabase
            .from("scheduled_emails")
            .update({
              status: "failed",
              error_message: emailResult.error,
              updated_at: new Date().toISOString(),
            })
            .eq("id", scheduledEmail.id);
 
          await supabase.from("lead_events").insert({
            lead_id: scheduledEmail.lead_id,
            event_type: eventTypeFailed,
            data: { to: scheduledEmail.recipient_email, error: emailResult.error, triggered_by: "scheduled_email" },
          });
 
          results.push({ id: scheduledEmail.id, success: false, error: emailResult.error });
        }
      } catch (emailError) {
        const errorMsg = emailError instanceof Error ? emailError.message : String(emailError);
 
        await supabase
          .from("scheduled_emails")
          .update({
            status: "failed",
            error_message: errorMsg,
            updated_at: new Date().toISOString(),
          })
          .eq("id", scheduledEmail.id);
 
        results.push({ id: scheduledEmail.id, success: false, error: errorMsg });
      }
    }
 
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;
 
    return new Response(
      JSON.stringify({
        message: `Processed ${results.length} emails`,
        processed: results.length,
        success: successCount,
        failed: failCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in send-scheduled-emails:", errorMessage);
 
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});