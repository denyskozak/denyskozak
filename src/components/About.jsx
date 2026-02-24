import React, {useRef} from 'react';
import ScrollReveal from './ScrollReveal.jsx';
import { Highlighter } from "@/components/ui/highlighter";

export default function About() {
    const scrollContainerRef1 = useRef(null);
    const scrollContainerRef2 = useRef(null);
    const scrollContainerRef3 = useRef(null);

  return (
    <section id="about" className="w-full min-h-screen bg-white text-black p-8 sm:p-16 md:p-24 flex items-center justify-center">
      <div className="max-w-4xl text-center">
        <div className="mb-12 flex justify-center">
                    <h2 className="text-5xl font-bold font-pixel underline-wavy-yellow inline-block">
                        <Highlighter action="underline" color="#FFD700">
                            About Me 😊
                        </Highlighter>
                    </h2>
        </div>
        <div className="flex flex-col gap-4 lg:gap-8">
            <p className="font-sans text-base sm:text-lg md:text-xl text-[clamp(1.6rem,4vw,3rem)] leading-[1.5] font-semibold">
                I'm enjoying you build scalable, reliable, maintainable web application with highly-interactive interface.
                Build sustainable teams and work-flow. Enchance Development-Experience
            </p>
            <p className="font-sans text-base sm:text-lg md:text-xl text-[clamp(1.6rem,4vw,3rem)] leading-[1.5] font-semibold">
                Experienced with SSR Micro-frontends for over 10 millions users.
                Participated Startups from Scratch to First 1000+ users Production.
                Craft React-Native iOS Application
            </p>
            <p className="font-sans text-base sm:text-lg md:text-xl text-[clamp(1.6rem,4vw,3rem)] leading-[1.5] font-semibold">
                Domains: E-Commerce, Fin-tech, Ed-tech, DeFi
            </p>
        </div>


      </div>
    </section>
  );
}