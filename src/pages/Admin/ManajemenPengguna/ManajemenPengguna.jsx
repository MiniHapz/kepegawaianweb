import React, { useState, useEffect } from 'react';
import './ManajemenPengguna.css';
import SidebarAdminCabdin from '../Sidebar/SidebarA';
import { FaSearch, FaEdit, FaPlus, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import api from "../../../services/api";


const ManajemenPengguna = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSekolah, setSelectedSekolah] = useState('Semua Sekolah');
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [dataPengguna, setDataPengguna] = useState([]);


  const [sekolahOptions, setSekolahOptions] = useState(['Semua Sekolah']);
  const navigate = useNavigate();

  const handleTambahPengguna = () => {
    navigate('/admin-cabdin/tambah-pengguna');
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleToggleSidebar = () => setCollapsed(prev => !prev);

  // Ambil data user dari backend
useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, sekolahRes] = await Promise.all([
          api.get("/users"),
          api.get("/sekolah"),
        ]);

        // format user
        const formattedUsers = userRes.data.map((user) => ({
          id: user.id,
          nama: user.name,
          username: user.username,
          role: user.role,
          sekolah: user.sekolah ? user.sekolah.nama_sekolah : "-",
          lastLogin: user.last_login_at
            ? new Date(user.last_login_at).toLocaleString()
            : "-",
          status: user.status === "NonAktif" ? "NonAktif" : "Aktif",
        }));

        setDataPengguna(formattedUsers);

        // sekolah option
        const sekolahList = sekolahRes.data.data.map(
          (s) => s.nama_sekolah
        );
        setSekolahOptions(["Semua Sekolah", ...sekolahList]);
      } catch (error) {
        console.error("Gagal memuat data pengguna:", error);
      }
    };

    fetchData();
  }, []);

  // Filter status
  const statusOptions = ['Semua Status', 'Aktif', 'NonAktif'];

  const filteredPengguna = dataPengguna.filter(pengguna => {
    const matchesSearch =
      pengguna.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pengguna.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pengguna.sekolah.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSekolah = selectedSekolah === 'Semua Sekolah' || pengguna.sekolah === selectedSekolah;
    const matchesStatus = selectedStatus === 'Semua Status' || pengguna.status === selectedStatus;
    return matchesSearch && matchesSekolah && matchesStatus;
  });

  const handleEditUser = (userId) => {
    navigate(`/admin-cabdin/manajemen-pengguna/edit/${userId}`);
  };

 const handleToggleStatus = async (userId) => {
    try {
      await api.put(`/users/${userId}/toggle-status`);

      setDataPengguna((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                status: u.status === "Aktif" ? "NonAktif" : "Aktif",
              }
            : u
        )
      );
    } catch (err) {
      console.error("Gagal mengubah status pengguna:", err);
    }
  };

  
  return (
    <div className="acd-app">
      <SidebarAdminCabdin collapsed={collapsed} onToggle={handleToggleSidebar} />

      {isMobile && !collapsed && (
        <div className="acd-sidebar-overlay" onClick={() => setCollapsed(true)} />
      )}

      <main className={`acd-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="acd-header">
          <div className="acd-header-left">
            <div className="acd-title-section">
              <h1>Manajemen Pengguna</h1>
              <div className="acd-subtitle">Cabang Dinas Pendidikan Wilayah VII</div>
            </div>
          </div>
        </header>

        <div className="acd-content">
          <div className="acd-filter-section">
            <div className="acd-filter-header">
              <FaFilter className="acd-filter-icon" />
              <h3>Filter Pengguna</h3>
            </div>
            <div className="acd-filter-grid">
              <div className="acd-filter-group">
                <label className="acd-filter-label">Sekolah</label>
                <select
                  className="acd-filter-select"
                  value={selectedSekolah}
                  onChange={(e) => setSelectedSekolah(e.target.value)}
                >
                  {sekolahOptions.map((sekolah, index) => (
                    <option key={index} value={sekolah}>{sekolah}</option>
                  ))}
                </select>
              </div>

              <div className="acd-filter-group">
                <label className="acd-filter-label">Status</label>
                <select
                  className="acd-filter-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statusOptions.map((status, index) => (
                    <option key={index} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="acd-filter-group">
                <label className="acd-filter-label">Cari User/Sekolah</label>
                <div className="acd-search-container">
                  <FaSearch className="acd-search-icon" />
                  <input
                    type="text"
                    className="acd-search-input"
                    placeholder="Cari nama, username, atau sekolah"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="acd-table-section">
            <div className="acd-table-header">
              <h3>Daftar Pengguna Operator Sekolah</h3>
              <div className="acd-filter-group acd-filter-action-group">
                <button className="acd-primary-btn acd-add-operator-btn" onClick={handleTambahPengguna}>
                  <FaPlus className="acd-add-icon" />
                  <span className="acd-btn-text">Tambah Pengguna</span>
                  <div className="acd-btn-shine"></div>
                </button>
              </div>
            </div>

            <div className="acd-table-container">
              <table className="acd-performance-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Username</th>
                    <th>Sekolah</th>
                    <th>Terakhir Login</th>
                    <th>Status</th>
                    <th className="acd-text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPengguna.map((pengguna, index) => (
                    <tr key={pengguna.id}>
                      <td>{index + 1}</td>
                      <td>{pengguna.nama}</td>
                      <td>{pengguna.username}</td>
                      <td>{pengguna.sekolah}</td>
                      <td>{pengguna.lastLogin}</td>
                      <td>
                        <span className={`acd-status-badge ${pengguna.status === 'Aktif' ? 'acd-status-aktif' : 'acd-status-nonaktif'}`}>
                          {pengguna.status}
                        </span>
                      </td>
                      <td className="acd-text-center">
                        <div className="acd-actions-cell">
                          <button
                            className="acd-action-btn acd-edit-btn"
                            onClick={() => handleEditUser(pengguna.id)}
                          >
                            <FaEdit className="acd-btn-icon" />
                            <span>Edit</span>
                          </button>
                          {pengguna.role !== "admin" && (
  <button
    className={`acd-action-btn ${pengguna.status === 'Aktif' ? 'acd-nonaktif-btn' : 'acd-aktif-btn'}`}
    onClick={() => handleToggleStatus(pengguna.id)}
  >
    {pengguna.status === 'Aktif' ? 'NonAktifkan' : 'Aktifkan'}
  </button>
)}

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPengguna.length === 0 && (
                <div className="acd-empty-state">
                  <div className="acd-empty-icon">🔍</div>
                  <h4>Data tidak ditemukan</h4>
                  <p>Coba ubah filter pencarian Anda</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ManajemenPengguna;
