'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Game } from '@/lib/types'
import GameEngine from '@/components/games/GameEngine'

export default function PlayPage() {
  const router = useRouter()
  const [game, setGame] = useState<Game | null>(null)

  useEffect(() => {
    const raw = sessionStorage.getItem('playGame')
    if (!raw) { router.replace('/library'); return }
    setGame(JSON.parse(raw))
  }, [router])

  if (!game) return null

  return (
    <GameEngine
      game={game}
      onExit={() => { sessionStorage.removeItem('playGame'); router.push('/library') }}
    />
  )
}
