'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import TopBar from '@/components/TopBar'
import { useToast } from '@/components/Toast'
import { saveGame } from '@/lib/db'
import type { Game, GameType, GameEntry } from '@/lib/types'

import MatchWordsForm   from '@/components/games/MatchWordsForm'
import SortSentenceForm from '@/components/games/SortSentenceForm'
import TrueFalseForm    from '@/components/games/TrueFalseForm'
import McqForm          from '@/components/games/McqForm'
import FlashcardForm    from '@/components/games/FlashcardForm'
import FillBlankForm    from '@/components/games/FillBlankForm'
import WordScrambleForm from '@/components/games/WordScrambleForm'
import CategorizeForm   from '@/components/games/CategorizeForm'

import styles from './create.module.css'

const TYPES: { id: GameType; icon: string; label: string; color: string; desc: string }[] = [
  { id: 'match-words',   icon: '🔗', label: 'وصّل الكلمات',       color: '#6B77FF', desc: 'صل كل كلمة بما يناسبها' },
  { id: 'sort-sentence', icon: '📖', label: 'رتّب الجملة',         color: '#FF9F43', desc: 'رتّب الكلمات لتكوين جملة' },
  { id: 'true-false',    icon: '✅', label: 'صح أم خطأ',           color: '#6BCB77', desc: 'اختر الإجابة الصحيحة' },
  { id: 'mcq',           icon: '❓', label: 'اختر الجواب',         color: '#C77DFF', desc: 'اختر من بين خيارات' },
  { id: 'flashcard',     icon: '🃏', label: 'بطاقات تعليمية',      color: '#4CC9F0', desc: 'بطاقات مزدوجة للحفظ' },
  { id: 'fill-blank',    icon: '✏️', label: 'أكمل الفراغ',         color: '#F72585', desc: 'أكمل الجملة بالكلمة المناسبة' },
  { id: 'word-scramble', icon: '🔀', label: 'الكلمة المشفرة',      color: '#FF6B6B', desc: 'رتّب الحروف لتكوين كلمة' },
  { id: 'categorize',    icon: '🗂️', label: 'صنّف الكلمات',        color: '#2EC4B6', desc: 'اسحب الكلمات إلى فئاتها' },
]

export default function CreatePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()

  const [type, setType]       = useState<GameType | null>(null)
  const [name, setName]       = useState('')
  const [entries, setEntries] = useState<GameEntry[]>([])
  const [editId, setEditId]   = useState<string | null>(null)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (!loading && !user) { router.replace('/auth'); return }
    const raw = sessionStorage.getItem('editGame')
    if (raw) {
      sessionStorage.removeItem('editGame')
      const g: Game = JSON.parse(raw)
      setType(g.type)
      setName(g.name)
      setEntries(g.entries)
      setEditId(String(g.id))
    }
  }, [user, loading, router])

  async function handleSave() {
    if (!name.trim()) return showToast('⚠️ أدخل اسماً للعبة')
    if (!type)        return showToast('⚠️ اختر نوع اللعبة')
    if (entries.length < 1) return showToast('⚠️ أضف عنصراً واحداً على الأقل')

    setSaving(true)
    const game: Game = {
      id:      editId ?? String(Date.now()),
      name:    name.trim(),
      type,
      entries,
      created: new Date().toLocaleDateString('ar'),
    }
    const ok = await saveGame(game, user!.id)
    setSaving(false)
    if (!ok) { showToast('⚠️ تعذّر الحفظ في قاعدة البيانات'); return }
    showToast('🎉 تم حفظ اللعبة!')
    setTimeout(() => router.push('/library'), 800)
  }

  if (loading || !user) return null

  const FormComponent = type === 'match-words'   ? MatchWordsForm
    : type === 'sort-sentence' ? SortSentenceForm
    : type === 'true-false'    ? TrueFalseForm
    : type === 'mcq'           ? McqForm
    : type === 'flashcard'     ? FlashcardForm
    : type === 'fill-blank'    ? FillBlankForm
    : type === 'word-scramble' ? WordScrambleForm
    : type === 'categorize'    ? CategorizeForm
    : null

  const selectedType = TYPES.find(t => t.id === type)

  return (
    <div className={styles.page}>
      <div className={styles.blob1} /><div className={styles.blob2} />
      <TopBar showBack />

      <div className={styles.container}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>🎨 إنشاء لعبة جديدة</h1>
          <p className={styles.heroSub}>اختر نوع اللعبة التي تريد إنشاءها</p>
        </div>

        <div className={styles.typeGrid}>
          {TYPES.map(t => (
            <div
              key={t.id}
              className={`${styles.typeCard} ${type === t.id ? styles.selected : ''}`}
              onClick={() => { setType(t.id); setEntries([]) }}
              style={{ '--card-color': t.color } as React.CSSProperties}
            >
              <span className={styles.typeIcon}>{t.icon}</span>
              <div className={styles.typeLabel}>{t.label}</div>
              <div className={styles.typeDesc}>{t.desc}</div>
            </div>
          ))}
        </div>

        {type && selectedType && (
          <div className={styles.formPanel}>
            <div className={styles.formPanelHeader}>
              <span className={styles.formPanelIcon}>{selectedType.icon}</span>
              <div>
                <div className={styles.formPanelTitle}>{selectedType.label}</div>
                <div className={styles.formPanelSub}>{selectedType.desc}</div>
              </div>
            </div>

            <div className={styles.formPanelBody}>
              <div className={styles.nameWrap}>
                <label className={styles.formLabel}>✏️ اسم اللعبة</label>
                <input
                  className="form-input"
                  placeholder="مثال: رتّب الحروف مع المعلمة نور"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              {FormComponent && (
                <FormComponent entries={entries as any} onChange={setEntries as any} />
              )}

              <div className={styles.actionsBar}>
                <button className="btn btn-ghost" onClick={() => router.push('/')}>إلغاء</button>
                <button className="btn btn-success" onClick={handleSave} disabled={saving}>
                  {saving ? 'جارٍ الحفظ…' : editId ? '💾 تحديث اللعبة' : '💾 حفظ اللعبة'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
