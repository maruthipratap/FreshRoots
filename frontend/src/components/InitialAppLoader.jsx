import React, { useState, useEffect } from 'react'
import { FreshRootsLogo } from './Icons'

const quotes = [
  "Know your farmer, trust your food.",
  "Connecting Soil to Soul...",
  "Fresh harvests without middleman markups.",
  "Empowering local farmers, nourishing communities."
]

export default function InitialAppLoader({ onComplete }) {
  const [quoteIndex, setQuoteIndex] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length)
    }, 800)

    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => {
        if (onComplete) onComplete()
      }, 500)
    }, 2000)

    return () => {
      clearInterval(quoteInterval)
      clearTimeout(timer)
    }
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 text-white transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative mb-6 flex items-center justify-center">
        <div className="absolute h-28 w-28 animate-ping rounded-full bg-primary-500/20" />
        <div className="absolute h-20 w-20 animate-pulse rounded-full bg-accent-500/30" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white/10 p-3 backdrop-blur-md border border-white/20 shadow-2xl">
          <FreshRootsLogo className="h-16 w-16" />
        </div>
      </div>

      <div className="text-center px-6 max-w-md">
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-white mb-2">
          FreshRoots
        </h1>
        <p className="text-xs font-semibold tracking-widest text-primary-200 uppercase mb-6">
          Soil to Soul Direct Trade
        </p>

        <div className="h-12 flex items-center justify-center">
          <p className="text-sm font-medium text-accent-300 animate-reveal-up italic transition-all duration-300">
            "{quotes[quoteIndex]}"
          </p>
        </div>
      </div>

      {/* Loading Progress Bar */}
      <div className="mt-8 h-1.5 w-48 overflow-hidden rounded-full bg-primary-950/80 border border-white/10">
        <div className="h-full w-full bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 animate-pulse" />
      </div>
    </div>
  )
}
