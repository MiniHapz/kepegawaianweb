// src/pages/Operator/ViewGuru/ViewGuru.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPrint, FaDownload, FaEdit } from 'react-icons/fa';
import Sidebar from '../Sidebar/Sidebar';
import html2pdf from 'html2pdf.js';
import './ViewGuru.css';
import api from "../../../services/api";

export default function ViewGuru() {
  const { nip } = useParams(); 
  const navigate = useNavigate();
  const printContentRef = useRef(null);

  const [guru, setGuru] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // const token = localStorage.getItem('token');

  useEffect(() => {
  const fetchGuru = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/guru/${nip}`);
      setGuru(res.data?.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengambil data guru");
    } finally {
      setLoading(false);
    }
  };

  fetchGuru();
}, [nip]);


  // 🔹 Helper format tanggal dd mm yyyy
  const formatDate = (isoStr) => {
    if (!isoStr) return '—'
    const d = new Date(isoStr)
    if (isNaN(d)) return '—'
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}-${month}-${year}` // format dd-mm-yyyy
  }

  const handleBack = () => navigate(-1);
  const handleEdit = () => navigate(`/operator/data-guru/edit/${nip}`);

  // 🔹 SISTEM PRINT SAMA DENGAN DOKUMEN DIGITAL
  const handlePrint = () => {
    if (!guru) {
      alert('Tidak ada data untuk dicetak');
      return;
    }

    console.log('🖨️ Mencetak data guru...');

    // Buat konten HTML untuk print
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Data Guru - ${guru.nama_lengkap}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .print-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .print-header h1 {
              margin: 0;
              color: #1976d2;
            }
            .print-header .subtitle {
              color: #666;
              margin-top: 5px;
            }
            .print-section {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .print-section h2 {
              background: #f5f5f5;
              padding: 10px;
              margin: 0 0 15px 0;
              border-left: 4px solid #1976d2;
            }
            .print-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
            }
            .print-field {
              margin-bottom: 10px;
            }
            .print-label {
              font-weight: bold;
              color: #555;
              margin-bottom: 5px;
            }
            .print-value {
              padding: 8px;
              background: #f9f9f9;
              border-radius: 4px;
            }
            .status-pill {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-pns { background: #e8f5e8; color: #2e7d32; }
            .status-honorer { background: #fff3e0; color: #ef6c00; }
            .status-contract { background: #e3f2fd; color: #1565c0; }
            .subject-chip {
              display: inline-block;
              background: #e3f2fd;
              color: #1976d2;
              padding: 5px 12px;
              border-radius: 16px;
              margin: 5px;
              font-size: 12px;
            }
            .print-footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            @media print {
              body { margin: 0; }
              .print-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>DATA GURU</h1>
            <div class="subtitle">${guru.sekolah?.nama_sekolah || 'Sekolah'}</div>
            <div class="subtitle">Dicetak pada: ${new Date().toLocaleDateString('id-ID')}</div>
          </div>

          <!-- Informasi Pribadi -->
          <div class="print-section">
            <h2>Informasi Pribadi</h2>
            <div class="print-grid">
              <div class="print-field">
                <div class="print-label">Nama Lengkap</div>
                <div class="print-value">${guru.nama_lengkap}</div>
              </div>
              <div class="print-field">
                <div class="print-label">NIP</div>
                <div class="print-value">${guru.nip}</div>
              </div>
              <div class="print-field">
                <div class="print-label">Jenis Kelamin</div>
                <div class="print-value">${guru.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
              </div>
              <div class="print-field">
                <div class="print-label">Tempat, Tanggal Lahir</div>
                <div class="print-value">${guru.tempat_lahir}, ${formatDate(guru.tanggal_lahir)}</div>
              </div>
              <div class="print-field">
                <div class="print-label">Alamat</div>
                <div class="print-value">${guru.alamat}</div>
              </div>
              <div class="print-field">
                <div class="print-label">Email</div>
                <div class="print-value">${guru.email}</div>
              </div>
              <div class="print-field">
                <div class="print-label">Telepon</div>
                <div class="print-value">${guru.telepon}</div>
              </div>
            </div>
          </div>

          <!-- Informasi Kepegawaian -->
          <div class="print-section">
            <h2>Informasi Kepegawaian</h2>
            <div class="print-grid">
              <div class="print-field">
                <div class="print-label">Status Kepegawaian</div>
                <div class="print-value">
                  <span class="status-pill status-${guru.status_kepegawaian?.toLowerCase().replace(' ', '-')}">
                    ${guru.status_kepegawaian}
                  </span>
                </div>
              </div>
              <div class="print-field">
                <div class="print-label">Jabatan</div>
                <div class="print-value">${guru.jabatan}</div>
              </div>
              <div class="print-field">
                <div class="print-label">Jam Mengajar per Minggu</div>
                <div class="print-value">
                  ${guru.jam_mengajar_per_minggu !== null && guru.jam_mengajar_per_minggu !== undefined
                    ? `${guru.jam_mengajar_per_minggu} jam/minggu`
                    : '0 jam/minggu'}
                </div>
              </div>
              <div class="print-field">
                <div class="print-label">Pendidikan Terakhir</div>
                <div class="print-value">${guru.pendidikan_terakhir}</div>
              </div>
              <div class="print-field">
                <div class="print-label">Tanggal Bergabung</div>
                <div class="print-value">${formatDate(guru.tanggal_bergabung)}</div>
              </div>
              <div class="print-field">
                <div class="print-label">Tanggal Pensiun</div>
                <div class="print-value">${formatDate(guru.tanggal_pensiun)}</div>
              </div>
              <div class="print-field">
                <div class="print-label">Unit Kerja</div>
                <div class="print-value">${guru.sekolah?.nama_sekolah}</div>
              </div>
            </div>
          </div>

          <!-- Mata Pelajaran -->
          <div class="print-section">
            <h2>Mata Pelajaran yang Diampu</h2>
            <div class="print-value">
              ${(guru.mapel || []).map(m => 
                `<span class="subject-chip">${m.nama_mapel}</span>`
              ).join('') || '<em>Tidak ada mata pelajaran</em>'}
            </div>
          </div>

          <div class="print-footer">
            Dokumen dicetak dari Sistem Dokumen Digital • ${new Date().toLocaleString('id-ID')}
          </div>
        </body>
      </html>
    `;

    // Buka window baru untuk print
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Popup diblokir! Izinkan popup untuk mencetak data guru.');
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Tunggu sampai konten loaded lalu print
    printWindow.onload = () => {
      setTimeout(() => {
        try {
          printWindow.print();
        } catch (error) {
          console.log('Auto print tidak didukung. User harus manual print.');
        }
      }, 500);
    };
  };

  // 🔹 SISTEM DOWNLOAD PDF SAMA DENGAN DOKUMEN DIGITAL
const handleDownload = async () => {
  if (!guru || isGeneratingPDF) return;

  setIsGeneratingPDF(true);
  
  try {
    const element = printContentRef.current;
    
    const options = {
      margin: 10,
      filename: `data-guru-${guru.nip}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    await html2pdf().set(options).from(element).save();
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Gagal membuat PDF: ' + error.message);
  } finally {
    setIsGeneratingPDF(false);
  }
};


  return (
    <div className="view-guru-app">
      <Sidebar collapsed={false} onToggle={() => {}} />
      <main className="view-guru-main">
        {/* 🔹 Loading overlay */}
        {loading && (
          <div className="loading-main">
            <div className="spinner"></div>
          </div>
        )}

        {!loading && error && <div className="error">{error}</div>}
        {!loading && !guru && !error && <div className="error">Data guru tidak ditemukan</div>}

        {!loading && guru && (
          <>
        {/* Header */}
        <header className="view-guru-header">
          <div className="view-guru-header-left">
            <button className="view-guru-back-btn" onClick={handleBack}>
              <FaArrowLeft /><span>Kembali</span>
            </button>
            <div className="view-guru-title-section">
              <h1>Detail Data Guru</h1>
              <div className="view-guru-subtitle">{guru.sekolah?.nama_sekolah || ''}</div>
            </div>
          </div>
          <div className="view-guru-header-actions">
            <button 
              className="btn-ghost" 
              onClick={handlePrint}
              disabled={!guru}
            >
              <FaPrint />Cetak
            </button>
            <button 
              className="btn-ghost" 
              onClick={handleDownload}
              disabled={!guru || isGeneratingPDF}
            >
              <FaDownload />
              {isGeneratingPDF ? 'Membuat PDF...' : 'Unduh PDF'}
            </button>
            <button className="btn-primary" onClick={handleEdit}>
              <FaEdit />Edit Data
            </button>
          </div>
        </header>

        {/* Content - Tambahkan ref untuk PDF generation */}
        <div className="view-guru-content" ref={printContentRef}>
          {/* Informasi Pribadi */}
          <section className="view-guru-section">
            <h2>Informasi Pribadi</h2>
            <div className="view-guru-grid">
              <div className="view-guru-field"><label>Nama Lengkap</label><div className="view-guru-value">{guru.nama_lengkap}</div></div>
              <div className="view-guru-field"><label>NIP</label><div className="view-guru-value">{guru.nip}</div></div>
              <div className="view-guru-field"><label>Jenis Kelamin</label><div className="view-guru-value">{guru.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</div></div>
              <div className="view-guru-field">
                <label>Tempat, Tanggal Lahir</label>
                <div className="view-guru-value">
                  {guru.tempat_lahir}, {formatDate(guru.tanggal_lahir)}
                </div>
              </div>
              <div className="view-guru-field"><label>Alamat</label><div className="view-guru-value">{guru.alamat}</div></div>
              <div className="view-guru-field"><label>Email</label><div className="view-guru-value">{guru.email}</div></div>
              <div className="view-guru-field"><label>Telepon</label><div className="view-guru-value">{guru.telepon}</div></div>
            </div>
          </section>

          {/* Informasi Kepegawaian */}
          <section className="view-guru-section">
            <h2>Informasi Kepegawaian</h2>
            <div className="view-guru-grid">
              <div className="view-guru-field">
                <label>Status Kepegawaian</label>
                <div className="view-guru-value">
                  <span className={`status-pill status-${guru.status_kepegawaian?.toLowerCase().replace(' ', '-')}`}>
                    {guru.status_kepegawaian}
                  </span>
                </div>
              </div>

              <div className="view-guru-field">
                <label>Jabatan</label>
                <div className="view-guru-value">{guru.jabatan}</div>
              </div>

              <div className="view-guru-field">
                <label>Jam Mengajar per Minggu</label>
                <div className="view-guru-value">
                  {guru.jam_mengajar_per_minggu !== null && guru.jam_mengajar_per_minggu !== undefined
                    ? `${guru.jam_mengajar_per_minggu} jam/minggu`
                    : '0 jam/minggu'}
                </div>
              </div>

              <div className="view-guru-field">
                <label>Pendidikan Terakhir</label>
                <div className="view-guru-value">{guru.pendidikan_terakhir}</div>
              </div>

              <div className="view-guru-field">
                <label>Tanggal Bergabung</label>
                <div className="view-guru-value">{formatDate(guru.tanggal_bergabung)}</div>
              </div>

              <div className="view-guru-field">
                <label>Tanggal Pensiun</label>
                <div className="view-guru-value">{formatDate(guru.tanggal_pensiun)}</div>
              </div>

              <div className="view-guru-field">
                <label>Unit Kerja</label>
                <div className="view-guru-value">{guru.sekolah?.nama_sekolah}</div>
              </div>
            </div>
          </section>

          {/* Mata Pelajaran */}
          <section className="view-guru-section">
            <h2>Mata Pelajaran yang Diampu</h2>
            <div className="view-guru-mapel">
              {(guru.mapel || []).map((m, i) => (
                <span key={i} className="subject-chip">{m.nama_mapel}</span>
              ))}
            </div>
          </section>
        </div>
        </>
        )}
      </main>
    </div>
  );
}