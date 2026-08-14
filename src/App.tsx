import { Navigate, Route, Routes } from 'react-router-dom'
import { Header } from './components/Header'
import { IcebergPage } from './pages/IcebergPage'
import { AboutPage } from './pages/AboutPage'
import { TopicPage } from './pages/TopicPage'

function AppShell() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex flex-1 flex-col pt-16">
        <Routes>
          <Route path="/" element={<Navigate to="/iceberg" replace />} />
          <Route path="/iceberg" element={<IcebergPage />} />
          <Route path="/topico/:id" element={<TopicPage />} />
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/iceberg" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return <AppShell />
}
