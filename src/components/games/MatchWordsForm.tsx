'use client'

import { useState } from 'react'
import { useToast } from '@/components/Toast'
import type { MatchWordsEntry } from '@/lib/types'
import styles from './FormArea.module.css'
import EntryList from './EntryList'

interface Props {
  entries:  MatchWordsEntry[]
  onChange: (e: MatchWordsEntry[]) => void
}

export default function MatchWordsForm({ entries, onChange }: Props) {
  const { showToast } = useToast()
  const [left, setLeft]   = useState('')
  const [right, setRight] = useState('')

  function add() {
    if (!left.trim() || !right.trim()) return showToast('⚠️ أدخل كلتا الكلمتين')
    onChange([...entries, { left: left.trim(), right: right.trim() }])
    setLeft(''); setRight('')
  }

  return (
    <>
      <div className={styles.area}>
        <h3 className={styles.title}>🔗 وصّل الكلمات</h3>
        <p className={styles.hint} style={{marginBottom:14}}>أدخل زوجاً من الكلمات المرتبطة (مثال: قطة ↔ تموّ)</p>
        <div className={styles.row}>
          <label className={styles.label}>الكلمة الأولى</label>
          <input className="form-input" value={left} onChange={e=>setLeft(e.target.value)} placeholder="مثال: قلم" />
        </div>
        <div className={styles.row}>
          <label className={styles.label}>الكلمة المقابلة</label>
          <input className="form-input" value={right} onChange={e=>setRight(e.target.value)} placeholder="مثال: يكتب"
            onKeyDown={e=>e.key==='Enter'&&add()} />
        </div>
        <button className="btn btn-primary" onClick={add}>➕ إضافة زوج</button>
      </div>
      <EntryList
        items={entries.map(e => `${e.left} ↔ ${e.right}`)}
        onDelete={i => onChange(entries.filter((_,j)=>j!==i))}
      />
    </>
  )
}
