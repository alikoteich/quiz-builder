import { supabase } from './supabase'
import type { Game, WheelList } from './types'

// ── Auth ──────────────────────────────────────────────────────────────────────

// We store users as username@rouda.app so Supabase Auth is happy with emails
const toFakeEmail = (username: string) => `${username}@rouda.app`

export async function signIn(username: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: toFakeEmail(username),
    password,
  })
  return { user: data?.user ?? null, error }
}

export async function signUp(username: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email: toFakeEmail(username),
    password,
  })

  if (error) return { user: null, error }

  const user = data?.user
  if (!user) return { user: null, error: new Error('EMAIL_CONFIRM_REQUIRED') }

  // Detect duplicate emails (Supabase returns identities:[] silently)
  if (!user.identities || user.identities.length === 0) {
    return { user: null, error: new Error('USERNAME_TAKEN') }
  }

  // Save username to profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({ id: user.id, username })

  if (profileError) {
    await supabase.auth.signOut()
    return { user: null, error: new Error('USERNAME_TAKEN') }
  }

  return { user, error: null }
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUsername(userId: string): Promise<string> {
  const { data } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single()
  return data?.username ?? ''
}

// ── Games ─────────────────────────────────────────────────────────────────────

export async function loadGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .order('id')

  if (error) { console.error(error); return [] }

  return (data ?? []).map((row) => ({
    id:      row.id,
    name:    row.name,
    type:    row.type,
    entries: row.entries,
    created: row.created,
  }))
}

export async function saveGame(game: Game, userId: string): Promise<boolean> {
  const { error } = await supabase.from('games').upsert({
    id:      game.id,
    user_id: userId,
    name:    game.name,
    type:    game.type,
    entries: game.entries,
    created: game.created,
  })
  if (error) { console.error(error); return false }
  return true
}

export async function deleteGame(id: string): Promise<boolean> {
  const { error } = await supabase.from('games').delete().eq('id', id)
  if (error) { console.error(error); return false }
  return true
}

// ── Wheel lists ───────────────────────────────────────────────────────────────

export async function loadWheelLists(): Promise<WheelList[]> {
  const { data, error } = await supabase
    .from('wheel_lists')
    .select('*')
    .order('created_at')

  if (error) { console.error(error); return [] }

  return (data ?? []).map((r) => ({ id: r.id, title: r.title, names: r.names }))
}

export async function saveWheelList(
  title: string,
  names: string[],
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('wheel_lists')
    .insert({ user_id: userId, title, names })
  if (error) { console.error(error); return false }
  return true
}

export async function deleteWheelList(id: string): Promise<boolean> {
  const { error } = await supabase.from('wheel_lists').delete().eq('id', id)
  if (error) { console.error(error); return false }
  return true
}
