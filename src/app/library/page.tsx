'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import TopBar from '@/components/TopBar'
import { useToast } from '@/components/Toast'
import { loadGames, deleteGame, getOrCreateShareToken } from '@/lib/db'
import type { Game, GameType } from '@/lib/types'
import styles from './library.module.css'

const TYPE_META: Record<GameType, { icon: string; label: string }> = {
  'match-words':   { icon: '🔗', label: 'وصّل الكلمات' },
  'sort-sentence': { icon: '📖', label: 'رتّب الجملة' },
  'true-false':    { icon: '✅', label: 'صح أم خطأ' },
  'mcq':           { icon: '❓', label: 'اختر الجواب' },
  'flashcard':     { icon: '🃏', label: 'بطاقات تعليمية' },
  'fill-blank':    { icon: '✏️', label: 'أكمل الفراغ' },
  'word-scramble': { icon: '🔀', label: 'الكلمة المشفرة' },
  'categorize':    { icon: '🗂️', label: 'صنّف الكلمات' },
}

export default function LibraryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const [games, setGames]       = useState<Game[]>([])
  const [fetching, setFetching] = useState(true)
  const [sharing, setSharing]   = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) { router.replace('/auth'); return }
    if (!loading && user) {
      loadGames().then(g => { setGames(g); setFetching(false) })
    }
  }, [user, loading, router])

  async function handleShare(game: Game) {
    if (!user) return
    setSharing(game.id)
    const token = await getOrCreateShareToken(game.id, user.id)
    setSharing(null)
    if (!token) { showToast('⚠️ تعذّر إنشاء رابط المشاركة'); return }
    const url = `${window.location.origin}/play/${token}`
    try {
      await navigator.clipboard.writeText(url)
      showToast('✅ تم نسخ رابط اللعبة!')
    } catch {
      showToast(`🔗 ${url}`)
    }
    setGames(g => g.map(x => x.id === game.id ? { ...x, share_token: token } : x))
  }

  async function handleDelete(id: string) {
    if (!confirm('هل تريد حذف هذه اللعبة؟')) return
    await deleteGame(id)
    setGames(g => g.filter(x => x.id !== id))
  }

  function handlePlay(game: Game) {
    sessionStorage.setItem('playGame', JSON.stringify(game))
    router.push('/play')
  }

  if (loading || !user) return null

  return (
    <div className={styles.page}>
      <div className={styles.blob1} /><div className={styles.blob2} />
      <TopBar showBack />

      <div className={styles.header}>
        <h2 className={styles.title}>🎮 ألعابي المحفوظة</h2>
        <p className={styles.sub}>{fetching ? 'جارٍ التحميل…' : `${games.length} لعبة`}</p>
      </div>

      <div className={styles.grid}>
        {!fetching && games.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🎲</span>
            <p>لا توجد ألعاب بعد — أنشئ لعبتك الأولى!</p>
          </div>
        )}
        {games.map(game => {
          const meta = TYPE_META[game.type]
          return (
            <div key={game.id} className={styles.card} data-type={game.type}>
              <div className={styles.cardIcon}>{meta.icon}</div>
              <div className={styles.cardName}>{game.name}</div>
              <div className={styles.cardMeta}>{meta.label} · {game.entries.length} عناصر</div>
              <div className={styles.cardActions}>
                <button className={styles.btnPlay}    onClick={() => handlePlay(game)}>▶ تشغيل</button>
                <button className={styles.btnEdit}    onClick={() => { sessionStorage.setItem('editGame', JSON.stringify(game)); router.push('/create') }}>✏️ تعديل</button>
                <button className={styles.btnShare}   onClick={() => handleShare(game)} disabled={sharing === game.id}>
                  {sharing === game.id ? '…' : '🔗 مشاركة'}
                </button>
                <button className={styles.btnResults} onClick={() => router.push(`/results/${game.id}`)}>📊 نتائج</button>
                <button className={styles.btnDelete}  onClick={() => handleDelete(game.id)}>🗑</button>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.footer}>
        <button className="btn btn-primary" onClick={() => router.push('/create')}>+ إنشاء لعبة جديدة</button>
      </div>
    </div>
  )
}
