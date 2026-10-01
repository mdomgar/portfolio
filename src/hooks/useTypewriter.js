import { useEffect, useState } from 'react'

export function nextTypewriterState(state, words, { typeMs, deleteMs, holdMs }) {
  const word = words[state.index]
  if (!state.deleting) {
    if (state.text.length < word.length) return { ...state, text: word.slice(0, state.text.length + 1), delay: typeMs }
    return { ...state, deleting: true, delay: holdMs }
  }
  if (state.text.length > 0) return { ...state, text: word.slice(0, state.text.length - 1), delay: deleteMs }
  return { index: (state.index + 1) % words.length, text: '', deleting: false, delay: typeMs }
}

export function useTypewriter(words, { enabled = true, typeMs = 75, deleteMs = 40, holdMs = 1600 } = {}) {
  const key = words.join('|')
  const [state, setState] = useState({ index: 0, text: '', deleting: false, delay: typeMs, key })

  if (state.key !== key) setState({ index: 0, text: '', deleting: false, delay: typeMs, key })

  useEffect(() => {
    if (!enabled) return undefined
    const id = setTimeout(
      () => setState((current) => ({ ...nextTypewriterState(current, key.split('|'), { typeMs, deleteMs, holdMs }), key })),
      state.delay,
    )
    return () => clearTimeout(id)
  }, [state, enabled, key, typeMs, deleteMs, holdMs])

  return enabled ? state.text : words[0]
}
