import React, { useState, useEffect } from 'react';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SidebarAdminCabdin from '../Sidebar/SidebarA';
import axios from 'axios';
import './TambahSekolah.css';
import api from '../../../services/api';


export default function TambahSekolah() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    namaSekolah: 'SMK',
    jenjang: 'SMK',
    alamatSekolah: '',
    namaKepalaSekolah: '',
    akreditasi: 'A',
    npsn: ''
  });

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

  const handleInputChange = (e) => {
  const { name, value } = e.target;

  setFormData(prev => {
    // Kalau yang diubah adalah jenjang (SMA / SMK / SLB)
    if (name === 'jenjang') {
      // Ambil sisa nama sekolah tanpa prefix sebelumnya
      let currentName = prev.namaSekolah;

      // Hilangkan prefix lama (SMK, SMA, SLB) di depan
      currentName = currentName
        .replace(/^SMK\s*/i, '')
        .replace(/^SMA\s*/i, '')
        .replace(/^SLB\s*/i, '');

      // Tambahkan prefix baru sesuai jenjang terpilih
      return {
        ...prev,
        jenjang: value,
        namaSekolah: `${value} ${currentName.trim()}`
      };
    }

    // Default: update field biasa
    return {
      ...prev,
      [name]: value
    };
  });
};

  // 🔹 Ganti ini sesuai endpoint Laravel kamu
  // const API_URL = 'https://testweb2025.host.adellya.my.id/kepegawaian-api/public/api/sekolah';

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    await api.post('/sekolah', {
      namaSekolah: formData.namaSekolah,
      jenjang: formData.jenjang,
      alamatSekolah: formData.alamatSekolah,
      kepalaSekolahNip: formData.namaKepalaSekolah,
      akreditasi: formData.akreditasi,
      npsn: formData.npsn
    });

    setShowSuccessModal(true);
  } catch (error) {
    console.error('❌ Gagal menyimpan data sekolah:', error);
    alert('Terjadi kesalahan saat menyimpan data sekolah.');
  }
};


  const handleCancel = () => {
    setShowConfirmModal(true);
  };

  const handleSuccessConfirm = () => {
  setShowSuccessModal(false);

  // kalau mau reset form (opsional)
  setFormData({
    namaSekolah: 'SMK',
    jenjang: 'SMK',
    alamatSekolah: '',
    namaKepalaSekolah: '',
    akreditasi: 'A',
    npsn: ''
  });

};

  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
    navigate(-1);
  };

  const handleCancelDismiss = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className="ts-app">
      <SidebarAdminCabdin collapsed={collapsed} onToggle={handleToggleSidebar} />

      {isMobile && !collapsed && (
        <div className="ts-sidebar-overlay" onClick={() => setCollapsed(true)} />
      )}

      <main className={`ts-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="ts-header">
          <div className="ts-header-left">
            <div className="ts-title-section">
              <h1>Tambah Sekolah Baru</h1>
              <div className="ts-subtitle">Cabang Dinas Pendidikan Wilayah VII</div>
            </div>
          </div>
        </header>

        <div className="ts-content">
          <div className="ts-form-container">
            <div className="ts-form-section">
              <form className="ts-form" onSubmit={handleSubmit}>
                <div className="ts-form-grid">

                  {/* Nama Sekolah */}
                  <div className="ts-form-card">
                    <div className="ts-form-card-header"><h3>Nama Sekolah</h3></div>
                    <div className="ts-form-group">
                      <input
                        type="text"
                        id="namaSekolah"
                        name="namaSekolah"
                        value={formData.namaSekolah}
                        onChange={handleInputChange}
                        className="ts-form-input"
                        placeholder="Masukkan nama sekolah lengkap"
                      />
                    </div>
                  </div>

                  {/* Jenjang */}
                  <div className="ts-form-card">
                    <div className="ts-form-card-header"><h3>Jenjang Pendidikan</h3></div>
                    <div className="ts-form-group">
                      <select
                        id="jenjang"
                        name="jenjang"
                        value={formData.jenjang}
                        onChange={handleInputChange}
                        className="ts-form-select"
                      >
                        <option value="SMK">Sekolah Menengah Kejuruan (SMK)</option>
                        <option value="SMA">Sekolah Menengah Atas (SMA)</option>
                        <option value="SLB">Sekolah Luar Biasa (SLB)</option>
                      </select>
                    </div>
                  </div>

                  {/* Alamat */}
                  <div className="ts-form-card ts-full-width">
                    <div className="ts-form-card-header"><h3>Alamat Sekolah</h3></div>
                    <div className="ts-form-group">
                      <textarea
                        id="alamatSekolah"
                        name="alamatSekolah"
                        value={formData.alamatSekolah}
                        onChange={handleInputChange}
                        className="ts-form-textarea"
                        placeholder="Masukkan alamat lengkap sekolah termasuk kecamatan, kota, dan provinsi"
                        rows="4"
                      />
                    </div>
                  </div>


                  {/* Akreditasi */}
                  <div className="ts-form-card">
                    <div className="ts-form-card-header"><h3>Status Akreditasi</h3></div>
                    <div className="ts-form-group">
                      <select
                        id="akreditasi"
                        name="akreditasi"
                        value={formData.akreditasi}
                        onChange={handleInputChange}
                        className="ts-form-select"
                      >
                        <option value="A">A - Sangat Baik</option>
                        <option value="B">B - Baik</option>
                        <option value="C">C - Cukup</option>
                        <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                      </select>
                    </div>
                  </div>

                  {/* NPSN */}
                  <div className="ts-form-card">
                    <div className="ts-form-card-header"><h3>Nomor Pokok Sekolah Nasional</h3></div>
                    <div className="ts-form-group">
                      <input
                        type="text"
                        id="npsn"
                        name="npsn"
                        value={formData.npsn}
                        onChange={handleInputChange}
                        className="ts-form-input"
                        placeholder="Masukkan 8 digit NPSN"
                        maxLength="8"
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="ts-form-actions">
                  <button type="button" className="ts-cancel-btn ts-form-cancel-btn" onClick={handleCancel}>
                    <FaArrowLeft className="ts-cancel-icon" /> Batalkan
                  </button>
                  <button type="submit" className="ts-save-btn ts-form-save-btn">
                    <FaSave className="ts-save-icon" /> Simpan Data Sekolah
                  </button>
                </div>
              </form>
            </div>

            {/* Tips */}
            <div className="ts-quick-tips">
              <div className="ts-tips-header"><h4>Tips Pengisian Data</h4></div>
              <div className="ts-tips-content">
                <div className="ts-tip-item"><div className="ts-tip-bullet">1</div><span>Pastikan semua data diisi dengan benar sesuai dokumen resmi</span></div>
                <div className="ts-tip-item"><div className="ts-tip-bullet">2</div><span>NPSN harus berupa 8 digit angka yang valid</span></div>
                <div className="ts-tip-item"><div className="ts-tip-bullet">3</div><span>Alamat sekolah harus lengkap hingga tingkat kecamatan</span></div>
              </div>

              {/* Custom Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-container success-modal">
            <div className="modal-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="modal-content">
              <h3>Berhasil!</h3>
              <p>Data sekolah berhasil disimpan. Form telah direset untuk input data baru.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-modal-primary" 
                onClick={handleSuccessConfirm}
              >
                Oke
              </button>
            </div>
          </div>
        </div>
      )}
              {/* Custom Confirm Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-container confirm-modal">
            <div className="modal-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="modal-content">
              <h3>Konfirmasi Pembatalan</h3>
              <p>Batalkan tambah sekolah? Data yang sudah diisi akan hilang.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-modal-secondary" 
                onClick={handleCancelDismiss}
              >
                Lanjutkan
              </button>
              <button 
                className="btn-modal-primary" 
                onClick={handleConfirmCancel}
              >
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
