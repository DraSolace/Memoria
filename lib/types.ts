export interface MemoryWidget {
  id: string
  type: 'memory'
  imageData: string // base64 data URL
  caption: string
  createdAt: string // ISO date string
  width: number
  height: number
  order: number
}

export interface ThoughtWidget {
  id: string
  type: 'thought'
  title: string
  content: string
  flavorText: string
  createdAt: string // ISO date string
  width: number
  height: number
  order: number
}

export interface DividerItem {
  id: string
  type: 'divider'
  label: string
  collapsed: boolean
  order: number
}

export type Widget = MemoryWidget | ThoughtWidget
export type Item = Widget | DividerItem

export interface AppData {
  items: Item[]
  customPhrases: string[]
}
