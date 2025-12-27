import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Sidebar/SidebarA";
// import axios from "axios";
import "./EditPengguna.css";
import api from "../../../services/api";

export default function EditPengguna() {
  const navigate = useNavigate();
  const { userId } = useParams(); // ✅ ambil ID dari URL
  const [collapsed, setCollapsed] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [sekolahOptions, setSekolahOptions] = useState([]);
  const [form, setForm] = useState({
    nama_lengkap: "",
    username: "",
    password: "",
    sekolah_id: "",
    status: "aktif",
  });

  // ✅ Ambil data sekolah dari backend
  useEffect(() => {
    const fetchSekolah = async () => {
      try {
        const res = await api.get("/sekolah");
setSekolahOptions(res.data.data || res.data);
      } catch (err) {
        console.error("Gagal memuat data sekolah:", err);
      }
    };
    fetchSekolah();
  }, []);

  // ✅ Ambil data pengguna dari backend
useEffect(() => {
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/users/${userId}`);

const user = res.data.data;

setForm({
  nama_lengkap: user.name || "",
  username: user.username || "",
  password: "",
  sekolah_id: user.sekolah_id || "",
  status: user.status === "Aktif" ? "aktif" : "tidak-aktif",
});
    } catch (err) {
      console.error("Gagal memuat data pengguna:", err);
      setMessage("Gagal memuat data pengguna");
    }
  };
  fetchUser();
}, [userId]);

  // ✅ Handle perubahan input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ✅ Handle submit update
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");

    const payload = {
      name: form.nama_lengkap,
      username: form.username,
      sekolah_id: form.sekolah_id || null,
      status: form.status === "aktif" ? "Aktif" : "NonAktif",
      password: form.password || undefined,
      role: "user", // ✅ tambahkan ini biar lolos validasi backend
    };

    await api.put(`/users/${userId}`, payload);
setShowSuccessModal(true);


    setShowSuccessModal(true);
  } catch (err) {
    console.error("Gagal update data:", err.response?.data || err);
    setMessage(
      err.response?.data?.message || "Gagal menyimpan perubahan pengguna"
    );
  }
};

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigate("/admin-cabdin/manajemen-pengguna");
  };

  const handleCancel = () => setShowConfirmModal(true);
  const handleConfirmCancel = () => {
    setShowConfirmModal(false);
    navigate("/admin-cabdin/manajemen-pengguna");
  };

  const handleCancelDismiss = () => setShowConfirmModal(false);
  const handleToggleSidebar = () => setCollapsed((prev) => !prev);

  return (
    <div className="edit-pengguna-app">
      <Sidebar collapsed={collapsed} onToggle={handleToggleSidebar} />

      <main className="edit-pengguna-main">
        <header className="edit-pengguna-header">
          <div className="edit-pengguna-header-left">
            <button
              className="edit-pengguna-back-btn"
              onClick={() => navigate("/admin-cabdin/manajemen-pengguna")}
            >
              <i className="fas fa-arrow-left"></i>
              Kembali
            </button>
            <div className="edit-pengguna-title-section">
              <h1>Edit Pengguna</h1>
              <div className="edit-pengguna-subtitle">
                {form.nama_lengkap || "Memuat data..."}
              </div>
            </div>
          </div>
        </header>

        <div className="edit-pengguna-content-full">
          {message && (
            <div className="edit-pengguna-message">
              <i className="fas fa-exclamation-circle"></i>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="edit-pengguna-form-vertical">
            {/* === Data Pengguna === */}
            <div className="edit-pengguna-section-full">
              <h2>Data Pengguna</h2>

              <div className="form-field-full">
                <label>Nama Lengkap<span className="required">*</span></label>
                <input
                  type="text"
                  name="nama_lengkap"
                  value={form.nama_lengkap}
                  onChange={handleChange}
                  required
                  className="form-input-full"
                />
              </div>

              <div className="form-field-full">
                <label>Username<span className="required">*</span></label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="form-input-full"
                  autoComplete="username"
                />
              </div>

              <div className="form-field-full">
                <label>Password</label>
                <div className="field-description-full">
                  Kosongkan jika tidak ingin mengubah password
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  minLength="8"
                  className="form-input-full"
                  placeholder="Masukkan password baru"
                  autoComplete="new-password"
                />
              </div>

              <div className="form-field-full">
                <label>Sekolah</label>
                <select
                  name="sekolah_id"
                  value={form.sekolah_id}
                  onChange={handleChange}
                  className="form-select-full"
                >
                  <option value="">-- Pilih Sekolah --</option>
                  {sekolahOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama_sekolah}
                    </option>
                  ))}
                </select>
              </div>

<div className="form-field-full">
  <label className="form-label-full">
    Status<span className="required">*</span>
  </label>

  <div className="status-options">
    {["aktif", "tidak-aktif"].map((val) => (
      <label
        key={val}
        className={`status-option ${form.status === val ? "active" : ""}`}
        onClick={() => setForm({ ...form, status: val })}
      >
        <input
          type="radio"
          name="status"
          value={val}
          checked={form.status === val}
          readOnly
        />
        <span className="radio-custom"></span>
        {val === "aktif" ? "Aktif" : "Tidak Aktif"}
      </label>
    ))}
  </div>
</div>

</div>

            
            <div className="form-divider-full"></div>

            <div className="form-actions-full">
              <button type="button" className="btn-cancel-full" onClick={handleCancel}>
                Batal
              </button>
              <button type="submit" className="btn-save-full">
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* === Modal Sukses === */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-container success-modal">
            <div className="modal-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="modal-content">
              <h3>Berhasil!</h3>
              <p>Data pengguna berhasil diperbarui.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-primary" onClick={handleSuccessConfirm}>
                Oke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === Modal Konfirmasi Batal === */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-container confirm-modal">
            <div className="modal-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="modal-content">
              <h3>Batalkan Edit?</h3>
              <p>Perubahan yang sudah dilakukan akan hilang.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-secondary" onClick={handleCancelDismiss}>
                Lanjutkan Edit
              </button>
              <button className="btn-modal-primary" onClick={handleConfirmCancel}>
                Ya, Batalkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
