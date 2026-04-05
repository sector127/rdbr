"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "./Button";

const HERO_IMAGES = [
  "/hero-one.png",
  "/hero-two.png",
  "/hero-three.png",
];

export function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < HERO_IMAGES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div
      className="relative w-[1566px] max-w-full h-[420px] mx-auto overflow-hidden rounded-3xl mt-16 flex flex-col justify-start bg-zinc-900"
    >
      {/* Background Image Carousel */}
      {HERO_IMAGES.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}
        >
          <Image
            src={src}
            alt="Hero Background"
            fill
            className="object-cover"
            priority={index === 0}
          />
        </div>
      ))}

      {/* Gradient overlay to ensure text remains readable */}
      <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40 to-transparent z-10 pointer-events-none"></div>

      <div className="relative z-20 p-12 flex flex-col items-start">
        <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
          Start learning something new today
        </h1>
        <p className="text-md md:text-2xl text-white/90 mb-8 max-w-7xl font-light">
          Explore a wide range of expert-led courses in design, development, business, and more. Find the skills you need to grow your career and learn at your own pace.
        </p>
        <Button variant="solid" className="bg-indigo-600 hover:bg-indigo-500 border-none px-[25px] py-[18px] text-xl shadow-lg transition-transform hover:-translate-y-0.5">
          Browse Courses
        </Button>
      </div>

      {/* Carousel Controls */}
      <div className="absolute bottom-[78px] left-0 right-0 z-20 flex items-center justify-center">
        <div className="flex gap-2">
          {HERO_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-[57px] rounded-full transition-opacity ${index === currentIndex ? 'bg-white opacity-100' : 'bg-white opacity-40 hover:opacity-70'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Arrows */}
      <div className="absolute bottom-[59px] right-[78px] z-20 flex gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-white transition-colors backdrop-blur-sm ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed bg-black/10' : 'hover:bg-white/20 bg-black/20'}`}
          aria-label="Previous slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button
          onClick={handleNext}
          disabled={currentIndex === HERO_IMAGES.length - 1}
          className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-white transition-colors backdrop-blur-sm ${currentIndex === HERO_IMAGES.length - 1 ? 'opacity-30 cursor-not-allowed bg-black/10' : 'hover:bg-white/20 bg-black/20'}`}
          aria-label="Next slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </div>
  );
}
