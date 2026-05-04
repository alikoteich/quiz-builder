'use client'
import { useRef, useState } from 'react'
import { useToast } from '@/components/Toast'
import type { FillBlankEntry } from '@/lib/types'
import styles from '../FormArea.module.css'
import EntryList from '../EntryList'

interface Props { entries: FillBlankEntry[]; onChange: (e: FillBlankEntry[]) => void }

export default function FillBlankForm({ entries, onChange }: Props) {
  const { showToast } = useToast()
  const [sentence, setSentence] = useState('')
  const [answer, setAnswer]     = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function insertBlank() {
    const el = inputRef.current
    if (!el) { setSentence(s => s + '___'); return }
    const start = el.selectionStart ?? sentence.length
    const end   = el.selectionEnd   ?? sentence.length
    const next  = sentence.slice(0, start) + '___' + sentence.slice(end)
    setSentence(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + 3, start + 3)
    })
  }

  function add() {
    if (!sentence.trim()) return showToast('⚠️ أدخل الجملة')
    if (!sentence.includes('___')) return showToast('⚠️ ضع الفراغ في الجملة بالضغط على زر "إدراج فراغ"')
    if (!answer.trim())   return showToast('⚠️ أدخل كلمة الفراغ')
    onChange([...entries, { sentence: sentence.trim(), answer: answer.trim() }])
    setSentence(''); setAnswer('')
  }

  const parts = sentence.split('___')

  return (
    <>
      <div className={styles.area}>
        <h3 className={styles.title}>✏️ أكمل الفراغ</h3>

        <div className={styles.row}>
          <label className={styles.label}>الجملة</label>
          <div className={styles.inputWithBtn}>
            <input
              ref={inputRef}
              className="form-input"
              value={sentence}
              onChange={e => setSentence(e.target.value)}
              placeholder="مثال: الشمس تشرق من الشرق"
            />
            <button type="button" className={styles.insertBtn} onClick={insertBlank}>
              📍 إدراج فراغ
            </button>
          </div>
          {sentence && (
            <div className={styles.preview}>
              <span className={styles.previewLabel}>معاينة: </span>
              {parts.map((part, i) => (
                <span key={i}>
                  {part}
                  {i < parts.length - 1 && <span className={styles.blankGap}>_____</span>}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className={styles.row}>
          <label className={styles.label}>الكلمة الصحيحة للفراغ</label>
          <input className="form-input" value={answer} onChange={e => setAnswer(e.target.value)}
            placeholder="مثال: الشرق" onKeyDown={e => e.key === 'Enter' && add()} />
        </div>
        <button className="btn btn-primary" onClick={add}>➕ إضافة سؤال</button>
      </div>
      <EntryList items={entries.map(e => `✏️ ${e.sentence} [${e.answer}]`)} onDelete={i => onChange(entries.filter((_, j) => j !== i))} />
    </>
  )
}
