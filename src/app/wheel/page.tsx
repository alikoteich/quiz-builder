'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import TopBar from '@/components/TopBar'
import { useToast } from '@/components/Toast'
import { loadWheelLists, saveWheelList, deleteWheelList } from '@/lib/db'
import type { WheelList } from '@/lib/types'
import styles from './wheel.module.css'

const COLORS = ['#FF6B6B','#FFD93D','#6BCB77','#5BC8F5','#C77DFF','#FF9F43','#FF6EB4','#A0E7E5','#F5A623','#B8E986']

export default function WheelPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()

  const [lists, setLists]         = useState<WheelList[]>([])
  const [textarea, setTextarea]   = useState('')
  const [listName, setListName]   = useState('')
  const [names, setNames]         = useState<string[]>([])
  const [spinning, setSpinning]   = useState(false)
  const [picked, setPicked]       = useState('')
  const [showWheel, setShowWheel] = useState(false)
  const [angle, setAngle]         = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!loading && !user) { router.replace('/auth'); return }
    if (!loading && user) loadWheelLists().then(setLists)
  }, [user, loading, router])

  useEffect(() => {
    if (showWheel && names.length) drawWheel(angle)
  }, [names, angle, showWheel])

  function drawWheel(rot: number) {
    const canvas = canvasRef.current
    if (!canvas || !names.length) return
    const ctx = canvas.getContext('2d')!
    const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 10
    const slice = (2 * Math.PI) / names.length

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    names.forEach((name, i) => {
      const start = rot + i * slice, end = start + slice
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,start,end); ctx.closePath()
      ctx.fillStyle = COLORS[i % COLORS.length]; ctx.fill()
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke()

      ctx.save(); ctx.translate(cx,cy); ctx.rotate(start + slice/2)
      ctx.textAlign = 'right'; ctx.fillStyle = '#fff'
      ctx.font = `bold ${Math.min(18, 120/names.length + 8)}px Tajawal,Arial`
      ctx.fillText(name, r - 12, 6)
      ctx.restore()
    })

    // Center circle
    ctx.beginPath(); ctx.arc(cx,cy,22,0,2*Math.PI)
    ctx.fillStyle = '#fff'; ctx.fill()
    ctx.strokeStyle = '#E8EAED'; ctx.lineWidth = 3; ctx.stroke()
  }

  function buildWheel() {
    const ns = textarea.split('\n').map(s=>s.trim()).filter(Boolean)
    if (ns.length < 2) return showToast('⚠️ أدخل اسمين على الأقل')
    setNames(ns); setPicked(''); setAngle(0); setShowWheel(true)
  }

  function spinWheel() {
    if (spinning || !names.length) return
    setSpinning(true); setPicked('')
    const extraSpins = (5 + Math.floor(Math.random() * 5)) * 2 * Math.PI
    const finalAngle = Math.random() * 2 * Math.PI
    const total = extraSpins + finalAngle
    const duration = 4000
    const start = performance.now()
    const startAngle = angle

    function step(now: number) {
      const elapsed = Math.min(now - start, duration)
      const t = elapsed / duration
      const eased = 1 - Math.pow(1 - t, 3)
      const current = startAngle + total * eased
      setAngle(current)
      drawWheel(current)
      if (elapsed < duration) { requestAnimationFrame(step) }
      else {
        const norm = ((current % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI)
        // pointer at top (3π/2), find which segment
        const ptr  = (3 * Math.PI / 2 - norm + 4 * Math.PI) % (2 * Math.PI)
        const slice = 2 * Math.PI / names.length
        const idx   = Math.floor(ptr / slice) % names.length
        setPicked(names[idx])
        setSpinning(false)
      }
    }
    requestAnimationFrame(step)
  }

  async function handleSaveList() {
    if (!listName.trim())  return showToast('⚠️ أدخل اسماً للقائمة')
    const ns = textarea.split('\n').map(s=>s.trim()).filter(Boolean)
    if (ns.length < 2)     return showToast('⚠️ أدخل اسمين على الأقل في الحقل')
    if (!user)             return
    const ok = await saveWheelList(listName.trim(), ns, user.id)
    if (!ok) return showToast('⚠️ تعذّر الحفظ')
    showToast('✅ تم حفظ القائمة: ' + listName)
    setListName('')
    loadWheelLists().then(setLists)
  }

  async function handleDeleteList(id: string) {
    await deleteWheelList(id)
    setLists(l => l.filter(x => x.id !== id))
    showToast('تم حذف القائمة')
  }

  if (loading || !user) return null

  return (
    <div className={styles.page}>
      <div className={styles.blob1}/><div className={styles.blob2}/>
      <TopBar showBack />

      <div className={styles.wrap}>
        {!showWheel ? (
          /* ── Setup view ── */
          <div className={styles.layout}>
            {/* Saved lists sidebar */}
            <div className={styles.listsPanel}>
              <div className={styles.listsTitle}>📋 قوائمي المحفوظة</div>
              {lists.length === 0
                ? <p className={styles.noLists}>لا توجد قوائم محفوظة بعد</p>
                : lists.map(l=>(
                    <div key={l.id} className={styles.listItem} onClick={()=>setTextarea(l.names.join('\n'))}>
                      <div>
                        <div className={styles.listName}>{l.title}</div>
                        <div className={styles.listCount}>{l.names.length} طالب</div>
                      </div>
                      <button className={styles.listDel} onClick={e=>{e.stopPropagation();handleDeleteList(l.id)}}>🗑</button>
                    </div>
                  ))
              }
              <div className={styles.saveSection}>
                <div className={styles.saveSectionLabel}>حفظ القائمة الحالية:</div>
                <input className="form-input" placeholder="اسم القائمة (مثال: الصف 3أ)"
                  value={listName} onChange={e=>setListName(e.target.value)}
                  style={{marginBottom:8,fontSize:'.9rem',padding:'9px 12px'}} />
                <button className={styles.saveListBtn} onClick={handleSaveList}>💾 حفظ القائمة</button>
              </div>
            </div>

            {/* Input area */}
            <div className={styles.inputBox}>
              <h2 className={styles.sectionTitle} style={{textAlign:'center',marginBottom:4}}>🎡 دولاب الحظ</h2>
              <p className={styles.sectionSub} style={{textAlign:'center',marginBottom:18}}>أدخل أسماء التلاميذ أو اختر قائمة محفوظة</p>
              <label className={styles.formLabel}>📋 أسماء التلاميذ — سطر لكل اسم</label>
              <textarea className="form-input" rows={9} value={textarea} onChange={e=>setTextarea(e.target.value)}
                placeholder={'محمد\nسارة\nليلى\nأحمد\nفاطمة'} style={{resize:'vertical',fontSize:'1.05rem',marginBottom:8}} />
              <p className={styles.hint}>💡 اختر قائمة محفوظة من الجانب لتحميلها تلقائياً</p>
              <div style={{display:'flex',gap:9,flexWrap:'wrap',marginTop:12}}>
                <button className="btn btn-primary" onClick={buildWheel}>🎡 ابدأ الدولاب</button>
                <button className="btn btn-ghost" onClick={()=>setTextarea('')}>🗑 مسح</button>
              </div>
            </div>
          </div>
        ) : (
          /* ── Wheel view ── */
          <div className={styles.wheelView}>
            <canvas ref={canvasRef} width={360} height={360} className={styles.canvas} />
            <div className={styles.pointer}>▲</div>
            {picked && <div className={styles.pickedLabel}>{picked} 🎉</div>}
            <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',marginTop:14}}>
              <button className="btn btn-sun btn-lg" onClick={spinWheel} disabled={spinning}>
                {spinning ? '🎡 يدور…' : '🎡 أدر الدولاب!'}
              </button>
              <button className="btn btn-ghost" onClick={()=>{setShowWheel(false);setPicked('')}}>← تغيير القائمة</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
