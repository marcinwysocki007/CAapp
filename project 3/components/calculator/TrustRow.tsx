"use client";

import { Shield, CheckCircle2, Star } from "lucide-react";

interface TrustRowProps {
  items?: Array<{
    icon: 'shield' | 'check' | 'star';
    text: string;
  }>;
}

const defaultItems = [
  { icon: 'shield' as const, text: 'DSGVO-konform' },
  { icon: 'check' as const, text: 'Kostenfrei' },
];

export function TrustRow({ items = defaultItems }: TrustRowProps) {
  const getIcon = (iconType: 'shield' | 'check' | 'star') => {
    switch (iconType) {
      case 'shield':
        return <Shield className="w-4 h-4" />;
      case 'check':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'star':
        return <Star className="w-4 h-4 fill-current" />;
    }
  };

  return (
    <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          {getIcon(item.icon)}
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}
