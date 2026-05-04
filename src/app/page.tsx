'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import TopBar from '@/components/TopBar'
import { useAudio } from '@/lib/useAudio'
import styles from './home.module.css'

const CARDS = [
  { icon: '🎨', title: 'إنشاء لعبة جديدة', desc: 'للمعلمين — صمّم ألعابك بسهولة', href: '/create', cls: styles.teacher },
  { icon: '🎮', title: 'تشغيل لعبة',        desc: 'للأطفال — اختر لعبة واستمتع',  href: '/library', cls: styles.player },
  { icon: '🎡', title: 'دولاب الحظ',         desc: 'للمعلمين — اختر تلميذاً عشوائياً', href: '/wheel', cls: styles.wheel },
]

export default function HomePage() {
  const { user, username, loading } = useAuth()
  const router = useRouter()
  const { playClick, playHover } = useAudio()

  useEffect(() => {
    if (!loading && !user) router.replace('/auth')
  }, [user, loading, router])

  if (loading || !user) return null

  return (
    <div className={styles.page}>
      <div className={styles.blob1} /><div className={styles.blob2} />
      <TopBar showUser username={username} />

      <main className={styles.hero}>
        <span className={styles.heroEmoji}>🎓</span>
        <h1 className={styles.heroTitle}>ألعاب تعليمية مميزة<br/>للأطفال الصغار</h1>
        <p className={styles.heroSub}>أنشئ ألعابك الخاصة في دقائق، ودع الأطفال يستمتعون باللعب والتعلم!</p>

        <div className={styles.cards}>
          {CARDS.map(c => (
            <div key={c.href} className={`${styles.card} ${c.cls}`}
              onMouseEnter={playHover}
              onClick={() => { playClick(); router.push(c.href) }}>
              <span className={styles.cardIcon}>{c.icon}</span>
              <div className={styles.cardTitle}>{c.title}</div>
              <div className={styles.cardDesc}>{c.desc}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
