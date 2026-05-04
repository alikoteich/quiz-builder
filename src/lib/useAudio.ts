'use client'

import { useRef, useEffect } from 'react'

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // pointerdown fires before click — pre-create and resume the AudioContext
    // so it's ready the instant the user's finger lifts and onClick fires.
    const warmUp = () => {
      try {
        if (!ctxRef.current) ctxRef.current = new AudioContext()
        if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
      } catch {}
    }
    document.addEventListener('pointerdown', warmUp, { capture: true })
    return () => document.removeEventListener('pointerdown', warmUp, true)
  }, [])

  function getCtx(): AudioContext | null {
    try {
      if (!ctxRef.current) return null
      if (ctxRef.current.state === 'suspended') ctxRef.current.resume()
      return ctxRef.current
    } catch { return null }
  }

  function tone(freq: number, type: OscillatorType = 'sine', duration = 0.1, vol = 0.28, startDelay = 0) {
    const ctx = getCtx(); if (!ctx) return
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = type; osc.frequency.value = freq
      gain.gain.setValueAtTime(vol, ctx.currentTime + startDelay)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration)
      osc.start(ctx.currentTime + startDelay)
      osc.stop(ctx.currentTime + startDelay + duration)
    } catch {}
  }

  function sweep(freqFrom: number, freqTo: number, type: OscillatorType, duration: number, vol: number) {
    const ctx = getCtx(); if (!ctx) return
    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = type
      osc.frequency.setValueAtTime(freqFrom, ctx.currentTime)
      osc.frequency.linearRampToValueAtTime(freqTo, ctx.currentTime + duration)
      gain.gain.setValueAtTime(vol, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      osc.start(); osc.stop(ctx.currentTime + duration)
    } catch {}
  }

  function noise(duration: number, vol: number) {
    const ctx = getCtx(); if (!ctx) return
    try {
      const bufSize = ctx.sampleRate * duration
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1
      const src = ctx.createBufferSource()
      src.buffer = buf
      const gain = ctx.createGain()
      src.connect(gain); gain.connect(ctx.destination)
      gain.gain.setValueAtTime(vol, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
      src.start(); src.stop(ctx.currentTime + duration)
    } catch {}
  }

  return {
    // ── Existing ────────────────────────────────────────────────────────────
    playSuccess: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', 0.24, 0.22, i * 0.085)),
    playError:   () => { tone(200, 'sawtooth', 0.18, 0.22); tone(160, 'sawtooth', 0.28, 0.22, 0.11) },

    // ── UI clicks ────────────────────────────────────────────────────────────
    playClick: () => tone(600, 'sine', 0.07, 0.18),

    playHover: () => tone(880, 'sine', 0.03, 0.045),

    // ── Wheel ────────────────────────────────────────────────────────────────
    playWheelStart: () => {
      sweep(80, 500, 'sawtooth', 0.35, 0.12)
      noise(0.25, 0.06)
    },

    playTick: (speed = 0.5) => {
      // speed 0→1: higher pitch and shorter when fast, lower and longer when slow
      const freq = 180 + speed * 420      // 180 Hz slow → 600 Hz fast
      const dur  = 0.04 - speed * 0.025  // longer tick when slow
      const vol  = 0.06 + speed * 0.06
      tone(freq, 'square', dur, vol)
    },

    playWheelStop: () => {
      // Triumphant ascending ding-ding-ding-dong
      const notes = [784, 988, 1175, 1568, 1175, 1568]
      notes.forEach((f, i) => tone(f, 'sine', 0.32, 0.18, i * 0.09))
    },

    // ── Flashcard ────────────────────────────────────────────────────────────
    playCardFlip: () => {
      sweep(300, 600, 'sine', 0.08, 0.12)
      noise(0.06, 0.04)
    },

    // ── Letter / word placement ───────────────────────────────────────────────
    playLetterPlace: () => tone(520, 'sine', 0.055, 0.16),
    playLetterRemove: () => tone(320, 'sine', 0.05, 0.10),

    // ── Match words ──────────────────────────────────────────────────────────
    playMatch: () => {
      tone(659, 'sine', 0.18, 0.20)
      tone(784, 'sine', 0.16, 0.18, 0.09)
    },

    // ── Drag & drop ──────────────────────────────────────────────────────────
    playDragStart: () => tone(400, 'sine', 0.06, 0.10),
    playDrop:      () => {
      tone(300, 'sine', 0.10, 0.18)
      tone(220, 'sine', 0.14, 0.12, 0.06)
    },

    // ── Game start jingle ────────────────────────────────────────────────────
    playGameStart: () => {
      const melody = [523, 659, 784, 659, 784, 1047]
      melody.forEach((f, i) => tone(f, 'sine', 0.22, 0.20, i * 0.10))
    },
  }
}
