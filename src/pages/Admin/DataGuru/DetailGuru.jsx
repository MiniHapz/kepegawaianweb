import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SidebarAdminCabdin from "../Sidebar/SidebarA";
import axios from "axios";
import {
  FaPrint, FaEnvelope, FaPhone, FaSchool, FaBook, FaUser, FaCalendarAlt, FaMapMarkerAlt, FaGraduationCap
} from "react-icons/fa";
import "./DetailGuru.css";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import api from "../../../services/api";


export default function DetailGuru() {
  const { nip } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [guru, setGuru] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleGenerateDocx = async () => {
    if (!guru) return;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "BIODATA GURU",
              heading: "Heading1",
              spacing: { after: 400 },
            }),
            new Paragraph(`NIP: ${guru.nip}`),
            new Paragraph(`Nama Lengkap: ${guru.nama_lengkap}`),
            new Paragraph(`Tempat/Tanggal Lahir: ${guru.tempat_lahir}, ${guru.tanggal_lahir?.split("T")[0]}`),
            new Paragraph(`Jenis Kelamin: ${guru.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}`),
            new Paragraph(`Pendidikan Terakhir: ${guru.pendidikan_terakhir}`),
            new Paragraph(`Status Kepegawaian: ${guru.status_kepegawaian}`),
            new Paragraph(`Sekolah: ${guru.sekolah?.nama_sekolah || "-"}`),
            new Paragraph(`Telepon: ${guru.telepon}`),
            new Paragraph(`Email: ${guru.email}`),
            new Paragraph(`Alamat: ${guru.alamat}`),
            new Paragraph(`Tanggal Bergabung: ${guru.tanggal_bergabung?.split("T")[0]}`),
            new Paragraph(`Tanggal Pensiun: ${guru.tanggal_pensiun?.split("T")[0] || "-"}`),
          ],
        },
      ],
    });
    
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Biodata_${guru.nama_guru || "Guru"}.docx`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head><title>Cetak Biodata</title></head>
        <body>
          <h1>BIODATA GURU</h1>
          <p><b>NIP:</b> ${guru.nip}</p>
          <p><b>Nama Lengkap:</b> ${guru.nama_guru}</p>
          <p><b>Tempat/Tanggal Lahir:</b> ${guru.tempat_lahir}, ${formatTanggal(guru.tanggal_lahir)}</p>
          <p><b>Jenis Kelamin:</b> ${guru.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}</p>
          <p><b>Pendidikan Terakhir:</b> ${guru.pendidikan_terakhir}</p>
          <p><b>Status Kepegawaian:</b> ${guru.status_kepegawaian}</p>
          <p><b>Sekolah:</b> ${guru.sekolah?.nama_sekolah || "-"}</p>
          <p><b>Telepon:</b> ${guru.telepon}</p>
          <p><b>Email:</b> ${guru.email}</p>
          <p><b>Alamat:</b> ${guru.alamat}</p>
          <p><b>Tanggal Bergabung:</b> ${formatTanggal(guru.tanggal_bergabung)}</p>
          <p><b>Tanggal Pensiun:</b> ${formatTanggal(guru.tanggal_pensiun)}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleToggleSidebar = () => setCollapsed(prev => !prev);

  
useEffect(() => {
  const fetchGuru = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/guru/${nip}`);

      const dataGuru = response.data.data || response.data;
      if (!dataGuru) throw new Error("Data guru tidak ditemukan.");

      setGuru(dataGuru);

    } catch (err) {
      console.error("Gagal memuat data guru:", err);

      if (err?.response?.status === 404) {
        setError(`Data guru dengan NIP ${nip} tidak ditemukan.`);
      } else if (err?.response?.status === 401) {
        setError("Tidak memiliki akses. Silakan login ulang.");
      } else {
        setError("Terjadi kesalahan saat memuat data guru.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (nip) fetchGuru();
}, [nip]);

const formatTanggal = (tanggal) => {
  if (!tanggal) return "-";

  const date = new Date(tanggal);
  if (isNaN(date)) return "-";

  const hari = date.getDate();
  const bulan = date.toLocaleString("id-ID", { month: "long" });
  const tahun = date.getFullYear();

  return `${hari} ${bulan} ${tahun}`;
};

const hitungMasaPensiun = (tanggalPensiun) => {
  if (!tanggalPensiun) return "-";

  const today = new Date();
  const pensiun = new Date(tanggalPensiun);

  if (isNaN(pensiun)) return "-";

  let tahun = pensiun.getFullYear() - today.getFullYear();
  let bulan = pensiun.getMonth() - today.getMonth();

  if (bulan < 0) {
    tahun--;
    bulan += 12;
  }

  if (tahun < 0) return "Sudah Pensiun";

  if (tahun > 0) {
    return `${tahun} Tahun ${bulan} Bulan`;
  }

  return `${bulan} Bulan`;
};


  // Loading state
  if (loading) {
    return (
      <div className="ts-app">
        <SidebarAdminCabdin collapsed={collapsed} toggleSidebar={handleToggleSidebar} />
        <div className={`ts-main ${collapsed ? "sidebar-collapsed" : ""}`}>
          <div className="loading-main">
            <div className="spinner"></div>
            {/* <p>Memuat data guru...</p> */}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="ts-app">
        <SidebarAdminCabdin collapsed={collapsed} toggleSidebar={handleToggleSidebar} />
        <div className={`ts-main ${collapsed ? "sidebar-collapsed" : ""}`}>
          <div className="ts-error">
            <div className="ts-error-icon">⚠️</div>
            <h3>Terjadi Kesalahan</h3>
            <p>{error}</p>
            <button 
              className="ts-retry-btn" 
              onClick={() => window.location.reload()}
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Data tidak ditemukan
  if (!guru) {
    return (
      <div className="ts-app">
        <SidebarAdminCabdin collapsed={collapsed} toggleSidebar={handleToggleSidebar} />
        <div className={`ts-main ${collapsed ? "sidebar-collapsed" : ""}`}>
          <div className="ts-error">
            <div className="ts-error-icon">🔍</div>
            <h3>Data Tidak Ditemukan</h3>
            <p>Data guru dengan NIP {nip} tidak ditemukan.</p>
          </div>
        </div>
      </div>
    );
  }

  // Konten utama ketika sudah selesai loading dan data tersedia
  return (
    <div className="ts-app">
      <SidebarAdminCabdin collapsed={collapsed} toggleSidebar={handleToggleSidebar} />

      <div className={`ts-main ${collapsed ? "sidebar-collapsed" : ""}`}>
        <div className="ts-detail-guru-container">
          <div className="ts-detail-guru-header">
            <div className="ts-detail-guru-title-section">
              <div className="ts-detail-guru-title-icon">👨‍🏫</div>
              <div>
                <h1>Detail Guru</h1>
                <p>Informasi lengkap data guru</p>
              </div>
            </div>
            <div className="ts-detail-guru-actions">
              <button className="ts-print-btn" onClick={handlePrint}>
                <FaPrint className="ts-action-icon" />
                Cetak Biodata
              </button>
            </div>
          </div>

          <div className="ts-detail-guru-content">
            <div className="ts-info-column">
              <div className="ts-info-section">
                <div className="ts-section-header">
                  <FaUser className="ts-section-icon" />
                  <h3>Nama Lengkap</h3>
                </div>
                <div className="ts-info-card">
                  <div className="ts-guru-name">{guru.nama_lengkap}</div>
                  <div className="ts-info-grid">
                    <div className="ts-info-item">
                      <FaCalendarAlt className="ts-info-icon" />
                      <div>
                        <span className="ts-info-label">Tanggal Pensiun</span>
                        <span className="ts-info-value">{formatTanggal(guru.tanggal_pensiun)}</span>
                      </div>
                    </div>
                    <div className="ts-info-item">
                      <FaMapMarkerAlt className="ts-info-icon" />
                      <div>
                        <span className="ts-info-label">Tempat / Tanggal Lahir</span>
                        <span className="ts-info-value">
                          {guru.tempat_lahir}, {formatTanggal(guru.tanggal_lahir)}
                        </span>
                      </div>
                    </div>
                    <div className="ts-info-item">
                      <FaGraduationCap className="ts-info-icon" />
                      <div>
                        <span className="ts-info-label">Pendidikan Terakhir</span>
                        <span className="ts-info-value">{guru.pendidikan_terakhir}</span>
                      </div>
                    </div>
                    <div className="ts-info-item">
                      <FaMapMarkerAlt className="ts-info-icon" />
                      <div>
                        <span className="ts-info-label">Alamat</span>
                        <span className="ts-info-value">{guru.alamat}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="ts-info-section">
                <div className="ts-section-header">
                  <FaUser className="ts-section-icon" />
                  <h3>Jenis Kelamin</h3>
                </div>
                <div className="ts-info-card">
                  <span className="ts-simple-value">
                    {guru.jenis_kelamin === "L"
                      ? "Laki-laki"
                      : guru.jenis_kelamin === "P"
                      ? "Perempuan"
                      : "-"}
                  </span>
                  <div className="ts-info-grid">
                    <div className="ts-info-item">
                      <div>
                        <span className="ts-info-label">Status Kepegawaian</span>
                        <span className="ts-info-value">{guru.status_kepegawaian}</span>
                      </div>
                    </div>
                    <div className="ts-info-item">
                      <FaEnvelope className="ts-info-icon" />
                      <div>
                        <span className="ts-info-label">E-mail</span>
                        <span className="ts-info-value">{guru.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ts-info-column">
              <div className="ts-info-section">
                <div className="ts-section-header">
                  <FaBook className="ts-section-icon" />
                  <h3>Mata Pelajaran yang Diampu</h3>
                </div>
                <div className="ts-info-card">
                  <div className="ts-mapel-list">
                    {guru.mapel && guru.mapel.length > 0 ? (
                      guru.mapel.map((m, i) => (
                        <span key={i} className="ts-mapel-badge">{m.nama_mapel}</span>
                      ))
                    ) : (
                      <span>Tidak ada data mapel</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="ts-info-section">
                <div className="ts-section-header">
                  <FaSchool className="ts-section-icon" />
                  <h3>Unit / Sekolah</h3>
                </div>
                <div className="ts-info-card">
                  <div className="ts-simple-info">
                    <span className="ts-simple-value">{guru.sekolah?.nama_sekolah || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="ts-info-section">
                <div className="ts-section-header">
                  <FaPrint className="ts-section-icon" />
                  <h3>Cetak Biodata</h3>
                </div>
                <div className="ts-info-card">
                  <div className="ts-info-grid">
                    <div className="ts-info-item">
                      <div>
                        <span className="ts-info-label">NIP</span>
                        <span className="ts-info-value ts-nip">{guru.nip}</span>
                      </div>
                    </div>
                    <div className="ts-info-item">
                      <FaCalendarAlt className="ts-info-icon" />
                      <div>
                        <span className="ts-info-label">Tanggal Bergabung</span>
                        <span className="ts-info-value">{formatTanggal(guru.tanggal_bergabung)}</span>
                      </div>
                    </div>
                    <div className="ts-info-item">
                      <FaPhone className="ts-info-icon" />
                      <div>
                        <span className="ts-info-label">Telepon</span>
                        <span className="ts-info-value">{guru.telepon}</span>
                      </div>
                    </div>
                    <div className="ts-info-item">
                      <div>
                        <span className="ts-info-label">Jam Mengajar</span>
                        <span className="ts-info-value">{guru.jam_mengajar_per_minggu}</span>
                      </div>
                    </div>
                    {/* Masa Pensiun */}
                  <div className="ts-pensiun-section">
                    <div className="ts-pensiun-label">Masa Pensiun</div>
                    <div className={`ts-pensiun-badge ${
  hitungMasaPensiun(guru.tanggal_pensiun).includes("Bulan")
    ? "warning"
    : "normal"
}`}>
  {hitungMasaPensiun(guru.tanggal_pensiun)}
</div>

                  </div>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}