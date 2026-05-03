'use client'

import { useRef, useEffect } from 'react'

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null)
  const interacted = useRef(false)

  useEffect(() => {
    const handler = () => { interacted.current = true }
    document.addEventListener('click', handler, { once: true, capture: true })
    return () => document.removeEventListener('click', handler, true)
  }, [])

  function tone(freq: number, type: OscillatorType = 'sine', duration = 0.1, vol = 0.28) {
    if (!interacted.current) return
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext()
      const ctx = ctxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = type; osc.frequency.value = freq
      gain.gain.setValueAtTime(vol, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.start(); osc.stop(ctx.currentTime + duration)
    } catch {}
  }

  return {
    playClick:   () => tone(440, 'sine', 0.07, 0.13),
    playSuccess: () => [523,659,784,1047].forEach((f, i) => setTimeout(() => tone(f,'sine',.24), i*85)),
    playError:   () => { tone(200,'sawtooth',.18,.22); setTimeout(() => tone(160,'sawtooth',.28,.22),110) },
  }
}
