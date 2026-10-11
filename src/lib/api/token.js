const TOKEN_KEY = 'vp_unicars_token'

export const tokenStorage = {
  get() {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  },
  set(token) {
    try { localStorage.setItem(TOKEN_KEY, token) } catch { /* modo privado */ }
  },
  remove() {
    try { localStorage.removeItem(TOKEN_KEY) } catch { /* nada */ }
  },
}
