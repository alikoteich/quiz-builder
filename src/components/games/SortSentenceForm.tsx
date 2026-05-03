'use client'

import { useState } from 'react'
import { useToast } from '@/components/Toast'
import type { SortSentenceEntry } from '@/lib/types'
import styles from './FormArea.module.css'
import EntryList from './EntryList'

interface Props { entries: SortSentenceEntry[]; onChange: (e: SortSentenceEntry[]) => void }

export default function SortSentenceForm({ entries, onChange }: Props) {
  const { showToast } = useToast()
  const [sentence, setSentence] = useState('')

  function add() {
    if (!sentence.trim() || sentence.trim().split(/\s+/).length < 2)
      return showToast('⚠️ أدخل جملة من كلمتين على الأقل')
    onChange([...entries, { sentence: sentence.trim() }])
    setSentence('')
  }

  return (
    <>
      <div className={styles.area}>
        <h3 className={styles.title}>📖 رتّب الجملة</h3>
        <p className={styles.hint} style={{marginBottom:14}}>أدخل الجملة الصحيحة — سيتم تشتيت كلماتها</p>
        <div className={styles.row}>
          <label className={styles.label}>الجملة الصحيحة</label>
          <input className="form-input" value={sentence} onChange={e=>setSentence(e.target.value)}
            placeholder="مثال: الولد يلعب في الحديقة"
            onKeyDown={e=>e.key==='Enter'&&add()} />
        </div>
        <button className="btn btn-primary" onClick={add}>➕ إضافة جملة</button>
      </div>
      <EntryList items={entries.map(e=>e.sentence)} onDelete={i=>onChange(entries.filter((_,j)=>j!==i))} />
    </>
  )
}
