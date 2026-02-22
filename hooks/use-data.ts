import useSWR from 'swr'
import type { AppData, Item } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useAppData() {
  const { data, error, isLoading, mutate } = useSWR<AppData>('/api/data', fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true,
  })

  const saveData = async (newData: AppData) => {
    await mutate(newData, false)
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newData),
    })
    await mutate()
  }

  const addItem = async (item: Item) => {
    const current = data || { items: [], customPhrases: [] }
    const newItems = [...current.items, item].sort((a, b) => a.order - b.order)
    await saveData({ ...current, items: newItems })
  }

  const updateItem = async (id: string, updates: Partial<Item>) => {
    const current = data || { items: [], customPhrases: [] }
    const newItems = current.items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
    await saveData({ ...current, items: newItems })
  }

  const deleteItem = async (id: string) => {
    const current = data || { items: [], customPhrases: [] }
    const newItems = current.items.filter(item => item.id !== id)
    await saveData({ ...current, items: newItems })
  }

  const reorderItems = async (newItems: Item[]) => {
    const current = data || { items: [], customPhrases: [] }
    await saveData({ ...current, items: newItems })
  }

  const addPhrase = async (phrase: string) => {
    const current = data || { items: [], customPhrases: [] }
    const newPhrases = [...(current.customPhrases || []), phrase]
    await saveData({ ...current, customPhrases: newPhrases })
  }

  const removePhrase = async (index: number) => {
    const current = data || { items: [], customPhrases: [] }
    const newPhrases = [...(current.customPhrases || [])]
    newPhrases.splice(index, 1)
    await saveData({ ...current, customPhrases: newPhrases })
  }

  return {
    data: data || { items: [], customPhrases: [] },
    error,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    addPhrase,
    removePhrase,
    saveData,
    mutate,
  }
}
