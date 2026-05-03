'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/db'
import styles from './TopBar.module.css'

interface Props {
  showBack?:  boolean
  backPath?:  string
  showUser?:  boolean
  username?:  string
}

export default function TopBar({ showBack, backPath = '/', showUser, username }: Props) {
  const router = useRouter()

  async function handleLogout() {
    await signOut()
    router.replace('/auth')
  }

  return (
    <header className={styles.bar}>
      <span className={styles.logo}>🎯 لعبة وفكرة</span>
      <div style={{ display:'flex', gap:10, alignItems:'center' }}>
        {showUser && username && (
          <>
            <span className={styles.userBadge}>👤 {username}</span>
            <button className={styles.logoutBtn} onClick={handleLogout}>خروج</button>
          </>
        )}
        {showBack && (
          <button className={styles.backBtn} onClick={() => router.push(backPath)}>← رجوع</button>
        )}
      </div>
    </header>
  )
}
