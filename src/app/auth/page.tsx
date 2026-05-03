'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { signIn, signUp } from '@/lib/db'
import styles from './auth.module.css'

export default function AuthPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [tab, setTab]           = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [busy, setBusy]         = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) router.replace('/')
  }, [user, loading, router])

  async function handleSubmit() {
    setError('')
    if (!username.trim()) return setError('أدخل اسم المستخدم')
    if (password.length < 6) return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')

    setBusy(true)

    if (tab === 'login') {
      const { error: err } = await signIn(username.trim(), password)
      if (err) {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة')
        setBusy(false)
        return
      }
      router.replace('/')
    } else {
      const { error: err } = await signUp(username.trim(), password)
      if (err) {
        console.error('signUp error:', err)
        if (err.message === 'USERNAME_TAKEN') setError('اسم المستخدم مأخوذ، جرّب اسماً آخر')
        else if (err.message === 'EMAIL_CONFIRM_REQUIRED') setError('يرجى تفعيل الحساب من البريد الإلكتروني')
        else setError(err.message)
        setBusy(false)
        return
      }
      router.replace('/')
    }
  }

  if (loading) return null

  return (
    <div className={styles.page}>
      <div className={styles.blob1} /><div className={styles.blob2} />

      <div className={styles.card}>
        <span className={styles.logo}>🎯</span>
        <h1 className={styles.title}>لعبة وفكرة</h1>
        <p className={styles.sub}>منصة الألعاب التعليمية للمعلمين</p>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'login' ? styles.active : ''}`}
            onClick={() => { setTab('login'); setError('') }}
          >
            تسجيل الدخول
          </button>
          <button
            className={`${styles.tab} ${tab === 'register' ? styles.active : ''}`}
            onClick={() => { setTab('register'); setError('') }}
          >
            حساب جديد
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label className={styles.label}>اسم المستخدم</label>
          <input
            className="form-input"
            placeholder="مثال: teacher_nour"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete="username"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>كلمة المرور</label>
          <input
            className="form-input"
            type="password"
            placeholder="6 أحرف على الأقل"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        <button
          className={styles.submitBtn}
          onClick={handleSubmit}
          disabled={busy}
        >
          {busy ? '…' : tab === 'login' ? 'دخول' : 'إنشاء الحساب'}
        </button>
      </div>
    </div>
  )
}
