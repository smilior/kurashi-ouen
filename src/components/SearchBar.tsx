"use client";

import { useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
};

export function SearchBar({ value, onChange, compact }: Props) {
  const [input, setInput] = useState(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(input);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        className={`flex items-center gap-3 rounded-2xl bg-white/90 shadow-lg backdrop-blur-sm transition-all ${
          compact ? "px-4 py-2.5" : "px-5 py-3.5"
        }`}
      >
        <svg
          className="h-5 w-5 shrink-0 text-[#8B7355]/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="お店名・品目で検索..."
          className={`w-full bg-transparent text-[#2D2D2D] placeholder-[#8B7355]/40 outline-none ${
            compact ? "text-sm" : "text-base"
          }`}
        />
        {input && (
          <button
            type="button"
            onClick={() => {
              setInput("");
              onChange("");
            }}
            className="shrink-0 text-[#8B7355]/40 hover:text-[#FF6B6B]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}
