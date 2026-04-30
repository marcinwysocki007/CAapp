"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';

const caregiverImages = [
  "https://images.pexels.com/photos/5214997/pexels-photo-5214997.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=400",
  "https://images.pexels.com/photos/7551613/pexels-photo-7551613.jpeg?auto=compress&cs=tinysrgb&w=400",
];

export function CarouselImages() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % caregiverImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#E5E3DF] shadow-sm">
      {caregiverImages.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={src}
            alt="Pflegekraft"
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
