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

const TYPES: { id: GameType; icon: string; label: string }[] = [
  { id: 'match-words',   icon: '🔗', label: 'وصّل الكلمات' },
  { id: 'sort-sentence', icon: '📖', label: 'رتّب الجملة' },
  { id: 'true-false',    icon: '✅', label: 'صح أم خطأ' },
  { id: 'mcq',           icon: '❓', label: 'اختر الجواب الصحيح' },
  { id: 'flashcard',     icon: '🃏', label: 'بطاقات تعليمية' },
  { id: 'fill-blank',    icon: '✏️', label: 'أكمل الفراغ' },
  { id: 'word-scramble', icon: '🔀', label: 'الكلمة المشفرة' },
  { id: 'categorize',    icon: '🗂️', label: 'صنّف الكلمات' },
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

    // Check if editing an existing game
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

  return (
    <div className={styles.page}>
      <TopBar showBack />
      <div className={styles.container}>

        <h2 className={styles.sectionTitle}>🎯 نوع اللعبة</h2>
        <p className={styles.sectionSub}>اختر نوع اللعبة التي تريد إنشاءها</p>

        <div className={styles.typeGrid}>
          {TYPES.map(t => (
            <div
              key={t.id}
              className={`${styles.typeCard} ${type===t.id ? styles.selected : ''}`}
              onClick={() => { setType(t.id); setEntries([]) }}
            >
              <span className={styles.typeIcon}>{t.icon}</span>
              <div className={styles.typeLabel}>{t.label}</div>
            </div>
          ))}
        </div>

        {type && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
