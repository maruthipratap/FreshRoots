import { useLayoutEffect } from 'react'

const iconPaths = {
  alert: '<path d="M12 3.5 3.2 18.5h17.6L12 3.5Z"/><path d="M12 8.5v4"/><path d="M12 16h.01"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/>',
  calendar: '<path d="M7 3v4"/><path d="M17 3v4"/><path d="M4 8h16"/><path d="M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"/>',
  camera: '<path d="M5 7h3l1.5-2h5L16 7h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  clipboard: '<path d="M9 4h6l1 2h2a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h2l1-2Z"/><path d="M9 12h6"/><path d="M9 16h4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
  counter: '<path d="M17 2v5h-5"/><path d="M7 22v-5h5"/><path d="M19 9a7 7 0 0 0-11.9-3.9L3 9"/><path d="M5 15a7 7 0 0 0 11.9 3.9L21 15"/>',
  crown: '<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8Z"/><path d="M5 19h14"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13 7 4 4"/>',
  farm: '<path d="M4 19h16"/><path d="M6 19V9l6-4 6 4v10"/><path d="M9 19v-6h6v6"/><path d="M9 10h.01"/><path d="M15 10h.01"/>',
  handshake: '<path d="M8 12 5.5 9.5a2.1 2.1 0 0 1 0-3L7 5l5 5"/><path d="m16 12 2.5-2.5a2.1 2.1 0 0 0 0-3L17 5l-5 5"/><path d="m8 12 3 3a2 2 0 0 0 2.8 0L16 12"/><path d="m10 14-2 2"/><path d="m14 14 2 2"/>',
  image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m6 17 4.5-4 3 3 2-2 2.5 3"/>',
  leaf: '<path d="M20 4C10 4 5 9 5 19"/><path d="M20 4c0 10-5 15-15 15"/><path d="M8 16c3-1 5-3 7-6"/>',
  lightning: '<path d="M13 2 5 14h6l-1 8 8-12h-6l1-8Z"/>',
  location: '<path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  package: '<path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z"/><path d="m4 7 8 4 8-4"/><path d="M12 11v10"/>',
  payment: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18"/><path d="M7 15h3"/>',
  phone: '<path d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M11 18h2"/>',
  play: '<path d="M8 5v14l11-7L8 5Z"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  rupee: '<path d="M7 5h10"/><path d="M7 9h10"/><path d="M9 5c4.5 0 4.5 7 0 7H7l7 7"/>',
  shield: '<path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/>',
  spinner: '<path d="M12 3a9 9 0 1 1-8.2 5.3"/><path d="M4 3v5h5"/>',
  star: '<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
  store: '<path d="M4 10h16l-2-5H6l-2 5Z"/><path d="M6 10v10h12V10"/><path d="M9 20v-6h6v6"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M7 7l1 14h8l1-14"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  truck: '<path d="M3 7h11v9H3V7Z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<path d="M16 21a6 6 0 0 0-12 0"/><circle cx="10" cy="8" r="4"/><path d="M20 20a5 5 0 0 0-4-4.9"/><path d="M17 4.5a3.5 3.5 0 0 1 0 7"/>',
  x: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
}

const emojiToIcon = new Map([
  ['🌱', 'leaf'], ['🌾', 'farm'], ['🌿', 'leaf'], ['🥬', 'leaf'], ['🥦', 'leaf'], ['🍎', 'leaf'],
  ['🥛', 'store'], ['🥩', 'package'], ['🥚', 'package'], ['🫙', 'store'], ['👨‍🌾', 'farm'],
  ['🛒', 'store'], ['📦', 'package'], ['📋', 'clipboard'], ['⏳', 'spinner'], ['✅', 'check'],
  ['❌', 'x'], ['🚫', 'x'], ['🔄', 'counter'], ['🤝', 'handshake'], ['👥', 'users'], ['👤', 'user'],
  ['📍', 'location'], ['📱', 'phone'], ['📞', 'phone'], ['💰', 'rupee'], ['💳', 'payment'],
  ['🚚', 'truck'], ['🏪', 'store'], ['📅', 'calendar'], ['📸', 'camera'], ['📷', 'camera'],
  ['🔔', 'bell'], ['🔥', 'lightning'], ['🎉', 'star'], ['🌟', 'star'], ['⚡', 'lightning'],
  ['⚠️', 'alert'], ['😕', 'alert'], ['🔒', 'lock'], ['⏰', 'clock'], ['👑', 'crown'],
  ['🗑️', 'trash'], ['✏️', 'edit'], ['🔰', 'shield'], ['➕', 'plus'], ['▶️', 'play'],
])

const emojiRegex = /👨‍🌾|⚠️|🗑️|✏️|▶️|[🌱🌾🌿🥬🥦🍎🥛🥩🥚🫙🛒📦📋⏳✅❌🚫🔄🤝👥👤📍📱📞💰💳🚚🏪📅📸📷🔔🔥🎉🌟⚡😕🔒⏰👑🔰➕]/u
const emojiGlobalRegex = /👨‍🌾|⚠️|🗑️|✏️|▶️|[🌱🌾🌿🥬🥦🍎🥛🥩🥚🫙🛒📦📋⏳✅❌🚫🔄🤝👥👤📍📱📞💰💳🚚🏪📅📸📷🔔🔥🎉🌟⚡😕🔒⏰👑🔰➕]/gu

function createIcon(iconName) {
  const span = document.createElement('span')
  span.className = `freshroots-emoji-icon freshroots-emoji-icon-${iconName}`
  span.setAttribute('aria-hidden', 'true')
  span.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">${iconPaths[iconName] || iconPaths.leaf}</svg>`
  return span
}

function replaceTextNode(node) {
  const text = node.nodeValue
  if (!text || !emojiRegex.test(text)) return

  const fragment = document.createDocumentFragment()
  let lastIndex = 0

  for (const match of text.matchAll(emojiGlobalRegex)) {
    const emoji = match[0]
    const index = match.index
    if (index > lastIndex) {
      fragment.append(document.createTextNode(text.slice(lastIndex, index)))
    }
    fragment.append(createIcon(emojiToIcon.get(emoji)))
    lastIndex = index + emoji.length
  }

  if (lastIndex < text.length) {
    fragment.append(document.createTextNode(text.slice(lastIndex)))
  }

  node.parentNode?.replaceChild(fragment, node)
}

function walk(root) {
  if (!root || root.nodeType !== Node.ELEMENT_NODE) return
  if (root.closest?.('svg, script, style, textarea, select, option, [data-emoji-processed]')) return

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!emojiRegex.test(node.nodeValue || '')) return NodeFilter.FILTER_REJECT
      const parent = node.parentElement
      if (!parent || parent.closest('svg, script, style, textarea, select, option, [data-emoji-processed]')) {
        return NodeFilter.FILTER_REJECT
      }
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  nodes.forEach(replaceTextNode)
}

export default function EmojiIconReplacer() {
  useLayoutEffect(() => {
    walk(document.body)

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) replaceTextNode(node)
          if (node.nodeType === Node.ELEMENT_NODE) walk(node)
        })
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
