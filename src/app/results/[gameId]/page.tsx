'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import TopBar from '@/components/TopBar'
import { loadGameSessions, loadGames } from '@/lib/db'
import type { GameSession } from '@/lib/types'
import styles from './results.module.css'

export default function ResultsPage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { user, loading } = useAuth()
  const router = useRouter()

  const [sessions, setSessions]   = useState<GameSession[]>([])
  const [gameName, setGameName]   = useState('')
  const [fetching, setFetching]   = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) { router.replace('/auth'); return }
    if (!loading && user) {
      loadGames().then(games => {
        const g = games.find(x => x.id === gameId)
        if (g) setGameName(g.name)
      })
      loadGameSessions(gameId as string).then(s => { setSessions(s); setFetching(false) })
    }
  }, [user, loading, gameId, router])

  if (loading || !user) return null

  return (
    <div className={styles.page}>
      <div className={styles.blob1} /><div className={styles.blob2} />
      <TopBar showBack />

      <div className={styles.wrap}>
        <div className={styles.header}>
          <h2 className={styles.title}>📊 نتائج الطلاب</h2>
          {gameName && <p className={styles.gameName}>{gameName}</p>}
          <p className={styles.count}>
            {fetching
              ? 'جارٍ التحميل…'
              : `${sessions.length} ${sessions.length === 1 ? 'طالب لعب' : 'طالب لعبوا'} هذه اللعبة`}
          </p>
        </div>

        {!fetching && sessions.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📭</span>
            <p className={styles.emptyTitle}>لم يلعب أي طالب بعد</p>
            <p className={styles.emptySub}>شارك رابط اللعبة مع طلابك من صفحة المكتبة</p>
          </div>
        )}

        <div className={styles.sessionList}>
          {sessions.map(s => {
            const pct = s.total > 0 ? Math.round((s.score / s.total) * 100) : 0
            const isExpanded = expandedId === s.id
            const badgeCls = pct >= 80 ? styles.scoreHigh : pct >= 50 ? styles.scoreMid : styles.scoreLow
            const date = new Date(s.playedAt).toLocaleString('ar-SA', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
            })
            return (
              <div key={s.id} className={styles.sessionCard}>
                <div
                  className={styles.sessionHeader}
                  onClick={() => setExpandedId(isExpanded ? null : s.id)}
                >
                  <div className={styles.studentInfo}>
                    <div className={styles.avatar}>
                      {s.studentName.charAt(0)}
                    </div>
                    <div>
                      <div className={styles.studentName}>{s.studentName}</div>
                      <div className={styles.sessionDate}>{date}</div>
                    </div>
                  </div>

                  <div className={styles.scoreSection}>
                    <div className={`${styles.scoreBadge} ${badgeCls}`}>
                      {s.score}/{s.total} &nbsp;·&nbsp; {pct}%
                    </div>
                    <span className={styles.arrow}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && s.answers.length > 0 && (
                  <div className={styles.answersTable}>
                    <div className={styles.answersHead}>
                      <span>#</span>
                      <span>السؤال</span>
                      <span>إجابة الطالب</span>
                      <span>النتيجة</span>
                    </div>
                    {s.answers.map((a, i) => (
                      <div
                        key={i}
                        className={`${styles.answerRow} ${a.correct ? styles.answerCorrect : styles.answerWrong}`}
                      >
                        <span className={styles.answerNum}>{i + 1}</span>
                        <span className={styles.answerPrompt}>{a.prompt}</span>
                        <span className={styles.answerGiven}>{a.studentAnswer || '—'}</span>
                        <span className={styles.answerIcon}>{a.correct ? '✅' : '❌'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
