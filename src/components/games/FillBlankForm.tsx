'use client'
import { useState } from 'react'
import { useToast } from '@/components/Toast'
import type { FillBlankEntry } from '@/lib/types'
import styles from '../FormArea.module.css'
import EntryList from '../EntryList'

interface Props { entries: FillBlankEntry[]; onChange: (e: FillBlankEntry[]) => void }

export default function FillBlankForm({ entries, onChange }: Props) {
  const { showToast } = useToast()
  const [sentence, setSentence] = useState('')
  const [answer, setAnswer]     = useState('')

  function add() {
    if (!sentence.trim()) return showToast('⚠️ أدخل الجملة')
    if (!answer.trim())   return showToast('⚠️ أدخل كلمة الفراغ')
    onChange([...entries, { sentence: sentence.trim(), answer: answer.trim() }])
    setSentence(''); setAnswer('')
  }

  return (
    <>
      <div className={styles.area}>
        <h3 className={styles.title}>✏️ أكمل الفراغ</h3>
        <p className={styles.hint} style={{marginBottom:14}}>مثال: "الشمس تشرق من ___" والكلمة: الشرق</p>
        <div className={styles.row}>
          <label className={styles.label}>الجملة (ضع ___ مكان الفراغ)</label>
          <input className="form-input" value={sentence} onChange={e=>setSentence(e.target.value)} placeholder="مثال: الشمس تشرق من ___" />
        </div>
        <div className={styles.row}>
          <label className={styles.label}>الكلمة الصحيحة للفراغ</label>
          <input className="form-input" value={answer} onChange={e=>setAnswer(e.target.value)}
            placeholder="مثال: الشرق" onKeyDown={e=>e.key==='Enter'&&add()} />
        </div>
        <button className="btn btn-primary" onClick={add}>➕ إضافة سؤال</button>
      </div>
      <EntryList items={entries.map(e=>`✏️ ${e.sentence} [${e.answer}]`)} onDelete={i=>onChange(entries.filter((_,j)=>j!==i))} />
    </>
  )
}
