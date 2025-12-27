import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Pages
import LandingPage from './pages/Operator/Landing/LandingPage.jsx'
import Login from './pages/Operator/Login/Login.jsx'

// Operator Pages
import Mapel from './pages/Operator/Mapel/Mapel.jsx'
import Dashboard from './pages/Operator/Dashboard/Dashboard.jsx'
import DataGuru from './pages/Operator/DataGuru/DataGuru.jsx'
import TambahGuru from './pages/Operator/DataGuru/TambahGuru.jsx'
import EditGuru from './pages/Operator/DataGuru/EditGuru.jsx'
import ViewGuru from './pages/Operator/DataGuru/ViewGuru.jsx'
// Admin Pages
import DashboardA from './pages/Admin/Dashboard/DashboardA.jsx'
import DataGuruAdmin from './pages/Admin/DataGuru/DataGuru.jsx'
import TambahSekolah from './pages/Admin/Dashboard/TambahSekolah.jsx';
import DetailSekolah from './pages/Admin/Dashboard/DetailSekolah.jsx';
import DetailGuru from './pages/Admin/DataGuru/DetailGuru.jsx';
import ManajemenPengguna from './pages/Admin/ManajemenPengguna/ManajemenPengguna.jsx'
import TambahPengguna from './pages/Admin/ManajemenPengguna/TambahPengguna.jsx'
import EditPengguna from './pages/Admin/ManajemenPengguna/EditPengguna.jsx'

// ---------------------------
// Protected Route Component
// ---------------------------
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const userSession = JSON.parse(localStorage.getItem('sessionUser') || '{}')

  if (!userSession.role) return <Navigate to="/login" replace />

  if (allowedRoles.length > 0 && !allowedRoles.includes(userSession.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

// ---------------------------
// Main App
// ---------------------------
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Operator Routes */}
        <Route
          path="/operator/dashboard"
          element={
            <ProtectedRoute allowedRoles={['operator_sekolah']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/dataguru"
          element={
            <ProtectedRoute allowedRoles={['operator_sekolah']}>
              <DataGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/data-guru/tambah"
          element={
            <ProtectedRoute allowedRoles={['operator_sekolah']}>
              <TambahGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/data-guru/view/:nip"
          element={
            <ProtectedRoute allowedRoles={['operator_sekolah']}>
              <ViewGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/data-guru/edit/:nip"
          element={
            <ProtectedRoute allowedRoles={['operator_sekolah']}>
              <EditGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/operator/mapel"
          element={
            <ProtectedRoute allowedRoles={['operator_sekolah']}>
              <Mapel />
            </ProtectedRoute>
          }
        />       

        {/* Admin Cabdin Routes */}
        <Route
          path="/admin-cabdin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin_cabdin']}>
              <DashboardA />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-cabdin/data-guru"
          element={
            <ProtectedRoute allowedRoles={['admin_cabdin']}>
              <DataGuruAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-cabdin/tambah-sekolah"
          element={
            <ProtectedRoute allowedRoles={['admin_cabdin']}>
              <TambahSekolah />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-cabdin/detail-sekolah/:id"
          element={
            <ProtectedRoute allowedRoles={['admin_cabdin']}>
              <DetailSekolah />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-cabdin/data-guru/detail/:nip"
          element={
            <ProtectedRoute allowedRoles={['admin_cabdin']}>
              <DetailGuru />
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin-cabdin/tambah-pengguna"
          element={
            <ProtectedRoute allowedRoles={['admin_cabdin']}>
              <TambahPengguna />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-cabdin/manajemen-pengguna/edit/:userId"
          element={
            <ProtectedRoute allowedRoles={['admin_cabdin']}>
              <EditPengguna />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-cabdin/manajemen-pengguna"
          element={
            <ProtectedRoute allowedRoles={['admin_cabdin']}>
              <ManajemenPengguna />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
