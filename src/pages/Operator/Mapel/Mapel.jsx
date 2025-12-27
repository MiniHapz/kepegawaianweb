import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaTimes, FaExclamationCircle, FaCheckCircle, FaBook } from 'react-icons/fa';
import Sidebar from '../Sidebar/Sidebar';
import axios from 'axios';
import './Mapel.css';
import api from '../../../services/api';


export default function Mapel() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [mapelToDelete, setMapelToDelete] = useState(null);
  const [mapelToEdit, setMapelToEdit] = useState(null);
  const [newMapel, setNewMapel] = useState('');
  const [editMapelName, setEditMapelName] = useState('');
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
const [error, setError] = useState(null); // ← state untuk error
  const token = localStorage.getItem('token');

  // const axiosInstance = axios.create({
  //   baseURL: 'https://testweb2025.host.adellya.my.id/kepegawaian-api/public/api',
  //   headers: { Authorization: `Bearer ${token}` },
  // });

  // ===== Fetch Data =====
  useEffect(() => {
    const fetchMapel = async () => {
  try {
    setLoading(true);
    const res = await api.get('/mapel');

    const data = Array.isArray(res.data.data)
      ? res.data.data.map(m => ({
          id: m.id,
          nama: m.nama_mapel,
          jumlahGuru: m.jumlahGuru ?? 0,
        }))
      : [];

    setList(data);
    setError(null);
  } catch (err) {
  console.error(err);
  setError('Gagal mengambil data mata pelajaran');
  showAlert('Error', 'Gagal mengambil data mata pelajaran dari server!');
}
   finally {
    setLoading(false);
  }
};


    const fetchUser = async () => {
  try {
    const res = await api.get('/user');
    setUser(res.data);
  } catch (err) {
    console.error(err);
  }
};


    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) setCollapsed(true);
    };

    checkMobile();
    fetchMapel();
    fetchUser();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ===== Filter Data =====
  const filteredData = Array.isArray(list)
    ? list.filter(mapel => {
        const nama = mapel.nama || '';
        return nama.toLowerCase().includes(query.toLowerCase());
      })
    : [];

  // ===== Alert System =====
  const showAlert = (title, message) => {
    setModalContent({ title, message });
    setShowAlertModal(true);
  };

  const closeAlertModal = () => {
    setShowAlertModal(false);
  };

  // ===== Add Mapel =====
  const handleAddMapel = async () => {
    if (!newMapel.trim()) {
      showAlert('Data Belum Lengkap', 'Nama mata pelajaran tidak boleh kosong');
      return;
    }

    try {
      const res = await api.post('/mapel', {
  nama_mapel: newMapel.trim(),
});
      const mapelBaru = {
        id: res.data.data.id,
        nama: res.data.data.nama_mapel,
        jumlahGuru: 0
      };
      setList(prev => [...prev, mapelBaru]);
      setNewMapel('');
      showAlert('Berhasil', `Mata pelajaran "${mapelBaru.nama}" berhasil ditambahkan`);
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Gagal menambahkan mapel');
    }
  };

  // ===== Edit Mapel =====
  const handleEditClick = (mapel) => {
    setMapelToEdit(mapel);
    setEditMapelName(mapel.nama);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editMapelName.trim()) {
      showAlert('Data Belum Lengkap', 'Nama mata pelajaran tidak boleh kosong');
      return;
    }

    try {
      const res = await api.put(`/mapel/${mapelToEdit.id}`, {
  nama_mapel: editMapelName.trim(),
});


      const updatedName = res.data.data?.nama_mapel || editMapelName.trim();

      setList(prev => prev.map(item =>
        item.id === mapelToEdit.id ? { ...item, nama: updatedName } : item
      ));

      setShowEditModal(false);
      setMapelToEdit(null);
      showAlert('Berhasil', `Mata pelajaran berhasil diubah menjadi "${updatedName}"`);
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Gagal update mapel');
    }
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setMapelToEdit(null);
    setEditMapelName('');
  };

  // ===== Delete Mapel =====
  const handleDeleteClick = (mapel) => {
    setMapelToDelete(mapel);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!mapelToDelete) return;
    
    try {
      await api.delete(`/mapel/${mapelToDelete.id}`);
      setList(prev => prev.filter(item => item.id !== mapelToDelete.id));
      setShowDeleteModal(false);
      setMapelToDelete(null);
      showAlert('Berhasil', `Mata pelajaran "${mapelToDelete.nama}" berhasil dihapus`);
    } catch (err) {
      console.error(err);
      showAlert('Error', 'Gagal menghapus mapel');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setMapelToDelete(null);
  };

  // ===== Sidebar Toggle =====
  const handleToggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  return (
    <div className="mp-app">
      <Sidebar collapsed={collapsed} onToggle={handleToggleSidebar} />
      
      {isMobile && !collapsed && (
        <div className="mp-sidebar-overlay" onClick={() => setCollapsed(true)} />
      )}

      <main className={`mp-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* 🔹 Loading overlay */}
        {loading && (
          <div className="loading-main">
            <div className="spinner"></div>
          </div>
        )}


{!loading && error && <div className="mp-error">{error}</div>}
        
        {!loading && !error && (
          <>
        <header className="mp-header">
          <div className="mp-header-left">
            <div className="mp-title-section">
              <h1>Mata Pelajaran</h1>
              <div className="dd-subtitle">
                {user?.sekolah?.nama_sekolah || 'Memuat...'}
              </div>
            </div>
          </div>

          <div className="mp-header-actions">
            <button className="mp-add-btn" onClick={() => navigate('/operator/data-guru/tambah')}>
              <FaPlus /><span>Tambah Guru</span>
            </button>
          </div>
        </header>

        <div className="mp-content">
          {/* Filters Section */}
          <div className="mp-filters-section">
            <div className="mp-filters-grid">
              <div className="mp-filter-group mp-search-group">
                <label>Cari Mapel</label>
                <div className="mp-search-wrapper">
                  <input
                    type="text"
                    placeholder="Nama mata pelajaran"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        // Trigger search
                      }
                    }}
                  />
                  <button className="mp-search-btn"><FaSearch /></button>
                </div>
              </div>
            </div>
          </div>

          {/* Add Mapel Section */}
          <div className="mp-add-section">
            <h3>Tambah Mapel :</h3>
            <div className="mp-add-form">
              <input
                type="text"
                placeholder="Masukkan nama mata pelajaran"
                value={newMapel}
                onChange={(e) => setNewMapel(e.target.value)}
                className="mp-mapel-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddMapel();
                  }
                }}
              />
              <button className="mp-add-mapel-btn" onClick={handleAddMapel}>
                <FaPlus /><span>Tambah Mapel</span>
              </button>
            </div>
          </div>

          <div className="mp-divider"></div>

          {/* Table Section */}
          <div className="mp-table-section">
            <h3>Daftar Mata Pelajaran</h3>
            <div className="mp-table-container">
              <table className="mp-data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Mata Pelajaran</th>
                    <th>Jumlah Guru</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((mapel, index) => (
                    <tr key={mapel.id}>
                      <td className="mp-number-cell">
                        <span className="mp-number-badge">{index + 1}</span>
                      </td>
                      <td className="mp-name-cell">
                        <div className="mp-mapel-name">
                          <FaBook className="mp-mapel-icon" />
                          {mapel.nama}
                        </div>
                      </td>
                      <td className="mp-guru-cell">
                        <span className="mp-guru-count">{mapel.jumlahGuru}</span>
                      </td>
                      <td className="mp-actions-cell">
                        <button 
                          className="mp-action-btn mp-edit-btn" 
                          onClick={() => handleEditClick(mapel)}
                          title="Edit Mapel"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="mp-action-btn mp-delete-btn" 
                          onClick={() => handleDeleteClick(mapel)}
                          title="Hapus Mapel"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan="4" className="mp-no-data-message">
                        Tidak ada data mata pelajaran ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mp-data-info">
              Menampilkan {filteredData.length} dari {list.length} mata pelajaran
            </div>
          </div>
        </div>
        </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="mp-modal-overlay">
          <div className="mp-modal-container mp-delete-modal">
            <button className="mp-modal-close" onClick={handleDeleteCancel}>
              <FaTimes />
            </button>
            <div className="mp-modal-icon">
              <FaExclamationCircle />
            </div>
            <div className="mp-modal-content">
              <h3>Konfirmasi Hapus</h3>
              <p>Apakah Anda yakin ingin menghapus mata pelajaran <strong>"{mapelToDelete?.nama}"</strong>?</p>
              <p className="mp-modal-warning">Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="mp-modal-actions">
              <button className="mp-btn-modal-secondary" onClick={handleDeleteCancel}>
                Batal
              </button>
              <button className="mp-btn-modal-danger" onClick={handleDeleteConfirm}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="mp-modal-overlay">
          <div className={`mp-modal-container ${modalContent.title === 'Berhasil' ? 'mp-success-modal' : 'mp-info-modal'}`}>
            <button className="mp-modal-close" onClick={closeAlertModal}>
              <FaTimes />
            </button>
            <div className="mp-modal-icon">
              {modalContent.title === 'Berhasil' ? <FaCheckCircle /> : <FaExclamationCircle />}
            </div>
            <div className="mp-modal-content">
              <h3>{modalContent.title}</h3>
              <p>{modalContent.message}</p>
            </div>
            <div className="mp-modal-actions">
              <button className="mp-btn-modal-primary" onClick={closeAlertModal}>
                Oke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="mp-modal-overlay">
          <div className="mp-modal-container mp-edit-modal">
            <button className="mp-modal-close" onClick={handleEditCancel}>
              <FaTimes />
            </button>
            <div className="mp-modal-icon">
              <FaEdit />
            </div>
            <div className="mp-modal-content">
              <h3>Edit Mata Pelajaran</h3>
              <div className="mp-edit-form">
                <label>Nama Mata Pelajaran</label>
                <input
                  type="text"
                  value={editMapelName}
                  onChange={(e) => setEditMapelName(e.target.value)}
                  placeholder="Masukkan nama mata pelajaran"
                  className="mp-edit-input"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleEditSave();
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>
            <div className="mp-modal-actions">
              <button className="mp-btn-modal-secondary" onClick={handleEditCancel}>
                Batal
              </button>
              <button className="mp-btn-modal-primary" onClick={handleEditSave}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}