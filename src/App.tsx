import { Navigate, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { IcebergPage } from './pages/IcebergPage'
import { AboutPage } from './pages/AboutPage'
import { EditModeProvider, useEditMode } from './contexts/EditModeContext'

function AppShell() {
  const { editMode, toggleEditMode, enterEditMode, exitEditMode } = useEditMode()

  return (
    <div className="min-h-dvh flex flex-col">
      <Header
        editMode={editMode}
        onToggleEditMode={toggleEditMode}
        onEnterEditMode={enterEditMode}
        onExitEditMode={exitEditMode}
      />
      <main className="flex flex-1 flex-col pt-16">
        <Routes>
          <Route path="/" element={<Navigate to="/iceberg" replace />} />
          <Route path="/iceberg" element={<IcebergPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/iceberg" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <EditModeProvider>
      <AppShell />
    </EditModeProvider>
  )
}
