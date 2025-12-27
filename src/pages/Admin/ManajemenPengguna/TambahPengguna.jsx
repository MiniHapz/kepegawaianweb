import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/SidebarA";
import "./TambahPengguna.css";
import api from "../../../services/api";

export default function TambahPengguna() {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [namaSekolah, setNamaSekolah] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
const [sekolahOptions, setSekolahOptions] = useState([]);

useEffect(() => {
  const fetchSekolah = async () => {
    try {
      const res = await api.get("/sekolah");

const availableSchools = (res.data.data || [])
  .filter(s => !s.operator);

setSekolahOptions(availableSchools);

      if (res.ok && Array.isArray(data.data)) {
        // ✅ Filter: hanya sekolah yang belum punya operator
        const availableSchools = data.data.filter(s => !s.operator);
        setSekolahOptions(availableSchools);
      } else {
        console.error("Gagal memuat data sekolah:", data.message);
        setSekolahOptions([]);
      }
    } catch (err) {
      console.error("Error saat memuat sekolah:", err);
      setSekolahOptions([]);
    }
  };

  fetchSekolah();
}, []);


  // Pastikan state form benar-benar kosong
  const [form, setForm] = useState({
    nama_lengkap: "",
    username: "",
    password: "",
    sekolah_id: ""
  });

  // Reset form ketika komponen dimount
  useEffect(() => {
    setForm({
      nama_lengkap: "",
      username: "",
      password: "",
      sekolah_id: ""
    });
  }, []);

  // Ambil nama sekolah dari localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user?.sekolah) {
          setNamaSekolah(user.sekolah.nama_sekolah);
        } else {
          setNamaSekolah("SDN 01 Contoh Jakarta");
        }
      } catch (error) {
        setNamaSekolah("SDN 01 Contoh Jakarta");
      }
    } else {
      setNamaSekolah("SDN 01 Contoh Jakarta");
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");

  if (!form.nama_lengkap || !form.username || !form.password || !form.sekolah_id) {
    setMessage("Semua field wajib diisi!");
    return;
  }

  if (form.password.length < 8) {
    setMessage("Password harus minimal 8 karakter!");
    return;
  }

  try {
    await api.post("/register", {
      name: form.nama_lengkap,
      username: form.username,
      password: form.password,
      role: "user",
      sekolah_id: form.sekolah_id
    });

    setShowSuccessModal(true);
  } catch (err) {
    setMessage(
      err.response?.data?.message || 
      "Terjadi kesalahan saat menambah pengguna"
    );
  }
};

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigate("/admin-cabdin/manajemen-pengguna");
  };

  const handleCancel = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
    navigate("/admin-cabdin/manajemen-pengguna");
  };

  const handleCancelDismiss = () => {
    setShowConfirmModal(false);
  };

  const handleToggleSidebar = () => setCollapsed(prev => !prev);

  return (
    <div className="tambah-pengguna-app">
      <Sidebar collapsed={collapsed} onToggle={handleToggleSidebar} />

      <main className="tambah-pengguna-main">
        {/* Header */}
        <header className="tambah-pengguna-header">
          <div className="tambah-pengguna-header-left">
            <button className="tambah-pengguna-back-btn" onClick={() => navigate("/admin-cabdin/manajemen-pengguna")}>
              <i className="fas fa-arrow-left"></i>
              Kembali
            </button>
            <div className="tambah-pengguna-title-section">
              <h1>Tambah Pengguna Baru</h1>
              <div className="tambah-pengguna-subtitle">{namaSekolah}</div>
            </div>
          </div>
        </header>

        <div className="tambah-pengguna-content-full">
          {message && (
            <div className="tambah-pengguna-message">
              <i className="fas fa-exclamation-circle"></i>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="tambah-pengguna-form-vertical">
            {/* Section: Data Pengguna */}
            <div className="tambah-pengguna-section-full">
              <h2>Data Pengguna</h2>
              
              {/* Nama Lengkap */}
              <div className="form-field-full">
                <label className="form-label-full">
                  Nama Lengkap<span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={form.nama_lengkap || ""}
                  onChange={handleChange}
                  required
                  className="form-input-full"
                  placeholder="Masukkan nama lengkap pengguna"
                />
              </div>

              {/* Username */}
              <div className="form-field-full">
                <label className="form-label-full">
                  Username<span className="required">*</span>
                </label>
                <div className="field-description-full">
                  Username akan digunakan untuk login
                </div>
                <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                    className="form-input-full"
                    placeholder="Masukkan username untuk login"
                    autoComplete="new-username"
                />
              </div>

              {/* Password */}
              <div className="form-field-full">
                <label className="form-label-full">
                  Password<span className="required">*</span>
                </label>
                <div className="field-description-full">
                  Minimal 8 karakter
                </div>
                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength="8"
                    className="form-input-full"
                    placeholder="Masukkan password minimal 8 karakter"
                    autoComplete="new-password"
                />
              </div>

              {/* Sekolah */}
              <div className="form-field-full">
                <label className="form-label-full">
                  Sekolah<span className="required">*</span>
                </label>
<select
  name="sekolah_id"
  value={form.sekolah_id || ""}
  onChange={handleChange}
  required
  className="form-select-full"
>
  <option value="">-- Pilih Sekolah --</option>
  {sekolahOptions.length > 0 ? (
    sekolahOptions.map((sekolah) => (
      <option key={sekolah.id} value={sekolah.id}>
        {sekolah.nama_sekolah}
      </option>
    ))
  ) : (
    <option value="" disabled>Tidak ada sekolah tersedia</option>
  )}
</select>

              </div>
            </div>

            {/* Garis Pemisah */}
            <div className="form-divider-full"></div>

            {/* Tombol Aksi */}
            <div className="form-actions-full">
              <button type="button" className="btn-cancel-full" onClick={handleCancel}>
                Batal
              </button>
              <button type="submit" className="btn-save-full">
                Simpan
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Custom Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-container success-modal">
            <div className="modal-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="modal-content">
              <h3>Berhasil!</h3>
              <p>Pengguna berhasil ditambahkan ke sistem.</p>
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
              <p>Batalkan tambah pengguna? Data yang sudah diisi akan hilang.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="btn-modal-secondary" 
                onClick={handleCancelDismiss}
              >
                Lanjutkan Edit
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
  );
}