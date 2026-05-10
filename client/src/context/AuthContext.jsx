import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function sanitizeToken(value) {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw || raw === 'null' || raw === 'undefined') return null
  return raw
}

function sanitizeUser(value) {
  return value && typeof value === 'object' ? value : null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return sanitizeUser(JSON.parse(sessionStorage.getItem('velora_user')))
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() =>
    sanitizeToken(sessionStorage.getItem('velora_token'))
  )

  const login = (userData, tokenData) => {
    const safeUser = sanitizeUser(userData)
    const safeToken = sanitizeToken(tokenData)

    setUser(safeUser)
    setToken(safeToken)

    if (safeUser) {
      sessionStorage.setItem('velora_user', JSON.stringify(safeUser))
    } else {
      sessionStorage.removeItem('velora_user')
    }

    if (safeToken) {
      sessionStorage.setItem('velora_token', safeToken)
    } else {
      sessionStorage.removeItem('velora_token')
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    sessionStorage.removeItem('velora_user')
    sessionStorage.removeItem('velora_token')
  }

  const updateUser = (newUserData) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...newUserData }
      sessionStorage.setItem('velora_user', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
