'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import GameEngine from '@/components/games/GameEngine'
import { loadGameByToken, saveGameSession } from '@/lib/db'
import type { Game, AnswerRecord } from '@/lib/types'
import styles from './play.module.css'

type Phase = 'loading' | 'not-found' | 'name-entry' | 'playing' | 'done'

export default function StudentPlayPage() {
  const { token } = useParams<{ token: string }>()
  const [game, setGame]               = useState<Game | null>(null)
  const [phase, setPhase]             = useState<Phase>('loading')
  const [studentName, setStudentName] = useState('')
  const [finalScore, setFinalScore]   = useState(0)
  const [finalTotal, setFinalTotal]   = useState(0)

  useEffect(() => {
    if (!token) return
    loadGameByToken(token as string).then(g => {
      if (!g) { setPhase('not-found'); return }
      setGame(g)
      setPhase('name-entry')
    })
  }, [token])

  async function handleComplete(result: { answers: AnswerRecord[]; score: number; total: number }) {
    if (!game) return
    setFinalScore(result.score)
    setFinalTotal(result.total)
    await saveGameSession(game.id, studentName.trim(), result.answers, result.score, result.total)
    setPhase('done')
  }

  if (phase === 'loading') return (
    <div className={styles.center}>
      <div className={styles.spinner} />
      <p className={styles.loadingText}>جارٍ تحميل اللعبة…</p>
    </div>
  )

  if (phase === 'not-found') return (
    <div className={styles.center}>
      <span className={styles.notFoundIcon}>😕</span>
      <h2 className={styles.notFoundTitle}>لم يتم العثور على اللعبة</h2>
      <p className={styles.notFoundSub}>تأكد من صحة الرابط أو تواصل مع معلمك</p>
    </div>
  )

  if (phase === 'name-entry') return (
    <div className={styles.namePage}>
      <div className={styles.blob1} /><div className={styles.blob2} />
      <div className={styles.nameCard}>
        <span className={styles.gameEmoji}>🎮</span>
        <h1 className={styles.gameTitle}>{game!.name}</h1>
        <p className={styles.namePrompt}>أدخل اسمك للبدء</p>
        <input
          className="form-input"
          placeholder="اسمك هنا…"
          value={studentName}
          onChange={e => setStudentName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && studentName.trim() && setPhase('playing')}
          autoFocus
          style={{ marginBottom: 16, fontSize: '1.15rem', textAlign: 'center' }}
        />
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setPhase('playing')}
          disabled={!studentName.trim()}
          style={{ width: '100%' }}
        >
          🚀 ابدأ اللعبة!
        </button>
      </div>
    </div>
  )

  if (phase === 'done') {
    const pct = finalTotal > 0 ? Math.round((finalScore / finalTotal) * 100) : 0
    const stars = pct >= 80 ? '⭐⭐⭐' : pct >= 50 ? '⭐⭐' : '⭐'
    return (
      <div className={styles.namePage}>
        <div className={styles.blob1} /><div className={styles.blob2} />
        <div className={styles.doneCard}>
          <span className={styles.doneEmoji}>{pct >= 80 ? '🏆' : pct >= 50 ? '🌟' : '💪'}</span>
          <h1 className={styles.doneName}>أحسنت، {studentName}!</h1>
          <div className={styles.doneStars}>{stars}</div>
          <p className={styles.doneScore}>{finalScore} من {finalTotal} إجابات صحيحة ({pct}%)</p>
          <div className={styles.doneSaved}>✅ تم تسجيل نتيجتك بنجاح</div>
        </div>
      </div>
    )
  }

  return (
    <GameEngine
      game={game!}
      onExit={() => setPhase('name-entry')}
      studentMode
      studentName={studentName}
      onComplete={handleComplete}
    />
  )
}
