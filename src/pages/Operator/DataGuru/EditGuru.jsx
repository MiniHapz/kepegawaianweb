// src/pages/Operator/EditGuru/EditGuru.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTimes, FaCheckCircle } from 'react-icons/fa';
import Sidebar from '../Sidebar/Sidebar';
import './EditGuru.css';
import api from '../../../services/api';

export default function EditGuru() {
  const { nip } = useParams();
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapelOptions, setMapelOptions] = useState([]);
  const [selectedMapelIds, setSelectedMapelIds] = useState([]);

  const statusOptions = [
    { label: 'PNS', value: 'pns' },
    { label: 'PPPK', value: 'p3k' },
    { label: 'P3K Paruh Waktu', value: 'p3k_paruh_waktu' }
  ];

  // ===== Ambil data guru + daftar mapel =====
  useEffect(() => {
  const fetchGuru = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/guru/${nip}`);
      const guru = res.data.data || res.data;

      const formatDate = (dateStr) =>
  dateStr ? dateStr.substring(0, 10) : '';

guru.tanggal_lahir = formatDate(guru.tanggal_lahir);
guru.tanggal_bergabung = formatDate(guru.tanggal_bergabung);
guru.tanggal_pensiun = formatDate(guru.tanggal_pensiun);


      setFormData(guru);
      setSelectedMapelIds(guru.mapel?.map(m => m.id) || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data guru');
    } finally {
      setLoading(false);
    }
  };

  const fetchMapelOptions = async () => {
    try {
      const res = await api.get('/mapel');
      setMapelOptions(res.data.data || []);
    } catch (err) {
      console.error('Gagal ambil mapel:', err);
      setMapelOptions([]);
    }
  };

  fetchGuru();
  fetchMapelOptions();
}, [nip]);


  const handleBack = () => navigate('/operator/dataguru');

  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

  const handleMapelChange = (e) => {
    const { value, checked } = e.target;
    const id = parseInt(value);
    if (checked) setSelectedMapelIds(prev => [...prev, id]);
    else setSelectedMapelIds(prev => prev.filter(m => m !== id));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      ...formData,
      mapel_id: selectedMapelIds
    };

    await api.put(`/guru/${nip}`, payload);

    setModalContent({
      title: 'Berhasil',
      message: 'Data guru berhasil diperbarui!'
    });
    setShowModal(true);
  } catch (err) {
    setModalContent({
      title: 'Gagal',
      message: err.response?.data?.message || 'Gagal menyimpan data'
    });
    setShowModal(true);
  }
};

const handleModalClose = () => {
  setShowModal(false);
  if (modalContent.title === 'Berhasil') {
    navigate('/operator/dataguru');
  }
};



  return (
    <div className="edit-guru-app">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <main className={`edit-guru-main`}>
        {loading && (
          <div className="loading-main">
            <div className="spinner"></div>
          </div>
        )}

        {!loading && error && <div className="error">{error}</div>}
        {!loading && !formData && !error && (
          <div className="error">Data guru tidak ditemukan</div>
        )}

        {!loading && formData && (
          <>
            <header className="edit-guru-header">
              <div className="edit-guru-header-left">
                <button className="edit-guru-back-btn" onClick={handleBack}>
                  <FaArrowLeft /> <span>Kembali ke Data Guru</span>
                </button>
                <div className="edit-guru-title-section">
                  <h1>Edit Data Guru</h1>
                  <div className="edit-guru-subtitle">
                    {formData.sekolah?.nama_sekolah || '--'}
                  </div>
                </div>
              </div>

              <div className="edit-guru-header-actions">
                <button className="btn-primary" onClick={handleSubmit}>
                  <FaSave /> Simpan Perubahan
                </button>
              </div>
            </header>

            <form className="edit-guru-content" onSubmit={handleSubmit}>
              {/* === INFORMASI PRIBADI === */}
              <section className="edit-guru-section">
                <h2>Informasi Pribadi</h2>
                <div className="edit-guru-grid">
                  <div className="edit-guru-field">
                    <label>Nama Lengkap *</label>
                    <input
                      type="text"
                      name="nama_lengkap"
                      value={formData.nama_lengkap || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="edit-guru-field">
                    <label>NIP *</label>
                    <input
                      type="text"
                      name="nip"
                      value={formData.nip || ''}
                      onChange={handleChange}
                      required
                      readOnly
                    />
                  </div>
                  <div className="edit-guru-field">
                    <label>Jenis Kelamin *</label>
                    <select
                      name="jenis_kelamin"
                      value={formData.jenis_kelamin || ''}
                      onChange={handleChange}
                      required
                      disabled
                    >
                      <option value="">-- Pilih Jenis Kelamin --</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div className="edit-guru-field">
                    <label>Tempat Lahir *</label>
                    <input
                      type="text"
                      name="tempat_lahir"
                      value={formData.tempat_lahir || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="edit-guru-field">
                    <label>Tanggal Lahir *</label>
                    <input
                      type="date"
                      name="tanggal_lahir"
                      value={formData.tanggal_lahir || ''}
                      onChange={handleChange}
                      required
                      readOnly
                    />
                    
                  </div>
                  <div className="edit-guru-field">
                    <label>Alamat *</label>
                    <textarea
                      name="alamat"
                      value={formData.alamat || ''}
                      onChange={handleChange}
                      rows="3"
                      required
                    />
                  </div>
                  <div className="edit-guru-field">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="edit-guru-field">
                    <label>Telepon *</label>
                    <input
                      type="tel"
                      name="telepon"
                      value={formData.telepon || ""}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/\D/g, "");
                        handleChange({ target: { name: "telepon", value: onlyNumbers } });
                      }}
                      required
                    />
                  </div>
                </div>
              </section>

              {/* === INFORMASI KEPEGAWAIAN === */}
              <section className="edit-guru-section">
                <h2>Informasi Kepegawaian</h2>
                <div className="edit-guru-grid">
                  <div className="edit-guru-field">
                    <label>Status Kepegawaian *</label>
                    <select
                      name="status_kepegawaian"
                      value={formData.status_kepegawaian || ''}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Pilih Status --</option>
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="edit-guru-field">
                    <label>Jabatan *</label>
                    <input
                      type="text"
                      name="jabatan"
                      value={formData.jabatan || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="edit-guru-field">
                    <label>Pendidikan Terakhir *</label>
                    <select
                      name="pendidikan_terakhir"
                      value={formData.pendidikan_terakhir || ''}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Pilih Pendidikan --</option>
                      <option value="SMA/Sederajat">SMA/Sederajat</option>
                      <option value="D3">D3</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                    </select>
                  </div>
                  <div className="edit-guru-field">
                    <label>Tanggal Bergabung *</label>
                    <input
                      type="date"
                      name="tanggal_bergabung"
                      value={formData.tanggal_bergabung || ''}
                      onChange={handleChange}
                      required
                      readOnly
                    />
                  </div>
                  <div className="edit-guru-field">
                    <label>Tanggal Pensiun</label>
                    <input
                      type="date"
                      name="tanggal_pensiun"
                      value={formData.tanggal_pensiun || ''}
                      readOnly
                    />
                  </div>
                </div>
              </section>

              {/* === MATA PELAJARAN === */}
              <section className="edit-guru-section">
                <h2>Mata Pelajaran yang Diampu</h2>
                <div className="edit-guru-mapel-grid">
                  {mapelOptions.map((m) => (
                    <label key={m.id} className="edit-guru-checkbox">
                      <input
                        type="checkbox"
                        value={m.id}
                        checked={selectedMapelIds.includes(m.id)}
                        onChange={handleMapelChange}
                      />
                      <span className="checkmark"></span>
                      {m.nama_mapel || m.nama}
                    </label>
                  ))}
                </div>
              </section>

              <div className="edit-guru-field" style={{ marginTop: "1rem" }}>
                <label>Jam Mengajar per Minggu *</label>
                <input
                  type="number"
                  name="jam_mengajar_per_minggu"
                  value={formData.jam_mengajar_per_minggu || ''}
                  onChange={handleChange}
                  placeholder="Masukkan jumlah jam mengajar per minggu"
                  min={0}
                  max={40}
                  required
                />
              </div>
            </form>
          </>
        )}
      </main>
      {showModal && (
  <div className="modal-overlay">
    <div className={`modal-container ${modalContent.title === 'Berhasil' ? 'success-modal' : 'info-modal'}`}>
     
      <div className="modal-icon">
        {modalContent.title === 'Berhasil' ? <FaCheckCircle /> : <FaTimes />}
      </div>
      <div className="modal-content">
        <h3>{modalContent.title}</h3>
        <p>{modalContent.message}</p>
      </div>
      <div className="modal-actions">
        <button className="btn-modal-primary" onClick={handleModalClose}>
          {modalContent.title === 'Berhasil' ? 'Oke' : 'Tutup'}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
