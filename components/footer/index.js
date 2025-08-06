'use client'

import React from 'react';

export default function Footer() {
  return (
    <footer
      className="w-full flex justify-center items-center py-4 px-2"
      style={{
        background: "rgba(0, 0, 0, 0)", // fond doux, lisible sur le dégradé
        borderTop: "1px solid #e0e0e0",
        color: "var(--foreground)",
        fontSize: "1rem",
        fontWeight: 500,
        letterSpacing: "0.01em",
        backdropFilter: "blur(2px)",
      }}
    >
      <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center w-full justify-center text-center">
        <span>© 2025 MeteoNext</span>
        <span className="hidden md:inline">–</span>
        <a href="/mentions-legales" className="hover:underline focus:underline">Mentions légales</a>
        <span className="hidden md:inline">–</span>
        <a href="/contact" className="hover:underline focus:underline">Contact</a>
      </div>
    </footer>
  );
}
