'use client'
import { useState } from 'react'
import { useToast } from '@/components/Toast'
import type { CategorizeEntry } from '@/lib/types'
import styles from './FormArea.module.css'
import EntryList from './EntryList'

interface Props { entries: CategorizeEntry[]; onChange: (e: CategorizeEntry[]) => void }

export default function CategorizeForm({ entries, onChange }: Props) {
  const { showToast } = useToast()
  const [category, setCat]   = useState('')
  const [itemsRaw, setItems] = useState('')

  function add() {
    if (!category.trim()) return showToast('⚠️ أدخل اسم الفئة')
    const items = itemsRaw.split(/[،,\n]/).map(s=>s.trim()).filter(Boolean)
    if (items.length < 1) return showToast('⚠️ أدخل عنصراً واحداً على الأقل')
    onChange([...entries, { category: category.trim(), items }])
    setCat(''); setItems('')
  }

  return (
    <>
      <div className={styles.area}>
        <h3 className={styles.title}>🗂️ صنّف الكلمات</h3>
        <p className={styles.hint} style={{marginBottom:14}}>أدخل فئة ثم الكلمات المنتمية إليها (افصل بفاصلة أو سطر جديد)</p>
        <div className={styles.row}>
          <label className={styles.label}>اسم الفئة</label>
          <input className="form-input" value={category} onChange={e=>setCat(e.target.value)} placeholder="مثال: فواكه" />
        </div>
        <div className={styles.row}>
          <label className={styles.label}>الكلمات (افصل بفاصلة)</label>
          <textarea className="form-input" rows={3} value={itemsRaw} onChange={e=>setItems(e.target.value)}
            placeholder="مثال: تفاح، موز، عنب" style={{resize:'vertical'}} />
        </div>
        <button className="btn btn-primary" onClick={add}>➕ إضافة فئة</button>
      </div>
      <EntryList
        items={entries.map(e=>`🗂 ${e.category}: ${e.items.join('، ')}`)}
        onDelete={i=>onChange(entries.filter((_,j)=>j!==i))}
      />
    </>
  )
}
