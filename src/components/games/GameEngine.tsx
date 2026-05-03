'use client'

import { useState, useCallback } from 'react'
import type { Game, GameEntry } from '@/lib/types'
import { useAudio } from '@/lib/useAudio'
import styles from './GameEngine.module.css'

// ── helpers ──────────────────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
const CMSG = ['أحسنت! 🌟','رائع! 🎉','ممتاز! ✨','جميل جداً! 🥳','بطل! 👑']
const WMSG = ['حاول مرة أخرى 💪','لا بأس، جرّب ثانية 🙂','تقريباً! حاول مجدداً 🌈']
const rc = () => CMSG[Math.floor(Math.random()*CMSG.length)]
const rw = () => WMSG[Math.floor(Math.random()*WMSG.length)]

// ── types ─────────────────────────────────────────────────────────────────────
interface Props { game: Game; onExit: () => void }

export default function GameEngine({ game, onExit }: Props) {
  const { playSuccess, playError } = useAudio()

  const questions = buildQuestions(game)
  const [idx, setIdx]           = useState(0)
  const [score, setScore]       = useState(0)
  const [feedback, setFeedback] = useState<{ type:'correct'|'wrong'; msg:string } | null>(null)
  const [done, setDone]         = useState(false)

  function buildQuestions(g: Game): GameEntry[] {
    if (g.type === 'match-words')  return [{ pairs: g.entries } as any]
    if (g.type === 'categorize')   return [{ categories: g.entries } as any]
    return shuffle(g.entries)
  }

  const advance = useCallback((correct: boolean, msg?: string) => {
    if (correct) {
      setScore(s => s + 1)
      playSuccess()
      setFeedback({ type:'correct', msg: msg ?? rc() })
    } else {
      playError()
      setFeedback({ type:'wrong', msg: msg ?? rw() })
    }
    setTimeout(() => {
      setFeedback(null)
      if (idx + 1 >= questions.length) setDone(true)
      else setIdx(i => i + 1)
    }, 1600)
  }, [idx, questions.length, playSuccess, playError])

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    const stars = pct >= 80 ? '⭐⭐⭐' : pct >= 50 ? '⭐⭐' : '⭐'
    return (
      <div className={styles.resultPage}>
        <div className={styles.resultCard}>
          <span className={styles.resultEmoji}>{pct >= 80 ? '🏆' : pct >= 50 ? '🌟' : '💪'}</span>
          <h2 className={styles.resultTitle}>{pct >= 80 ? 'أحسنت!' : pct >= 50 ? 'جيد جداً!' : 'حاول مرة أخرى!'}</h2>
          <div className={styles.stars}>{stars}</div>
          <p className={styles.resultScore}>{score} من {questions.length} إجابات صحيحة ({pct}%)</p>
          <div style={{display:'flex',gap:11,justifyContent:'center',flexWrap:'wrap'}}>
            <button className="btn btn-success btn-lg" onClick={() => { setIdx(0); setScore(0); setDone(false) }}>🔄 العب مجدداً</button>
            <button className="btn btn-primary btn-lg" onClick={onExit}>🏠 القائمة</button>
          </div>
        </div>
      </div>
    )
  }

  const q = questions[idx]
  const pct = questions.length ? (idx / questions.length) * 100 : 0

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.exitBtn} onClick={onExit}>← خروج</button>
        <div className={styles.gameTitle}>{game.name}</div>
        <div style={{display:'flex',alignItems:'center',gap:7}}>
          <div className={styles.progressWrap}><div className={styles.progressFill} style={{width:`${pct}%`}} /></div>
          <div className={styles.progressLabel}>{idx}/{questions.length}</div>
        </div>
      </div>

      {/* Feedback overlay */}
      {feedback && (
        <div className={`${styles.feedbackOverlay} ${feedback.type==='correct' ? styles.feedCorrect : styles.feedWrong}`}>
          <div className={styles.feedFrame}>
            <span className={styles.feedIcon}>{feedback.type==='correct' ? '🌟' : '💪'}</span>
            <div className={styles.feedMsg}>{feedback.msg}</div>
          </div>
        </div>
      )}

      {/* Question */}
      <div className={styles.content}>
        <QuestionRenderer game={game} question={q} onAnswer={advance} />
      </div>
    </div>
  )
}

// ── Question renderer ─────────────────────────────────────────────────────────
function QuestionRenderer({ game, question, onAnswer }: {
  game: Game
  question: GameEntry
  onAnswer: (correct: boolean, msg?: string) => void
}) {
  const type = game.type

  if (type === 'true-false') {
    const q = question as any
    const [disabled, setDisabled] = useState(false)
    function check(ans: string) {
      if (disabled) return; setDisabled(true)
      onAnswer(ans === q.answer)
    }
    return (
      <div className={styles.qCard}>
        <span className={styles.qEmoji}>🤔</span>
        <p className={styles.qText}>{q.question}</p>
        <div className={styles.tfBtns}>
          <button className={`${styles.tfBtn} ${styles.tfTrue}`}  onClick={()=>check('true')}  disabled={disabled}>✅ صحيح</button>
          <button className={`${styles.tfBtn} ${styles.tfFalse}`} onClick={()=>check('false')} disabled={disabled}>❌ خطأ</button>
        </div>
      </div>
    )
  }

  if (type === 'mcq') {
    const q = question as any
    const opts: string[] = shuffle(q.options.map((o:string,i:number) => ({ t:o, correct:i===q.answerIndex }))).map((x:any) => x)
    // keep it simple: re-derive
    const shuffled = shuffle(q.options.map((t:string,i:number)=>({t,correct:i===q.answerIndex})))
    const [chosen, setChosen] = useState<number|null>(null)
    function pick(i:number) {
      if (chosen!==null) return; setChosen(i)
      setTimeout(()=>onAnswer(shuffled[i].correct), 600)
    }
    return (
      <div className={styles.qCard}>
        <span className={styles.qEmoji}>❓</span>
        <p className={styles.qText}>{q.question}</p>
        <div className={styles.choicesGrid}>
          {shuffled.map((o:any,i:number)=>(
            <button key={i}
              className={`${styles.choiceBtn} ${chosen===i ? (o.correct?styles.choiceCorrect:styles.choiceWrong) : chosen!==null&&o.correct?styles.choiceCorrect:''}`}
              onClick={()=>pick(i)} disabled={chosen!==null}>
              {o.t}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'flashcard') {
    const q = question as any
    const [flipped, setFlipped] = useState(false)
    return (
      <div className={styles.qCard} style={{maxWidth:420}}>
        <p className={styles.qText} style={{marginBottom:20}}>اضغط على البطاقة لرؤية الإجابة 👆</p>
        <div className={`${styles.flipScene}`} onClick={()=>setFlipped(f=>!f)}>
          <div className={`${styles.flipCard} ${flipped?styles.flipped:''}`}>
            <div className={`${styles.flipFace} ${styles.flipFront}`}>{q.front}<span className={styles.flipHint}>اضغط للقلب</span></div>
            <div className={`${styles.flipFace} ${styles.flipBack}`}>{q.back}</div>
          </div>
        </div>
        {flipped && (
          <div style={{display:'flex',gap:14,justifyContent:'center',marginTop:18}}>
            <button className="btn btn-success" onClick={()=>onAnswer(true)}>✅ أعرفها!</button>
            <button className="btn btn-danger"  onClick={()=>onAnswer(false)}>❌ لا أعرفها</button>
          </div>
        )}
      </div>
    )
  }

  if (type === 'fill-blank') {
    const q = question as any
    const [val, setVal] = useState('')
    const [checked, setChecked] = useState(false)
    function check() {
      if (checked) return; setChecked(true)
      const correct = val.trim() === q.answer.trim()
      setTimeout(()=>onAnswer(correct), 700)
    }
    const parts = q.sentence.split('___')
    return (
      <div className={styles.qCard}>
        <span className={styles.qEmoji}>✏️</span>
        <p className={styles.qText} style={{marginBottom:20}}>
          {parts[0]}
          <input className={styles.blankInput} value={val} onChange={e=>setVal(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&check()} disabled={checked} />
          {parts[1]}
        </p>
        <button className="btn btn-primary" onClick={check} disabled={checked || !val.trim()}>✔ تحقق</button>
      </div>
    )
  }

  if (type === 'sort-sentence') {
    const q = question as any
    const words: string[] = q.sentence.split(/\s+/)
    const [bank, setBank]   = useState<string[]>(shuffle(words.map((w,i)=>`${w}::${i}`)))
    const [slots, setSlots] = useState<string[]>([])
    const [checked, setChecked] = useState(false)

    function pickFromBank(token: string) {
      if (checked) return
      setSlots(s=>[...s,token]); setBank(b=>b.filter(t=>t!==token))
    }
    function removeFromSlot(i: number) {
      if (checked) return
      const token = slots[i]
      setBank(b=>[...b,token]); setSlots(s=>s.filter((_,j)=>j!==i))
    }
    function check() {
      if (checked || slots.length !== words.length) return
      setChecked(true)
      const ordered = slots.map(t=>t.split('::')[0])
      const correct = ordered.join(' ') === q.sentence
      setTimeout(()=>onAnswer(correct), 700)
    }
    return (
      <div className={styles.qCard}>
        <span className={styles.qEmoji}>📖</span>
        <p className={styles.qText} style={{marginBottom:16}}>رتّب الكلمات لتكوين جملة صحيحة</p>
        <div className={styles.slotsRow}>
          {slots.map((t,i)=>(
            <button key={i} className={`${styles.bankBtn} ${styles.slotFilled}`} onClick={()=>removeFromSlot(i)}>
              {t.split('::')[0]}
            </button>
          ))}
          {slots.length < words.length && <div className={styles.slotEmpty} />}
        </div>
        <div className={styles.bankRow}>
          {bank.map(t=>(
            <button key={t} className={styles.bankBtn} onClick={()=>pickFromBank(t)}>{t.split('::')[0]}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={check} disabled={checked||slots.length<words.length}>✔ تحقق</button>
      </div>
    )
  }

  if (type === 'word-scramble') {
    const q = question as any
    const letters = q.word.split('')
    const [bank, setBank]   = useState<string[]>(shuffle(letters.map((l:string,i:number)=>`${l}::${i}`)))
    const [slots, setSlots] = useState<string[]>([])
    const [checked, setChecked] = useState(false)

    function pick(token: string) {
      if (checked) return; setSlots(s=>[...s,token]); setBank(b=>b.filter(t=>t!==token))
    }
    function remove(i: number) {
      if (checked) return; const t=slots[i]; setBank(b=>[...b,t]); setSlots(s=>s.filter((_,j)=>j!==i))
    }
    function check() {
      if (checked||slots.length!==letters.length) return; setChecked(true)
      const correct = slots.map(t=>t.split('::')[0]).join('') === q.word
      setTimeout(()=>onAnswer(correct), 700)
    }
    return (
      <div className={styles.qCard}>
        <span className={styles.qEmoji}>🔀</span>
        <p className={styles.qText}>رتّب الحروف لتكوين الكلمة الصحيحة</p>
        <div className={styles.slotsRow}>
          {slots.map((t,i)=>(
            <button key={i} className={`${styles.letterSlot} ${styles.slotFilled}`} onClick={()=>remove(i)}>
              {t.split('::')[0]}
            </button>
          ))}
          {Array.from({length:letters.length-slots.length}).map((_,i)=>(
            <div key={i} className={styles.letterSlot} />
          ))}
        </div>
        <div className={styles.bankRow}>
          {bank.map(t=>(
            <button key={t} className={styles.letterBtn} onClick={()=>pick(t)}>{t.split('::')[0]}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={check} disabled={checked||slots.length<letters.length}>✔ تحقق</button>
      </div>
    )
  }

  if (type === 'match-words') {
    const q = question as any
    const pairs: { left:string; right:string }[] = q.pairs
    const lefts  = shuffle(pairs.map(p=>p.left))
    const rights = shuffle(pairs.map(p=>p.right))
    const lr: Record<string,string> = {}
    pairs.forEach(p => { lr[p.left] = p.right })

    const [selLeft, setSelLeft]     = useState<string|null>(null)
    const [matched, setMatched]     = useState<Record<string,string>>({}) // left → right
    const [wrongPair, setWrongPair] = useState<[string,string]|null>(null)

    function pickLeft(l: string) {
      if (matched[l]) return; setSelLeft(l)
    }
    function pickRight(r: string) {
      if (!selLeft) return
      if (Object.values(matched).includes(r)) return
      if (lr[selLeft] === r) {
        const nm = { ...matched, [selLeft]: r }
        setMatched(nm); setSelLeft(null)
        if (Object.keys(nm).length === pairs.length) setTimeout(()=>onAnswer(true), 500)
      } else {
        setWrongPair([selLeft, r])
        setTimeout(()=>{ setWrongPair(null); setSelLeft(null) }, 600)
      }
    }

    return (
      <div className={styles.qCard} style={{maxWidth:700}}>
        <p className={styles.qText} style={{marginBottom:20}}>وصّل كل كلمة بما يناسبها 🔗</p>
        <div className={styles.matchGrid}>
          <div className={styles.matchCol}>
            {lefts.map(l=>{
              const isMatched = !!matched[l]
              const isWrong   = wrongPair?.[0]===l
              const isSel     = selLeft===l
              return (
                <div key={l}
                  className={`${styles.matchItem} ${isSel?styles.matchSel:''} ${isMatched?styles.matchMatched:''} ${isWrong?styles.matchWrong:''}`}
                  onClick={()=>pickLeft(l)}>
                  {l}
                </div>
              )
            })}
          </div>
          <div className={styles.matchCol}>
            {rights.map(r=>{
              const isMatched = Object.values(matched).includes(r)
              const isWrong   = wrongPair?.[1]===r
              return (
                <div key={r}
                  className={`${styles.matchItem} ${isMatched?styles.matchMatched:''} ${isWrong?styles.matchWrong:''}`}
                  onClick={()=>pickRight(r)}>
                  {r}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'categorize') {
    const q = question as any
    const catEntries: { category:string; items:string[] }[] = q.categories
    const allItems = shuffle(catEntries.flatMap((c:any)=>c.items.map((item:string)=>({item,cat:c.category}))))
    const [placed, setPlaced] = useState<Record<string,string>>({})
    const [checked, setChecked] = useState(false)

    function placeItem(item:string, cat:string) {
      if (checked) return; setPlaced(p=>({...p,[item]:cat}))
    }
    function removeItem(item:string) {
      if (checked) return; setPlaced(p=>{const np={...p}; delete np[item]; return np})
    }
    function check() {
      if (checked) return
      if (Object.keys(placed).length < allItems.length) return
      setChecked(true)
      const correct = allItems.every((a:any)=>placed[a.item]===a.cat)
      setTimeout(()=>onAnswer(correct), 700)
    }

    const placedItems = Object.keys(placed)
    const bankItems   = allItems.filter((a:any)=>!placedItems.includes(a.item))

    return (
      <div className={styles.qCard} style={{maxWidth:780}}>
        <p className={styles.qText} style={{marginBottom:16}}>صنّف الكلمات في الفئة الصحيحة 🗂️</p>
        <div className={styles.catZones}>
          {catEntries.map((cat:any) => (
            <div key={cat.category} className={styles.catZone}>
              <div className={styles.catZoneTitle}>{cat.category}</div>
              <div className={styles.catItems}>
                {allItems.filter((a:any)=>placed[a.item]===cat.category).map((a:any)=>(
                  <button key={a.item} className={`${styles.catItem} ${styles.catPlaced}`} onClick={()=>removeItem(a.item)}>
                    {a.item} ✕
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.catBank}>
          {bankItems.map((a:any)=>(
            <div key={a.item} className={styles.catBankItem}>
              <span>{a.item}</span>
              {catEntries.map((cat:any)=>(
                <button key={cat.category} className={styles.catPlaceBtn} onClick={()=>placeItem(a.item,cat.category)}>
                  {cat.category}
                </button>
              ))}
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{marginTop:12}} onClick={check}
          disabled={checked||Object.keys(placed).length<allItems.length}>✔ تحقق</button>
      </div>
    )
  }

  return <div className={styles.qCard}><p>نوع اللعبة غير مدعوم</p></div>
}
