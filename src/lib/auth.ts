// Stub auth - real auth is done client-side via localStorage
// This file exists so existing imports don't crash

export const auth = async () => null
export const handlers = {
  GET: async () => new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } }),
  POST: async () => new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } }),
}
export const signIn = async () => {}
export const signOut = async () => {}
