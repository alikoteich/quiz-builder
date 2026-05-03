'use client'
import { useState } from 'react'
import { useToast } from '@/components/Toast'
import type { WordScrambleEntry } from '@/lib/types'
import styles from './FormArea.module.css'
import EntryList from './EntryList'

interface Props { entries: WordScrambleEntry[]; onChange: (e: WordScrambleEntry[]) => void }

export default function WordScrambleForm({ entries, onChange }: Props) {
  const { showToast } = useToast()
  const [word, setWord] = useState('')

  function add() {
    if (!word.trim() || word.trim().length < 2) return showToast('⚠️ أدخل كلمة من حرفين على الأقل')
    onChange([...entries, { word: word.trim() }])
    setWord('')
  }

  return (
    <>
      <div className={styles.area}>
        <h3 className={styles.title}>🔀 الكلمة المشفرة</h3>
        <p className={styles.hint} style={{marginBottom:14}}>سيتم تشتيت حروف الكلمة — على الطالب ترتيبها</p>
        <div className={styles.row}>
          <label className={styles.label}>الكلمة</label>
          <input className="form-input" value={word} onChange={e=>setWord(e.target.value)}
            placeholder="مثال: بيروت" onKeyDown={e=>e.key==='Enter'&&add()} />
        </div>
        <button className="btn btn-primary" onClick={add}>➕ إضافة كلمة</button>
      </div>
      <EntryList items={entries.map(e=>`🔀 ${e.word}`)} onDelete={i=>onChange(entries.filter((_,j)=>j!==i))} />
    </>
  )
}
