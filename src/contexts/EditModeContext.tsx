import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { PlacementMode } from '../types/iceberg'

type EditModeContextValue = {
  editMode: boolean
  setEditMode: (value: boolean) => void
  toggleEditMode: () => void
  enterEditMode: () => void
  exitEditMode: () => void
  placementMode: PlacementMode
  setPlacementMode: (mode: PlacementMode) => void
  repositionTopicId: string | null
  setRepositionTopicId: (id: string | null) => void
  exitPlacement: () => void
}

const EditModeContext = createContext<EditModeContextValue | null>(null)

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [editMode, setEditMode] = useState(false)
  const [placementMode, setPlacementMode] = useState<PlacementMode>('idle')
  const [repositionTopicId, setRepositionTopicId] = useState<string | null>(null)

  const exitPlacement = useCallback(() => {
    setPlacementMode('idle')
    setRepositionTopicId(null)
  }, [])

  const enterEditMode = useCallback(() => {
    setEditMode(true)
  }, [])

  const exitEditMode = useCallback(() => {
    setEditMode(false)
    setPlacementMode('idle')
    setRepositionTopicId(null)
  }, [])

  const toggleEditMode = useCallback(() => {
    setEditMode((prev) => {
      if (prev) {
        setPlacementMode('idle')
        setRepositionTopicId(null)
        return false
      }
      return true
    })
  }, [])

  const value = useMemo(
    () => ({
      editMode,
      setEditMode,
      toggleEditMode,
      enterEditMode,
      exitEditMode,
      placementMode,
      setPlacementMode,
      repositionTopicId,
      setRepositionTopicId,
      exitPlacement,
    }),
    [
      editMode,
      toggleEditMode,
      enterEditMode,
      exitEditMode,
      placementMode,
      repositionTopicId,
      exitPlacement,
    ],
  )

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>
}

export function useEditMode() {
  const ctx = useContext(EditModeContext)
  if (!ctx) throw new Error('useEditMode must be used within EditModeProvider')
  return ctx
}
