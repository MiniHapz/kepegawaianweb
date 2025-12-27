import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
// import axios from "axios";
import { FaTimes, FaCheckCircle, FaExclamationCircle, FaExclamationTriangle } from "react-icons/fa";
import "./TambahGuru.css";
import api from "../../../services/api";


export default function TambahGuru() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [namaSekolah, setNamaSekolah] = useState("");
  const [message, setMessage] = useState("");
  const [mapelOptions, setMapelOptions] = useState([]);
  const [isManualNIP, setIsManualNIP] = useState(false);
  const [loading, setLoading] = useState(true); // ✅ Tambah loading state
  
  // State untuk alert modal
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertContent, setAlertContent] = useState({ 
    title: '', 
    message: '', 
    type: '' 
  });

  const [form, setForm] = useState({
    nip: "",
    nama_lengkap: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    jenis_kelamin: "",
    status_kepegawaian: "",
    jabatan: "",
    pendidikan_terakhir: "",
    telepon: "",
    alamat: "",
    tanggal_bergabung: "",
    tanggal_pensiun: "",
    mapel_id: [],
    jam_mengajar_per_minggu: "",
  });

  // Fungsi untuk menampilkan alert
  const showAlert = (title, message, type = "success") => {
    setAlertContent({ title, message, type });
    setShowAlertModal(true);
  };

  // Fungsi untuk menutup alert
  const closeAlert = () => {
    setShowAlertModal(false);
    setAlertContent({ title: '', message: '', type: '' });
  };

  useEffect(() => {
  const fetchMapel = async () => {
    try {
      setLoading(true);
      const res = await api.get("/mapel");

      const options = res.data.data?.map(m => ({
        id: m.id,
        nama_mapel: m.nama_mapel
      })) || [];

      setMapelOptions(options);
    } catch (err) {
      console.error("Gagal ambil mapel:", err);
      showAlert("Error", "Gagal mengambil data mata pelajaran", "error");
    } finally {
      setLoading(false);
    }
  };

  fetchMapel();
}, []);


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setNamaSekolah(user?.sekolah?.nama_sekolah || "SDN 01 Contoh Jakarta");
      } catch {
        setNamaSekolah("SDN 01 Contoh Jakarta");
      }
    } else {
      setNamaSekolah("SDN 01 Contoh Jakarta");
    }
  }, []);

  useEffect(() => {
    if (form.tanggal_lahir) {
      const lahir = new Date(form.tanggal_lahir);
      lahir.setFullYear(lahir.getFullYear() + 60);
      lahir.setMonth(lahir.getMonth() + 1);

      setForm(prev => ({
        ...prev,
        tanggal_pensiun: lahir.toISOString().split("T")[0]
      }));
    }
  }, [form.tanggal_lahir]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "nip") {
      setForm(prev => ({ ...prev, nip: value }));
      if (value.trim() === "") {
        setIsManualNIP(false);
      } else {
        setIsManualNIP(true);
      }
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (mapelId) => {
    setForm(prev => {
      const mapel_id = prev.mapel_id.includes(mapelId)
        ? prev.mapel_id.filter(id => id !== mapelId)
        : [...prev.mapel_id, mapelId];
      return { ...prev, mapel_id };
    });
  };

  useEffect(() => {
    if (!isManualNIP) {
      const newNIP = generateNIP(form.tanggal_lahir, form.tanggal_bergabung, form.jenis_kelamin);
      setForm(prev => ({ ...prev, nip: newNIP }));
    }
  }, [form.tanggal_lahir, form.tanggal_bergabung, form.jenis_kelamin, isManualNIP]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = {
      ...form,
      mapel_id: form.mapel_id,
      jam_mengajar_per_minggu: form.jam_mengajar_per_minggu || 0
    };

    await api.post("/guru", payload);

    showAlert("Berhasil!", "Data guru berhasil ditambahkan", "success");

    setTimeout(() => {
      navigate("/operator/dataguru");
    }, 1500);

  } catch (err) {
    console.error(err);
    const errorMessage =
      err.response?.data?.message || "Terjadi kesalahan saat menambah guru.";
    showAlert("Error", errorMessage, "error");
  }
};


  const generateNIP = (tanggalLahir, tanggalBergabung, jenisKelamin) => {
    let part1 = "00000000";
    if (tanggalLahir) {
      const lahir = new Date(tanggalLahir);
      const yyyy = lahir.getFullYear().toString().padStart(4,"0");
      const mm = (lahir.getMonth()+1).toString().padStart(2,"0");
      const dd = lahir.getDate().toString().padStart(2,"0");
      part1 = `${yyyy}${mm}${dd}`;
    }

    let part2 = "000000";
    if (tanggalBergabung) {
      const gabung = new Date(tanggalBergabung);
      const yyyy = gabung.getFullYear().toString().padStart(4,"0");
      const mm = (gabung.getMonth()+1).toString().padStart(2,"0");
      part2 = `${yyyy}${mm}`;
    }

    let part3 = "0";
    if (jenisKelamin === "L") part3 = "1";
    else if (jenisKelamin === "P") part3 = "2";

    return part1 + part2 + part3;
  };

  const handleCancel = () => {
    showAlert(
      "Konfirmasi Pembatalan", 
      "Batalkan tambah guru? Data yang sudah diisi akan hilang.", 
      "warning"
    );
  };

  // Fungsi untuk konfirmasi batal
  const confirmCancel = () => {
    closeAlert();
    navigate("/operator/dataguru");
  };

  const handleToggleSidebar = () => setCollapsed(prev => !prev);

  return (
    <div className="tambah-guru-app">
      <Sidebar collapsed={collapsed} onToggle={handleToggleSidebar} />

      <main className="tambah-guru-main">
        {/* Spinner hanya di main content */}
        {loading && (
          <div className="loading-main">
            <div className="spinner"></div>
          </div>
        )}

        {!loading && (
          <>
            <header className="tambah-guru-header">
              <div className="tambah-guru-header-left">
                <button className="tambah-guru-back-btn" onClick={() => navigate(-1)}>
                  <i className="fas fa-arrow-left"></i> Kembali
                </button>
                <div className="tambah-guru-title-section">
                  <h1>Tambah Guru Baru</h1>
                  <div className="tambah-guru-subtitle">{namaSekolah}</div>
                </div>
              </div>
            </header>

            <div className="tambah-guru-content">
              {message && (
                <div className="tambah-guru-message">
                  <i className="fas fa-exclamation-circle"></i> {message}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Section 1: Data Pribadi */}
                <div className="tambah-guru-section">
                  <h2>Data Pribadi</h2>
                  <div className="tambah-guru-grid">
                    <div className="tambah-guru-field">
                      <label>NIP *</label>
                      <input
                        type="text"
                        name="nip"
                        value={form.nip}
                        onChange={(e) => {
                          const onlyNumbers = e.target.value.replace(/\D/g, "");
                          handleChange({ target: { name: "nip", value: onlyNumbers } });
                        }}
                        required
                        pattern="\d{18}"
                        title="NIP harus 18 digit angka"
                        placeholder="Masukkan 18 digit NIP"
                      />
                    </div>

                    <div className="tambah-guru-field">
                      <label>Nama Lengkap *</label>
                      <input
                        type="text"
                        name="nama_lengkap"
                        value={form.nama_lengkap}
                        onChange={handleChange}
                        required
                        placeholder="Masukkan nama lengkap guru"
                      />
                    </div>

                    <div className="tambah-guru-field">
                      <label>Tempat Lahir *</label>
                      <input
                        type="text"
                        name="tempat_lahir"
                        value={form.tempat_lahir}
                        onChange={handleChange}
                        placeholder="Kota tempat lahir"
                        required
                      />
                    </div>

                    <div className="tambah-guru-field">
                      <label>Tanggal Lahir *</label>
                      <input
                        type="date"
                        name="tanggal_lahir"
                        value={form.tanggal_lahir}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="tambah-guru-field">
                      <label>Jenis Kelamin *</label>
                      <select
                        name="jenis_kelamin"
                        value={form.jenis_kelamin}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Pilih Jenis Kelamin --</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>

                    <div className="tambah-guru-field">
                      <label>Telepon *</label>
                      <input
                        name="telepon"
                        value={form.telepon}
                        onChange={(e) => {
                          const onlyNumbers = e.target.value.replace(/\D/g, "");
                          handleChange({ target: { name: "telepon", value: onlyNumbers } });
                        }}
                        required
                        placeholder="Nomor telepon aktif"
                      />
                    </div>
                    
                    <div className="tambah-guru-field">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email || ""}
                        onChange={handleChange}
                        required
                        placeholder="-"
                      />
                    </div>

                    <div className="tambah-guru-field" style={{gridColumn: "1 / -1"}}>
                      <label>Alamat Lengkap *</label>
                      <textarea
                        name="alamat"
                        value={form.alamat}
                        onChange={handleChange}
                        placeholder="Alamat tempat tinggal lengkap"
                        rows="3"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Data Profesional */}
                <div className="tambah-guru-section">
                  <h2>Data Profesional</h2>
                  <div className="tambah-guru-grid">
                    <div className="tambah-guru-field">
                      <label>Status Kepegawaian *</label>
                      <select
                        name="status_kepegawaian"
                        value={form.status_kepegawaian}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Pilih Status --</option>
                        <option value="pns">PNS</option>
                        <option value="p3k">PPPK</option>
                        <option value="p3k_paruh_waktu">PPPK Paruh Waktu</option>
                      </select>
                    </div>

                    <div className="tambah-guru-field">
                      <label>Jabatan</label>
                      <input
                        type="text"
                        name="jabatan"
                        value={form.jabatan || ""}
                        onChange={handleChange}
                        placeholder="Masukkan jabatan guru"
                      />
                    </div>

                    <div className="tambah-guru-field">
                      <label>Pendidikan Terakhir *</label>
                      <select
                        name="pendidikan_terakhir"
                        value={form.pendidikan_terakhir}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Pilih Pendidikan --</option>
                        <option value="S3">S3 (Doktor)</option>
                        <option value="S2">S2 (Magister)</option>
                        <option value="S1">S1 (Sarjana)</option>
                        <option value="D4">D4</option>
                        <option value="D3">D3 (Diploma)</option>
                        <option value="SMA">SMA/Sederajat</option>
                      </select>
                    </div>

                    <div className="tambah-guru-field">
                      <label>Tanggal Bergabung *</label>
                      <input
                        type="date"
                        name="tanggal_bergabung"
                        value={form.tanggal_bergabung}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="tambah-guru-field">
                      <label>Tanggal Pensiun</label>
                      <input
                        type="date"
                        name="tanggal_pensiun"
                        value={form.tanggal_pensiun}
                        readOnly
                        className="readonly"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Mata Pelajaran & Jam Mengajar */}
                <div className="tambah-guru-section">
                  <h2>Mata Pelajaran yang Diampu</h2>
                  <div className="tambah-guru-mapel-grid">
                    {mapelOptions.map((mapel) => (
                      <label key={mapel.id} className="tambah-guru-checkbox">
                        <input
                          type="checkbox"
                          checked={form.mapel_id.includes(mapel.id)}
                          onChange={() => handleCheckboxChange(mapel.id)}
                        />
                        <span className="checkmark"></span>
                        {mapel.nama_mapel}
                      </label>
                    ))}
                  </div>

                  <div className="tambah-guru-field" style={{ marginTop: "1rem" }}>
                    <h2>Jam Mengajar per Minggu</h2>
                    <input
                      type="number"
                      name="jam_mengajar_per_minggu"
                      value={form.jam_mengajar_per_minggu}
                      onChange={handleChange}
                      placeholder="Masukkan jumlah jam mengajar per minggu"
                      min={0}
                      max={40}
                    />
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="tambah-guru-actions">
                  <button type="button" className="btn-ghost" onClick={handleCancel}>
                    <i className="fas fa-times"></i> Batal
                  </button>
                  <button type="submit" className="btn-primary">
                    <i className="fas fa-save"></i> Simpan Data Guru
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </main>

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="tg-modal-overlay">
          <div className={`tg-modal-container ${
            alertContent.type === 'success' ? 'tg-success-modal' : 
            alertContent.type === 'error' ? 'tg-error-modal' : 
            'tg-warning-modal'
          }`}>
            <button className="tg-modal-close" onClick={closeAlert}>
              <FaTimes />
            </button>
            
            <div className="tg-modal-icon">
              {alertContent.type === 'success' && <FaCheckCircle />}
              {alertContent.type === 'error' && <FaExclamationCircle />}
              {alertContent.type === 'warning' && <FaExclamationTriangle />}
            </div>

            <div className="tg-modal-content">
              <h3>{alertContent.title}</h3>
              <p>{alertContent.message}</p>
              
              {alertContent.type === 'warning' && (
                <p className="tg-modal-warning">Tindakan ini tidak dapat dibatalkan</p>
              )}
            </div>

            <div className="tg-modal-actions">
              {alertContent.type === 'warning' ? (
                <>
                  <button className="tg-btn-modal-secondary" onClick={closeAlert}>
                    Batal
                  </button>
                  <button className="tg-btn-modal-danger" onClick={confirmCancel}>
                    Ya, Batalkan
                  </button>
                </>
              ) : (
                <button 
                  className={`tg-btn-modal-primary ${
                    alertContent.type === 'success' ? 'tg-success-btn' : 
                    alertContent.type === 'error' ? 'tg-error-btn' : ''
                  }`} 
                  onClick={closeAlert}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}