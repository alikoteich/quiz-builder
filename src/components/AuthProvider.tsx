'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { getUsername } from '@/lib/db'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  username: string
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, username: '', loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null
      setUser(u)
      if (u) getUsername(u.id).then(setUsername)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) getUsername(u.id).then(setUsername)
      else setUsername('')
    })

    return () => subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, username, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
