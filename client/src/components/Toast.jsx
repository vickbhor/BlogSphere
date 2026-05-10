import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'

let toastQueue = []
let listeners = []

export function toast(message, type = 'info') {
  const id = Date.now()
  toastQueue = [...toastQueue, { id, message, type }]
  listeners.forEach((fn) => fn([...toastQueue]))
  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== id)
    listeners.forEach((fn) => fn([...toastQueue]))
  }, 4000)
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      listeners = listeners.filter((fn) => fn !== setToasts)
    }
  }, [])

  const dismiss = (id) => {
    toastQueue = toastQueue.filter((t) => t.id !== id)
    setToasts([...toastQueue])
  }

  const icons = {
    success: (
      <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
    ),
    error: <XCircle size={20} className="text-rose-500 flex-shrink-0" />,
    info: <Info size={20} className="text-blue-500 flex-shrink-0" />,
  }

  return (
    <div className="fixed top-24 right-4 z-[200] flex flex-col gap-3 min-w-[300px] max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start gap-3 p-4 rounded-2xl bg-surface-container-high border border-outline-variant shadow-2xl animate-slide-in backdrop-blur-xl"
        >
          {icons[t.type] || icons.info}
          <p className="text-sm text-on-surface flex-1 leading-snug">
            {t.message}
          </p>
          <button
            onClick={() => dismiss(t.id)}
            className="text-on-surface-variant hover:text-on-surface transition-colors mt-0.5"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
