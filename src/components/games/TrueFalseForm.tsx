'use client'

import { useState } from 'react'
import { useToast } from '@/components/Toast'
import type { TrueFalseEntry } from '@/lib/types'
import styles from '../FormArea.module.css'
import EntryList from '../EntryList'

interface Props { entries: TrueFalseEntry[]; onChange: (e: TrueFalseEntry[]) => void }

export default function TrueFalseForm({ entries, onChange }: Props) {
  const { showToast } = useToast()
  const [question, setQuestion] = useState('')
  const [answer, setAnswer]     = useState<'true'|'false'>('true')

  function add() {
    if (!question.trim()) return showToast('⚠️ أدخل الجملة')
    onChange([...entries, { question: question.trim(), answer }])
    setQuestion('')
  }

  return (
    <>
      <div className={styles.area}>
        <h3 className={styles.title}>✅ صح أم خطأ</h3>
        <div className={styles.row}>
          <label className={styles.label}>الجملة أو السؤال</label>
          <input className="form-input" value={question} onChange={e=>setQuestion(e.target.value)}
            placeholder="مثال: الشمس تشرق من الغرب"
            onKeyDown={e=>e.key==='Enter'&&add()} />
        </div>
        <div className={styles.row}>
          <label className={styles.label}>الإجابة الصحيحة</label>
          <select className="form-input" value={answer} onChange={e=>setAnswer(e.target.value as 'true'|'false')}>
            <option value="true">✅ صحيح</option>
            <option value="false">❌ خطأ</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={add}>➕ إضافة سؤال</button>
      </div>
      <EntryList
        items={entries.map(e=>`${e.question} — ${e.answer==='true'?'✅ صح':'❌ خطأ'}`)}
        onDelete={i=>onChange(entries.filter((_,j)=>j!==i))}
      />
    </>
  )
}
