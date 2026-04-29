'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CircleCheck as CheckCircle,
  Loader as Loader2,
  MapPin,
  Phone,
  Mail,
  Shield,
  FileText,
  Users,
  Award,
  Check,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Lead {
  id: string;
  vorname: string;
  email: string;
  telefon: string;
  anrede?: string;
  anrede_text?: string;
  nachname?: string;
  kalkulation: any;
  care_start_timing?: string;
}

function formatEuro(amount: number): string {
  return amount.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' €';
}

const requiredFields = [
  'anrede', 'vorname', 'nachname', 'email', 'phone',
  'patientAnrede', 'patientVorname', 'patientNachname',
  'patientStreet', 'patientZip', 'patientCity',
];

// Per-field min-length rule. Mamamia rejects customer_contracts.street_number
// shorter than 3 chars, so the form needs to mirror that minimum to give
// the customer immediate feedback instead of a server error after submit.
const MIN_LENGTHS: Record<string, number> = {
  patientStreet: 3,
  patientZip: 4, // German PLZ is 4-5 digits
};

function fieldValid(fieldName: string, value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const min = MIN_LENGTHS[fieldName] ?? 1;
  return trimmed.length >= min;
}

function fieldClass(fieldName: string, value: string, touched: Set<string>, submitted: boolean) {
  const isTouched = touched.has(fieldName) || submitted;
  const base = 'h-11 text-sm rounded-lg transition-all duration-200';
  const valid = fieldValid(fieldName, value);
  if (isTouched && !valid) return `${base} border-2 border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/30`;
  if (valid) return `${base} border-2 border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 bg-emerald-50/20`;
  return `${base} border border-gray-200 focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10`;
}

function selectClass(fieldName: string, value: string, touched: Set<string>, submitted: boolean) {
  const isTouched = touched.has(fieldName) || submitted;
  const base = 'h-11 text-sm rounded-lg transition-all duration-200';
  if (isTouched && !value) return `${base} border-2 border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30`;
  if (value) return `${base} border-2 border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-emerald-50/20`;
  return `${base} border border-gray-200 focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10`;
}

function FieldWrapper({ label, required, children, hasValue, fieldName, touched, submitted }: {
  label: string; required?: boolean; children: React.ReactNode;
  hasValue: boolean; fieldName: string; touched: Set<string>; submitted: boolean;
}) {
  const showError = (touched.has(fieldName) || submitted) && !hasValue;
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {children}
        {hasValue && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500 pointer-events-none" />}
      </div>
      {showError && <p className="text-xs text-red-500 mt-1">Bitte ausfüllen</p>}
    </div>
  );
}

export default function BetreuungBeauftragen({ params }: { params: { leadId: string } }) {
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string>('');
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [agbAccepted, setAgbAccepted] = useState(false);

  const [formData, setFormData] = useState({
    anrede: '', vorname: '', nachname: '', email: '', phone: '',
    patientAnrede: '', patientVorname: '', patientNachname: '',
    patientStreet: '', patientZip: '', patientCity: '', specialRequirements: '',
  });

  useEffect(() => {
    const init = async () => {
      const id = params.leadId;
      setLeadId(id);
      try {
        const { data, error: dbError } = await supabase.from('leads').select('*').eq('id', id).maybeSingle();
        if (dbError) throw new Error('Datenbankfehler: ' + dbError.message);
        if (!data) throw new Error('Lead nicht gefunden');
        setLead(data);
        setFormData(prev => ({
          ...prev,
          anrede: data.anrede_text || data.anrede || '',
          vorname: data.vorname || '',
          nachname: data.nachname || '',
          email: data.email || '',
          phone: data.telefon || '',
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Fehler beim Laden');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [params.leadId]);

  const markTouched = (field: string) => setTouched(prev => new Set(prev).add(field));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const missing = requiredFields.filter(f => !fieldValid(f, formData[f as keyof typeof formData]?.toString() ?? ''));
    if (missing.length > 0) {
      // patientStreet has a min-length of 3 (Mamamia validation). Show
      // a tailored hint when that's the only thing wrong instead of
      // the generic "fill all required fields" line.
      if (missing.length === 1 && missing[0] === 'patientStreet') {
        setError('Strasse & Hausnummer: bitte mindestens 3 Zeichen eingeben.');
      } else {
        setError('Bitte füllen Sie alle Pflichtfelder aus.');
      }
      return;
    }
    if (!agbAccepted) { setError('Bitte akzeptieren Sie die Bedingungen.'); return; }
    setSubmitting(true);
    setError(null);
    try {
      const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/betreuung-beauftragen`;
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ leadId, ...formData }),
      });
      if (!response.ok) { const d = await response.json(); throw new Error(d.error || 'Fehler beim Senden'); }
      router.push(`/betreuung-beauftragen/${leadId}/bestaetigung`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F0EDE6] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#B5A184]" /></div>;
  if (error && !lead) return <div className="min-h-screen bg-[#F0EDE6] flex items-center justify-center"><div className="max-w-md bg-white rounded-2xl p-8 border border-gray-200"><h2 className="text-lg font-semibold text-[#3D2B1F] mb-2">Fehler</h2><p className="text-gray-600">{error}</p></div></div>;
  if (!lead) return null;

  const kalkulation = lead.kalkulation || {};
  const bruttopreis = kalkulation.bruttopreis || 0;
  const gesamteZuschuesse = kalkulation.zuschüsse?.gesamt || 0;
  const eigenanteil = kalkulation.eigenanteil || (bruttopreis - gesamteZuschuesse);
  const pflegegrad = kalkulation.formData?.pflegegrad || kalkulation.formularDaten?.pflegegrad || '';
  const displayName = [lead.vorname, lead.nachname].filter((s): s is string => Boolean(s)).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') || 'Kunde';

  const sec = "bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-3";

  return (
    <div className="min-h-screen bg-[#F0EDE6]">
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">

        {/* HEADER */}
        <div className={sec}>
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#B5A184]">
            <Image src="/images/primundus_logo_header.webp" alt="Primundus" width={150} height={42} className="h-7 w-auto object-contain" />
            <div className="flex items-center gap-2.5">
              <Image src="/images/ilka-wysocki_pm-mallorca.webp" alt="Ilka Wysocki" width={32} height={32} className="w-8 h-8 rounded-full object-cover object-top border border-[#F0997B] hidden sm:block flex-shrink-0" />
              <div className="flex flex-col items-end">
                <a href="tel:08920000830" className="flex items-center gap-1 text-[#8B6914] text-sm font-semibold">
                  <Phone className="w-3 h-3" /> 089 200 000 830
                </a>
                <span className="text-[10px] text-[#B5A184]">Ilka Wysocki · Mo–So 8–18 Uhr</span>
              </div>
            </div>
          </div>
          <div className="px-5 pt-4 pb-1 text-center">
            <div className="inline-flex items-center gap-1.5 bg-[#2D6A4F] text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
              <CheckCircle className="w-3 h-3" /> 100% Sorgenfrei und ohne Risiko
            </div>
          </div>
          <div className="px-5 pb-4 text-center">
            <h1 className="text-xl font-bold text-[#2D1F0F] mb-1">Betreuung jetzt beauftragen</h1>
            <p className="text-sm text-gray-500 leading-relaxed">Für Sie bleibt alles unverbindlich, bis Sie sich für eine passende Betreuungskraft entscheiden und diese anreist.</p>
          </div>
        </div>

        {/* KALKULATION + HEMMNIS */}
        <div className={sec}>
          <div className="px-5 pt-4 pb-1 text-[11px] font-semibold text-[#8B6914] uppercase tracking-wide">
            Ihre Kalkulation – {displayName}
          </div>
          <div className="divide-y divide-gray-100">
            <div className="flex justify-between items-center px-5 py-2.5 text-sm">
              <span className="text-gray-500">Monatssatz</span>
              <span className="font-semibold text-[#2D1F0F]">{formatEuro(bruttopreis)}</span>
            </div>
            <div className="flex justify-between items-center px-5 py-2.5 text-sm">
              <span className="text-gray-500">Zzgl. Fahrtkosten</span>
              <span className="font-semibold text-[#2D1F0F]">125 € pro Strecke</span>
            </div>
            <div className="flex justify-between items-center px-5 py-2.5 text-sm">
              <span className="text-gray-500">Zzgl. Kost & Logis</span>
              <span className="font-semibold text-[#2D1F0F]">Eigenes Zimmer + Verpflegung</span>
            </div>
          </div>
          {/* Hemmnisnehmer */}
          <div className="px-5 py-4 border-t border-gray-100 bg-[#fdfcfa] space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-[#2D6A4F] text-white text-[11px] font-bold px-2.5 py-1 rounded-full mb-1">
              <CheckCircle className="w-3 h-3" /> 100% Sorgenfrei und ohne Risiko
            </div>
            {[
              [Shield, 'Keine Vertragsbindung', 'täglich kündbar, maximale Flexibilität'],
              [FileText, 'Tagesgenaue Abrechnung', 'Kosten entstehen erst mit Anreise der Betreuungskraft'],
              [CheckCircle, 'Kosten erst bei Start', 'Sie zahlen nur, wenn die Betreuungskraft vor Ort arbeitet'],
            ].map(([Icon, title, sub]: any) => (
              <div key={title} className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-lg bg-[#EEF6F0] border border-[#C8E6D4] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#2D6A4F]" />
                </div>
                <div className="pt-0.5">
                  <span className="text-sm font-semibold text-[#2D1F0F]">{title}</span>
                  <span className="text-sm text-gray-500"> – {sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* KONTAKTDATEN */}
        <div className={sec}>
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
            <div className="w-7 h-7 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-[#2D6A4F]" />
            </div>
            <h3 className="text-sm font-semibold text-[#2D1F0F]">Kontaktperson</h3>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <FieldWrapper label="Anrede" required hasValue={!!formData.anrede} fieldName="anrede" touched={touched} submitted={submitted}>
                <Select value={formData.anrede} onValueChange={v => { setFormData({ ...formData, anrede: v }); markTouched('anrede'); }}>
                  <SelectTrigger className={selectClass('anrede', formData.anrede, touched, submitted)}><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
                  <SelectContent><SelectItem value="Herr">Herr</SelectItem><SelectItem value="Frau">Frau</SelectItem><SelectItem value="Familie">Familie</SelectItem></SelectContent>
                </Select>
              </FieldWrapper>
              <FieldWrapper label="Vorname" required hasValue={!!formData.vorname.trim()} fieldName="vorname" touched={touched} submitted={submitted}>
                <Input value={formData.vorname} onChange={e => setFormData({ ...formData, vorname: e.target.value })} onBlur={() => markTouched('vorname')} className={fieldClass('vorname', formData.vorname, touched, submitted)} />
              </FieldWrapper>
              <FieldWrapper label="Nachname" required hasValue={!!formData.nachname.trim()} fieldName="nachname" touched={touched} submitted={submitted}>
                <Input value={formData.nachname} onChange={e => setFormData({ ...formData, nachname: e.target.value })} onBlur={() => markTouched('nachname')} className={fieldClass('nachname', formData.nachname, touched, submitted)} />
              </FieldWrapper>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <FieldWrapper label="E-Mail" required hasValue={!!formData.email.trim()} fieldName="email" touched={touched} submitted={submitted}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} onBlur={() => markTouched('email')} className={`${fieldClass('email', formData.email, touched, submitted)} pl-8`} />
                </div>
              </FieldWrapper>
              <FieldWrapper label="Telefon" required hasValue={!!formData.phone.trim()} fieldName="phone" touched={touched} submitted={submitted}>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <Input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} onBlur={() => markTouched('phone')} className={`${fieldClass('phone', formData.phone, touched, submitted)} pl-8`} />
                </div>
              </FieldWrapper>
            </div>
          </div>
        </div>

        {/* EINSATZORT */}
        <div className={sec}>
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100">
            <div className="w-7 h-7 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#2D6A4F]" />
            </div>
            <h3 className="text-sm font-semibold text-[#2D1F0F]">Einsatzort der Betreuung</h3>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <FieldWrapper label="Anrede" required hasValue={!!formData.patientAnrede} fieldName="patientAnrede" touched={touched} submitted={submitted}>
                <Select value={formData.patientAnrede} onValueChange={v => { setFormData({ ...formData, patientAnrede: v }); markTouched('patientAnrede'); }}>
                  <SelectTrigger className={selectClass('patientAnrede', formData.patientAnrede, touched, submitted)}><SelectValue placeholder="Bitte wählen" /></SelectTrigger>
                  <SelectContent><SelectItem value="Herr">Herr</SelectItem><SelectItem value="Frau">Frau</SelectItem><SelectItem value="Familie">Familie</SelectItem></SelectContent>
                </Select>
              </FieldWrapper>
              <FieldWrapper label="Vorname" required hasValue={!!formData.patientVorname.trim()} fieldName="patientVorname" touched={touched} submitted={submitted}>
                <Input value={formData.patientVorname} onChange={e => setFormData({ ...formData, patientVorname: e.target.value })} onBlur={() => markTouched('patientVorname')} className={fieldClass('patientVorname', formData.patientVorname, touched, submitted)} />
              </FieldWrapper>
              <FieldWrapper label="Nachname" required hasValue={!!formData.patientNachname.trim()} fieldName="patientNachname" touched={touched} submitted={submitted}>
                <Input value={formData.patientNachname} onChange={e => setFormData({ ...formData, patientNachname: e.target.value })} onBlur={() => markTouched('patientNachname')} className={fieldClass('patientNachname', formData.patientNachname, touched, submitted)} />
              </FieldWrapper>
            </div>
            <FieldWrapper label="Strasse & Hausnummer" required hasValue={fieldValid('patientStreet', formData.patientStreet)} fieldName="patientStreet" touched={touched} submitted={submitted}>
              <Input value={formData.patientStreet} onChange={e => setFormData({ ...formData, patientStreet: e.target.value })} onBlur={() => markTouched('patientStreet')} placeholder="Musterstraße 123" className={fieldClass('patientStreet', formData.patientStreet, touched, submitted)} />
            </FieldWrapper>
            <div className="grid grid-cols-2 gap-2">
              <FieldWrapper label="PLZ" required hasValue={!!formData.patientZip.trim()} fieldName="patientZip" touched={touched} submitted={submitted}>
                <Input value={formData.patientZip} onChange={e => setFormData({ ...formData, patientZip: e.target.value })} onBlur={() => markTouched('patientZip')} placeholder="12345" className={fieldClass('patientZip', formData.patientZip, touched, submitted)} />
              </FieldWrapper>
              <FieldWrapper label="Ort" required hasValue={!!formData.patientCity.trim()} fieldName="patientCity" touched={touched} submitted={submitted}>
                <Input value={formData.patientCity} onChange={e => setFormData({ ...formData, patientCity: e.target.value })} onBlur={() => markTouched('patientCity')} placeholder="Musterstadt" className={fieldClass('patientCity', formData.patientCity, touched, submitted)} />
              </FieldWrapper>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Wünsche & Besonderheiten <span className="text-gray-400 font-normal">(optional)</span></label>
              <Textarea value={formData.specialRequirements} onChange={e => setFormData({ ...formData, specialRequirements: e.target.value })} placeholder="z.B. Sprachkenntnisse, Hobbys der betreuten Person…" rows={3} className="text-sm border border-gray-200 rounded-lg focus:border-[#2D6A4F] focus:ring-2 focus:ring-[#2D6A4F]/10 resize-none" />
            </div>
          </div>
        </div>

        {/* CONSENT + CTA */}
        <div className={sec}>
          <div className="px-5 py-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}
            <div className={`rounded-xl p-4 border mb-4 transition-colors ${agbAccepted ? 'bg-emerald-50/40 border-emerald-200' : 'bg-[#F5F0E8] border-[#B5A184]/30'}`}>
              <div className="flex items-start gap-3">
                <Checkbox id="agb" checked={agbAccepted} onCheckedChange={c => setAgbAccepted(c === true)} className="mt-0.5 border-[#B5A184] data-[state=checked]:bg-[#2D6A4F] data-[state=checked]:border-[#2D6A4F]" />
                <label htmlFor="agb" className="text-xs text-gray-600 cursor-pointer leading-relaxed">
                  Hiermit beauftrage ich Primundus (Vitanas Group) mit der Organisation einer passenden Betreuungskraft für eine 24-Stunden-Betreuung im eigenen Zuhause. Mir ist bekannt, dass die monatlichen Kosten in der im Angebot genannten Höhe entstehen, zuzüglich Fahrtkosten sowie freier Kost und Logis. Die Abrechnung beginnt erst mit der Anreise der Betreuungskraft. Die{' '}
                  <a href="/datenschutz" target="_blank" className="text-[#2D6A4F] underline">Datenschutzerklärung</a>{' '}
                  habe ich zur Kenntnis genommen; die verbindlichen Vertragsunterlagen erhalte ich anschließend zur Bestätigung.
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()} className="h-12 px-6 text-sm border-gray-200 text-gray-500" disabled={submitting}>
                Zurück
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || !agbAccepted} className="flex-1 h-12 text-sm bg-[#2A9D5C] hover:bg-[#239050] text-white font-semibold shadow-sm disabled:opacity-50 transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-[.97]">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Wird bearbeitet…</> : <><CheckCircle className="w-4 h-4 mr-2" />Jetzt Betreuung beauftragen</>}
              </Button>
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-3"><span className="text-red-400">*</span> Pflichtfelder</p>
          </div>
        </div>

        {/* WIE GEHT ES WEITER */}
        <div className={sec}>
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-[#2D1F0F]">Wie geht es weiter?</h3>
          </div>
          <div className="px-5 py-4 space-y-4">
            {[
              ['1', 'Wir klären offene Fragen', 'Unser Team meldet sich bei Ihnen, um alle Details zu besprechen.'],
              ['2', 'Personalauswahl startet sofort', 'Passende Betreuungskräfte werden für Sie ausgewählt.'],
              ['3', 'Vertrag & Anreise', 'Alle Formalitäten werden für Sie vorbereitet.'],
            ].map(([num, title, desc]) => (
              <div key={num} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2D6A4F] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{num}</div>
                <div>
                  <div className="text-sm font-semibold text-[#2D1F0F]">{title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ILKA */}
        <div className="bg-[#FFF8F6] rounded-2xl border border-[#F0C4B4] overflow-hidden shadow-sm mb-3">
          <div className="flex gap-3 p-4 items-start">
            <Image src="/images/ilka-wysocki_pm-mallorca.webp" alt="Ilka Wysocki" width={44} height={44} className="w-11 h-11 rounded-full object-cover object-top border-2 border-[#F0997B] flex-shrink-0" />
            <div>
              <div className="text-sm font-bold text-[#2D1F0F]">Ilka Wysocki</div>
              <div className="text-xs text-gray-400 mb-1">Ihre persönliche Beraterin · Mo–So, 8:00–18:00 Uhr</div>
              <a href="tel:08920000830" className="inline-flex items-center gap-1.5 text-[#E76F63] text-sm font-semibold">
                <Phone className="w-3 h-3" /> 089 200 000 830
              </a>
            </div>
          </div>
        </div>

        {/* TRUST FOOTER */}
        <div className={sec}>
          <div className="px-5 py-4">
            <div className="flex flex-wrap gap-4 items-center justify-center mb-4">
              {[
                [Users, '20+ Jahre Erfahrung'],
                [Award, '60.000+ Einsätze'],
                [Shield, 'Bestpreis-Garantie'],
              ].map(([Icon, label]: any) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-[#7A5C2E] font-semibold">
                  <Icon className="w-3.5 h-3.5 text-[#B5A184]" />{label}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
              <Image src="/images/primundus_testsieger-2021.webp" alt="Testsieger" width={44} height={44} className="h-11 w-auto border border-[#e8d9a0] rounded flex-shrink-0" />
              <div className="w-px h-7 bg-gray-200 flex-shrink-0" />
              <div className="flex flex-wrap gap-3 items-center">
                <Image src="/images/media/die-welt.webp" alt="Die Welt" width={50} height={20} className="h-4 w-auto opacity-60" />
                <Image src="/images/media/bild-der-frau.webp" alt="Bild" width={35} height={20} className="h-4 w-auto opacity-60" />
                <Image src="/images/media/frankfurter-allgemeine.webp" alt="FAZ" width={70} height={20} className="h-4 w-auto opacity-60" />
                <Image src="/images/media/ard.webp" alt="ARD" width={35} height={20} className="h-4 w-auto opacity-60" />
                <Image src="/images/media/ndr.webp" alt="NDR" width={35} height={20} className="h-4 w-auto opacity-60" />
                <Image src="/images/media/sat1.webp" alt="SAT.1" width={35} height={20} className="h-4 w-auto opacity-60" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
