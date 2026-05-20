import type { ParsedElement, PageSkeleton } from './types'

/** Minimal type for Excalidraw elements we care about */
interface SketchElement {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  updated: number
  isDeleted: boolean
  text?: string
}

/** Check if rect B is mostly contained inside rect A */
function contains(a: ParsedElement, b: ParsedElement): boolean {
  const pad = 4
  return (
    b.bbox.x >= a.bbox.x - pad &&
    b.bbox.y >= a.bbox.y - pad &&
    b.bbox.x + b.bbox.width <= a.bbox.x + a.bbox.width + pad &&
    b.bbox.y + b.bbox.height <= a.bbox.y + a.bbox.height + pad
  )
}

/** Get the nearest rectangle to a text element */
function findNearestRect(textEl: ParsedElement, rects: ParsedElement[]): ParsedElement | undefined {
  const tx = textEl.bbox.x + textEl.bbox.width / 2
  const ty = textEl.bbox.y + textEl.bbox.height / 2
  let nearest: ParsedElement | undefined
  let minDist = Infinity
  for (const r of rects) {
    const rx = r.bbox.x + r.bbox.width / 2
    const ry = r.bbox.y + r.bbox.height / 2
    const d = Math.sqrt((tx - rx) ** 2 + (ty - ry) ** 2)
    if (d < minDist) {
      minDist = d
      nearest = r
    }
  }
  return nearest
}

/** Parse Excalidraw JSON into a structured page skeleton */
export function parseSketch(elements: readonly SketchElement[]): PageSkeleton {
  const parsed: ParsedElement[] = []

  for (const el of elements) {
    if (el.isDeleted) continue

    const base: ParsedElement = {
      id: el.id,
      type: el.type as ParsedElement['type'],
      bbox: { x: el.x, y: el.y, width: el.width ?? 0, height: el.height ?? 0 },
      createdAt: el.updated,
    }

    if (el.type === 'text') {
      base.label = el.text ?? ''
      if (base.label?.trim()) parsed.push(base)
    } else if (['rect', 'ellipse', 'diamond', 'arrow', 'line', 'freedraw'].includes(el.type)) {
      parsed.push(base)
    }
  }

  // Sort by created timestamp for draw order
  const drawOrder = [...parsed].sort((a, b) => a.createdAt - b.createdAt).map((p) => p.id)

  const rects = parsed.filter((p) => p.type === 'rect')
  const texts = parsed.filter((p) => p.type === 'text')
  const arrows = parsed.filter((p) => p.type === 'arrow')
  const nonRects = parsed.filter((p) => p.type !== 'rect' && p.type !== 'text' && p.type !== 'arrow')

  // Assign text labels to nearest rect
  for (const t of texts) {
    const near = findNearestRect(t, rects)
    if (near) {
      near.label = (near.label ? near.label + ' ' : '') + t.label
      t.parentId = near.id
    }
  }

  // Determine parent-child (nesting) for rects
  const topLevel: ParsedElement[] = []
  const nested: { parent: ParsedElement; children: ParsedElement[] }[] = []

  for (const r of rects) {
    let parent: ParsedElement | undefined
    for (const other of rects) {
      if (other.id === r.id) continue
      if (contains(other, r)) {
        if (!parent || other.bbox.width < parent.bbox.width) {
          parent = other
        }
      }
    }
    if (parent) {
      const existing = nested.find((n) => n.parent.id === parent!.id)
      if (existing) {
        existing.children.push(r)
      } else {
        nested.push({ parent, children: [r] })
        if (!topLevel.includes(parent)) topLevel.push(parent)
      }
    } else if (!nested.some((n) => n.children.includes(r))) {
      topLevel.push(r)
    }
  }

  // Add non-rect non-text elements as top level
  for (const n of nonRects) {
    topLevel.push(n)
  }

  // Parse arrows as dependency links
  const arrowLinks: { from: string; to: string }[] = []
  for (const a of arrows) {
    const startX = a.bbox.x
    const startY = a.bbox.y
    const endX = a.bbox.x + a.bbox.width
    const endY = a.bbox.y + a.bbox.height

    const nearStart = findNearestRect(
      { bbox: { x: startX, y: startY, width: 1, height: 1 } } as ParsedElement,
      rects,
    )
    const nearEnd = findNearestRect(
      { bbox: { x: endX, y: endY, width: 1, height: 1 } } as ParsedElement,
      rects,
    )

    if (nearStart && nearEnd && nearStart.id !== nearEnd.id) {
      arrowLinks.push({ from: nearStart.id, to: nearEnd.id })
    }
  }

  return {
    topLevel: topLevel.filter((t) => !t.parentId),
    nested,
    arrows: arrowLinks,
    textLabels: texts.filter((t) => t.label?.trim()).map((t) => ({ text: t.label!, nearElementId: t.parentId })),
    drawOrder,
  }
}
