'use client'
import { useState } from 'react'
import { useToast } from '@/components/Toast'
import type { FlashcardEntry } from '@/lib/types'
import styles from './FormArea.module.css'
import EntryList from './EntryList'

interface Props { entries: FlashcardEntry[]; onChange: (e: FlashcardEntry[]) => void }

export default function FlashcardForm({ entries, onChange }: Props) {
  const { showToast } = useToast()
  const [front, setFront] = useState('')
  const [back, setBack]   = useState('')

  function add() {
    if (!front.trim() || !back.trim()) return showToast('⚠️ أدخل وجهَي البطاقة')
    onChange([...entries, { front: front.trim(), back: back.trim() }])
    setFront(''); setBack('')
  }

  return (
    <>
      <div className={styles.area}>
        <h3 className={styles.title}>🃏 بطاقات تعليمية</h3>
        <div className={styles.row}>
          <label className={styles.label}>الوجه الأمامي (السؤال)</label>
          <input className="form-input" value={front} onChange={e=>setFront(e.target.value)} placeholder="مثال: ما عاصمة فرنسا؟" />
        </div>
        <div className={styles.row}>
          <label className={styles.label}>الوجه الخلفي (الإجابة)</label>
          <input className="form-input" value={back} onChange={e=>setBack(e.target.value)}
            placeholder="مثال: باريس" onKeyDown={e=>e.key==='Enter'&&add()} />
        </div>
        <button className="btn btn-primary" onClick={add}>➕ إضافة بطاقة</button>
      </div>
      <EntryList items={entries.map(e=>`🃏 ${e.front} → ${e.back}`)} onDelete={i=>onChange(entries.filter((_,j)=>j!==i))} />
    </>
  )
}
