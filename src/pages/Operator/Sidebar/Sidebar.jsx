import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaChalkboardTeacher,
  FaBook,
  FaSignOutAlt,
  FaBars
} from 'react-icons/fa';
import './Sidebar.css';
import api from '../../../services/api';

// const API_URL = 'https://testweb2025.host.adellya.my.id/kepegawaian-api/public/api';

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // const token = localStorage.getItem('token');

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await api.get('/me');
      setUser(res.data.data);
    } catch (err) {
      localStorage.removeItem('token');
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, [navigate]);

  const handleLogout = async () => {
  try {
    await api.post('/logout');
  } catch (e) {
    // abaikan error
  } finally {
    localStorage.removeItem('token');
    navigate('/landing', { replace: true });
  }
};


  if (loading) {
    return (
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-inner">
          <div className="loading-sidebar">
            <div className="spinner"></div>
          </div>
        </div>
      </aside>
    );
  }

  const profile = {
    name: user?.name || 'Tanpa Nama',
    role:
      user?.role === 'operator'
        ? 'Operator Sekolah'
        : user?.role === 'admin'
        ? 'Admin Cabdin'
        : user?.role || '-',
    initials:
      user?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || '?',
  };

  return (
    <>
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-inner">
          <div className="sidebar-top">
            <button className="collapse-btn" onClick={onToggle}>
              <FaBars />
            </button>

            <div className="profile">
              <div className="avatar">{profile.initials}</div>
              <div className="profile-meta">
                <div className="profile-name">{profile.name}</div>
                <div className="profile-role">{profile.role}</div>
              </div>
            </div>

            <nav className="menu">
              <NavLink to="/operator/dashboard" className="menu-item">
                <FaTachometerAlt className="menu-icon" />
                <span className="menu-label">Dashboard</span>
              </NavLink>

              <NavLink to="/operator/dataguru" className="menu-item">
                <FaChalkboardTeacher className="menu-icon" />
                <span className="menu-label">Data Guru Sekolah</span>
              </NavLink>

              <NavLink to="/operator/mapel" className="menu-item">
                <FaBook className="menu-icon" />
                <span className="menu-label">Mata Pelajaran</span>
              </NavLink>
            </nav>
          </div>

          <div className="sidebar-bottom">
            <button
              className="logout-btn"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <FaSignOutAlt className="logout-icon" />
              <span className="logout-label">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MODAL LOGOUT */}
      {showLogoutConfirm && (
        <div className="so-modal-overlay">
          <div className="so-modal-container">
            <div className="so-modal-content">
              <h3>Konfirmasi Logout</h3>
              <p>Apakah Anda yakin ingin keluar dari sistem?</p>
              <p className="so-modal-warning">
                Anda perlu login kembali untuk mengakses sistem
              </p>
            </div>

            <div className="so-modal-actions">
              <button
                className="so-btn-modal-secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Batal
              </button>
              <button
                className="so-btn-modal-danger"
                onClick={handleLogout}
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
