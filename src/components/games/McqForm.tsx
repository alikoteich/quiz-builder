'use client'

import { useState } from 'react'
import { useToast } from '@/components/Toast'
import type { McqEntry } from '@/lib/types'
import styles from './FormArea.module.css'
import optStyles from './McqForm.module.css'
import EntryList from './EntryList'

interface Props { entries: McqEntry[]; onChange: (e: McqEntry[]) => void }

export default function McqForm({ entries, onChange }: Props) {
  const { showToast } = useToast()
  const [question, setQ]      = useState('')
  const [options, setOpts]    = useState<{ text: string; isCorrect: boolean }[]>([])
  const [newOpt, setNewOpt]   = useState('')

  function addOption() {
    if (!newOpt.trim()) return showToast('⚠️ أدخل نص الخيار')
    setOpts(o => [...o, { text: newOpt.trim(), isCorrect: false }])
    setNewOpt('')
  }

  function toggleCorrect(i: number) {
    setOpts(o => o.map((opt, j) => ({ ...opt, isCorrect: j === i })))
  }

  function removeOption(i: number) {
    setOpts(o => o.filter((_,j)=>j!==i))
  }

  function saveQuestion() {
    if (!question.trim())  return showToast('⚠️ أدخل السؤال')
    if (options.length < 2) return showToast('⚠️ أضف خيارين على الأقل')
    const correctIdx = options.findIndex(o => o.isCorrect)
    if (correctIdx === -1) return showToast('⚠️ حدّد الإجابة الصحيحة بالضغط على ⬜')
    onChange([...entries, {
      question: question.trim(),
      options: options.map(o => o.text),
      answerIndex: correctIdx,
    }])
    setQ(''); setOpts([])
  }

  return (
    <>
      <div className={styles.area}>
        <h3 className={styles.title}>❓ اختر الجواب الصحيح</h3>
        <p className={styles.hint} style={{marginBottom:14}}>أدخل السؤال ثم أضف الخيارات — انقر ✅ لتحديد الإجابة الصحيحة</p>

        <div className={styles.row}>
          <label className={styles.label}>السؤال</label>
          <input className="form-input" value={question} onChange={e=>setQ(e.target.value)} placeholder="مثال: ما عاصمة لبنان؟" />
        </div>

        <div className={styles.row}>
          <label className={styles.label}>أضف خياراً</label>
          <div style={{display:'flex',gap:8}}>
            <input className="form-input" style={{flex:1}} value={newOpt} onChange={e=>setNewOpt(e.target.value)}
              placeholder="مثال: بيروت" onKeyDown={e=>e.key==='Enter'&&addOption()} />
            <button className="btn btn-primary" style={{padding:'11px 18px',whiteSpace:'nowrap'}} onClick={addOption}>➕ إضافة</button>
          </div>
          <p className={styles.hint}>💡 انقر ✅ بجانب الخيار لتعيينه كإجابة صحيحة</p>
        </div>

        <div className={optStyles.optList}>
          {options.map((o, i) => (
            <div key={i} className={`${optStyles.opt} ${o.isCorrect ? optStyles.correct : ''}`}>
              <span className={optStyles.optText}>{o.text}</span>
              <button onClick={() => toggleCorrect(i)} className={optStyles.checkBtn} title="تعيين كإجابة صحيحة">
                {o.isCorrect ? '✅' : '⬜'}
              </button>
              <button onClick={() => removeOption(i)} className={optStyles.delBtn}>🗑️</button>
            </div>
          ))}
        </div>

        <button className="btn btn-success" onClick={saveQuestion}>💾 حفظ السؤال</button>
      </div>
      <EntryList
        items={entries.map(e => `${e.question} ✔ ${e.options[e.answerIndex]}`)}
        onDelete={i => onChange(entries.filter((_,j)=>j!==i))}
      />
    </>
  )
}
