import type { FC } from 'react';
import { X } from 'lucide-react';

export const InfoPopup: FC<{ onClose: () => void }> = ({ onClose }) => (
  <>
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" onClick={onClose}
      style={{ animation: 'fadeIn 0.15s ease-out' }} />
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 pointer-events-none"
      style={{ animation: 'fadeIn 0.15s ease-out' }}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl pointer-events-auto shadow-2xl"
        style={{ animation: 'slideSheet 0.25s cubic-bezier(0.32,0.72,0,1)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        <div className="px-5 pt-4 pb-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Wie funktioniert das Einladen?</h2>
              <p className="text-xs text-gray-600 mt-0.5">Alles Wichtige auf einen Blick</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="bg-[#E3F7EF] border border-[#B8E8D4] rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-xl flex-shrink-0">✅</span>
            <p className="text-sm font-semibold text-[#1a7a4f]">
              Völlig unverbindlich — Sie gehen keinerlei Verpflichtung ein.
            </p>
          </div>

          <div className="space-y-3.5">
            {[
              { emoji: '🔍', title: 'Vorausgewählte Pflegekräfte', text: 'Wir haben Pflegekräfte bereits auf Basis Ihrer Anfrage gefiltert — nur passende Profile werden Ihnen vorgeschlagen.' },
              { emoji: '📩', title: 'Sofortige Benachrichtigung auf dem Handy', text: 'Die Pflegekraft erhält Ihre Einladung direkt als Nachricht auf ihr Handy und kann sofort reagieren und sich offiziell bewerben.' },
            ].map(item => (
              <div key={item.title} className="flex gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{item.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-0.5">{item.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full bg-[#9B1FA1] hover:bg-[#7B1A85] text-white rounded-xl py-3 text-sm font-bold transition-colors"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  </>
);
