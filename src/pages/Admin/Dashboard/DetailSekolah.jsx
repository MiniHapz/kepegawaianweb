import React, { useState, useEffect } from 'react';
import './DetailSekolah.css';
import SidebarAdminCabdin from '../Sidebar/SidebarA';
import { useParams } from 'react-router-dom';
// import axios from 'axios';
import api from '../../../services/api';

const DetailSekolah = () => {

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const [collapsed, setCollapsed] = useState(false);
  const [sekolahData, setSekolahData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [statusSekolah, setStatusSekolah] = useState('');
const [saving, setSaving] = useState(false);

  const { id } = useParams(); // kalau pakai route /sekolah/:id
  // const token = localStorage.getItem('token');

  const handleToggleSidebar = () => setCollapsed(prev => !prev);

  const handleStatusChange = (status) => {
  setStatusSekolah(status);
};

const handleSaveStatus = async () => {
  try {
    setSaving(true);

   await api.put(`/sekolah/${id}/status`, {
  status: statusSekolah
});


    setSekolahData(prev => ({
      ...prev,
      status: statusSekolah
    }));

    setShowSuccessModal(true);

  } catch (err) {
    console.error(err);
    setShowErrorModal(true);
  } finally {
    setSaving(false);
  }
};

  useEffect(() => {
    const fetchSekolah = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/sekolah/${id}`);

        setSekolahData(res.data.data);
setStatusSekolah(res.data.data.status); // 🔥 sync awal

      } catch (err) {
        console.error('Gagal ambil data sekolah:', err);
        setError('Gagal memuat data sekolah');
      } finally {
        setLoading(false);
      }
    };

    fetchSekolah();
  }, [id]);

  if (loading) return <div className="loading">Memuat data sekolah...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!sekolahData) return <div className="error">Data sekolah tidak ditemukan</div>;

  return (
    <div className="ts-app">
      <SidebarAdminCabdin collapsed={collapsed} onToggle={handleToggleSidebar} />
      
      <div className={`ts-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="ts-detail-container">
          <div className="ts-detail-header">
            <div className="ts-detail-title-section">
              <div className="ts-detail-title-icon">🏫</div>
              <div>
                <h1>Detail Sekolah</h1>
                <p>Informasi lengkap mengenai data sekolah</p>
              </div>
            </div>
          </div>

          <div className="ts-detail-content">
                        <div className="ts-detail-scrollable">
            <div className="ts-detail-item">
              <div className="ts-detail-label"><span className="icon">🏫</span> Nama Sekolah</div>
              <div className="ts-detail-value">{sekolahData.nama_sekolah}</div>
            </div>

            <div className="ts-detail-item">
              <div className="ts-detail-label"><span className="icon">📚</span> Jenjang Pendidikan</div>
              <div className="ts-detail-value">
                <span className="ts-jenjang-badge">{sekolahData.jenjang}</span>
              </div>
            </div>

            <div className="ts-detail-item">
              <div className="ts-detail-label"><span className="icon">📍</span> Alamat Sekolah</div>
              <div className="ts-detail-value ts-detail-alamat">{sekolahData.alamat}</div>
            </div>

<div className="ts-detail-item">
  <div className="ts-detail-label"><span className="icon">👨‍🏫</span> Nama Kepala Sekolah</div>
  <div className="ts-detail-value">
  {sekolahData.kepala_sekolah 
    ? sekolahData.kepala_sekolah.nama_lengkap 
    : 'Belum ditentukan'}
</div>

</div>

            <div className="ts-detail-item">
              <div className="ts-detail-label"><span className="icon">⭐</span> Akreditasi</div>
              <div className="ts-detail-value">
                <span className="ts-akreditasi-badge">{sekolahData.akreditasi}</span>
              </div>
            </div>

            <div className="ts-detail-item">
              <div className="ts-detail-label"><span className="icon">🔢</span> NPSN</div>
              <div className="ts-detail-value">{sekolahData.npsn}</div>
            </div>
            {/* Status Sekolah */}
<div className="ts-detail-item">
  <div className="ts-detail-label">
    <span className="icon">📊</span>
    Status Sekolah
  </div>

  <div className="ts-detail-value">
    

    {/* Radio Control */}
    <div className="ts-status-radio-group">
      <label className="ts-radio-option">
        <input
          type="radio"
          name="statusSekolah"
          value="aktif"
          checked={statusSekolah === "aktif"}

          onChange={() => handleStatusChange("aktif")}
        />
        <span className="ts-radio-checkmark"></span>
        Aktif
      </label>

      <label className="ts-radio-option">
        <input
          type="radio"
          name="statusSekolah"
          value="nonaktif"
          checked={statusSekolah === "nonaktif"}

          onChange={() => handleStatusChange("nonaktif")}
        />
        <span className="ts-radio-checkmark"></span>
        Tidak Aktif
      </label>
    </div>
  </div>
</div>
<button
  className="ts-save-btn"
  onClick={handleSaveStatus}
  disabled={saving || statusSekolah === sekolahData.status}
>
  {saving ? 'Menyimpan...' : 'Simpan Status'}
</button>


            </div>
          </div>
          {showSuccessModal && (
  <div className="modal-overlay">
    <div className="modal-container success-modal">
      <div className="modal-icon">
        <i className="fas fa-check-circle"></i>
      </div>
      <div className="modal-content">
        <h3>Berhasil!</h3>
        <p>Status sekolah berhasil diperbarui.</p>
      </div>
      <div className="modal-actions">
        <button
          className="btn-modal-primary"
          onClick={() => setShowSuccessModal(false)}
        >
          Oke
        </button>
      </div>
    </div>
  </div>
)}
{showErrorModal && (
  <div className="modal-overlay">
    <div className="modal-container confirm-modal">
      <div className="modal-icon">
        <i className="fas fa-exclamation-triangle"></i>
      </div>
      <div className="modal-content">
        <h3>Gagal</h3>
        <p>Status sekolah gagal diperbarui. Silakan coba lagi.</p>
      </div>
      <div className="modal-actions">
        <button
          className="btn-modal-primary"
          onClick={() => setShowErrorModal(false)}
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
)}


        </div>
      </div>
    </div>
  );
};

export default DetailSekolah;
