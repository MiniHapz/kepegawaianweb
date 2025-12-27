import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FaTachometerAlt,
  FaChalkboardTeacher,
  FaUsers,
  FaSignOutAlt,
  FaBars,
} from 'react-icons/fa'
import './SidebarA.css'
import api from '../../../services/api'

export default function SidebarAdminCabdin({ collapsed, onToggle }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // 🔹 Ambil data user login
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/me')
        const data = res.data

        if (data.status === 'success' && data.data) {
          setUser(data.data)
        } else if (data.user) {
          setUser(data.user)
        } else {
          throw new Error('Format response tidak valid')
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [navigate])

  // 🔹 Logout
  const handleLogout = async () => {
    try {
      await api.post('/logout')
    } catch (error) {
      console.warn('Logout API gagal:', error)
    } finally {
      localStorage.removeItem('token')
      navigate('/login', { replace: true })
    }
  }

  const confirmLogout = () => {
    handleLogout()
    setShowLogoutConfirm(false)
  }

  const cancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  // 🔹 Loading state
  if (loading) {
    return (
      <aside className={`sidebar-admin ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-admin-inner">
          <div className="loading-sidebar">
            <div className="spinner"></div>
          </div>
        </div>
      </aside>
    )
  }

  // 🔹 Profil user
  const profile = user
    ? {
        name: user.name || user.nama_lengkap || 'Tanpa Nama',
        role:
          user.role === 'admin_cabdin'
            ? 'Administrator Cabang Dinas'
            : user.role === 'admin'
            ? 'Administrator'
            : user.role || 'User',
        initials: (user.name || user.nama_lengkap || '?')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      }
    : {
        name: '-',
        role: '-',
        initials: 'AC',
      }

  return (
    <>
      <aside className={`sidebar-admin ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-admin-inner">
          <div className="sidebar-admin-top">
            <button
              className="collapse-admin-btn"
              onClick={onToggle}
              aria-label="Toggle sidebar"
            >
              <FaBars />
            </button>

            <div className="profile-admin">
              <div className="avatar-admin">{profile.initials}</div>
              <div className="profile-admin-meta">
                <div className="profile-admin-name">{profile.name}</div>
                <div className="profile-admin-role">{profile.role}</div>
              </div>
            </div>

            <nav className="menu-admin">
              <NavLink to="/admin-cabdin/dashboard" className="menu-admin-item">
                <FaTachometerAlt className="menu-admin-icon" />
                <span className="menu-admin-label">Dashboard</span>
              </NavLink>

              <NavLink to="/admin-cabdin/data-guru" className="menu-admin-item">
                <FaChalkboardTeacher className="menu-admin-icon" />
                <span className="menu-admin-label">Data Guru</span>
              </NavLink>

              <NavLink
                to="/admin-cabdin/manajemen-pengguna"
                className="menu-admin-item"
              >
                <FaUsers className="menu-admin-icon" />
                <span className="menu-admin-label">Manajemen Pengguna</span>
              </NavLink>
            </nav>
          </div>

          <div className="sidebar-admin-bottom">
            <button
              className="logout-admin-btn"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <FaSignOutAlt className="logout-admin-icon" />
              <span className="logout-admin-label">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="sa-modal-overlay">
          <div className="sa-modal-container">
            <div className="sa-modal-content">
              <h3>Konfirmasi Logout</h3>
              <p>Apakah Anda yakin ingin keluar dari sistem?</p>
              <p className="sa-modal-warning">
                Anda perlu login kembali untuk mengakses sistem
              </p>
            </div>

            <div className="sa-modal-actions">
              <button
                className="sa-btn-modal-secondary"
                onClick={cancelLogout}
              >
                Batal
              </button>
              <button
                className="sa-btn-modal-danger"
                onClick={confirmLogout}
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
