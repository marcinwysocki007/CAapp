import type { FC } from 'react';
import { X, Phone } from 'lucide-react';

const MEDIA_LOGOS = [
  { src: '/media-welt.webp',       alt: 'Die Welt' },
  { src: '/media-bildderfau.webp', alt: 'Bild der Frau' },
  { src: '/media-faz.webp',        alt: 'FAZ' },
  { src: '/media-ard.webp',        alt: 'ARD' },
  { src: '/media-ndr.webp',        alt: 'NDR' },
  { src: '/media-sat1.webp',       alt: 'SAT.1' },
];

export const ContactPopup: FC<{ onClose: () => void }> = ({ onClose }) => (
  <>
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
      onClick={onClose}
      style={{ animation: 'fadeIn 0.15s ease-out' }}
    />
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 pointer-events-none"
      style={{ animation: 'fadeIn 0.15s ease-out' }}
    >
      <div
        className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl pointer-events-auto shadow-2xl overflow-hidden"
        style={{ animation: 'slideSheet 0.25s cubic-bezier(0.32,0.72,0,1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-9 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="px-5 pt-4 pb-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Ihre Beraterin</p>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <img
                src="/ilka.webp"
                alt="Ilka Wysocki"
                className="w-[72px] h-[72px] rounded-2xl object-cover object-top"
                style={{ border: '1.5px solid #F0C4B4' }}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#22A06B] rounded-full border-2 border-white">
                <span className="relative flex h-full w-full items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-60" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-base leading-tight">Ilka Wysocki</p>
              <p className="text-xs text-gray-500 mb-2.5">Pflegeberaterin · Primundus</p>
              <a
                href="tel:089200000830"
                className="inline-flex items-center gap-1.5 text-[#9B1FA1] font-bold text-sm hover:opacity-80 transition-opacity"
              >
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                089 200 000 830
              </a>
              <p className="text-xs text-gray-500 mt-0.5">Mo–So, 8:00–18:00 Uhr</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-center bg-gray-50 rounded-xl py-3 px-1 border border-gray-100">
              <img src="/badge-testsieger.webp" alt="Testsieger" className="h-8 w-auto mx-auto mb-1.5 object-contain" />
              <p className="text-xs font-semibold text-gray-500 leading-tight">Testsieger<br/>Die Welt</p>
            </div>
            <div className="text-center bg-gray-50 rounded-xl py-3 px-1 border border-gray-100">
              <div className="flex justify-center mb-1.5">
                <svg className="w-6 h-6 text-[#9B1FA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 leading-tight">20+ Jahre<br/>Erfahrung</p>
            </div>
            <div className="text-center bg-gray-50 rounded-xl py-3 px-1 border border-gray-100">
              <div className="flex justify-center mb-1.5">
                <svg className="w-6 h-6 text-[#9B1FA1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-gray-500 leading-tight">60.000+<br/>Einsätze</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider text-center mb-2.5">Bekannt aus</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {MEDIA_LOGOS.map(logo => (
                <img
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.alt}
                  className="h-4 w-auto object-contain opacity-50 grayscale"
                />
              ))}
            </div>
          </div>

          <a
            href="tel:089200000830"
            className="flex items-center justify-center gap-2 w-full bg-[#9B1FA1] hover:bg-[#7B1A85] text-white rounded-xl py-3 text-sm font-bold transition-colors"
          >
            <Phone className="w-4 h-4" />
            Jetzt anrufen
          </a>
        </div>
      </div>
    </div>
  </>
);
