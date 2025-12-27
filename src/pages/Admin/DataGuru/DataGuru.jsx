import React, { useState, useEffect, useMemo } from 'react';
import './DataGuru.css';
import SidebarAdminCabdin from '../Sidebar/SidebarA';
import { FaSearch, FaEye, FaFilter, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';


export default function DataGuru() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSekolah, setSelectedSekolah] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');
  const [dataGuru, setDataGuru] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleToggleSidebar = () => setCollapsed((prev) => !prev);

  useEffect(() => {
  const fetchGuru = async () => {
    try {
      setLoading(true);

      const res = await api.get('/guru');

      // Laravel standar: { data: [...] }
      setDataGuru(res.data.data ?? []);
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil data guru');
    } finally {
      setLoading(false);
    }
  };

  fetchGuru();
}, []);


  const sekolahList = useMemo(() => {
    const setSekolah = new Set(
      dataGuru.map((g) => g.sekolah?.nama_sekolah).filter(Boolean)
    );
    return ['', ...Array.from(setSekolah)];
  }, [dataGuru]);

  const formatTanggal = (tanggal) => {
  if (!tanggal) return '-';

  const date = new Date(tanggal);

  if (isNaN(date)) return '-';

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();

  return `${dd}/${mm}/${yyyy}`;
};

  const hitungSisaPensiun = (tanggalPensiun) => {
  if (!tanggalPensiun) return '-';

  const today = new Date();
  const pensiun = new Date(tanggalPensiun);

  if (pensiun < today) return 'Sudah Pensiun';

  let tahun = pensiun.getFullYear() - today.getFullYear();
  let bulan = pensiun.getMonth() - today.getMonth();

  if (bulan < 0) {
    tahun--;
    bulan += 12;
  }

  if (tahun > 0) return `${tahun} Tahun ${bulan} Bulan`;
  return `${bulan} Bulan`;
};

  const mapelList = useMemo(() => {
    const setMapel = new Set(
      dataGuru.flatMap((g) => g.mapel?.map((m) => m.nama_mapel) || [])
    );
    return ['', ...Array.from(setMapel)];
  }, [dataGuru]);

  const filteredGuru = useMemo(() => {
    return dataGuru.filter((guru) => {
      const namaMatch = guru.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase());
      const nipMatch = guru.nip?.includes(searchTerm);
      const sekolahMatch = !selectedSekolah || guru.sekolah?.nama_sekolah === selectedSekolah;
      const mapelMatch = !selectedMapel || (guru.mapel || []).some((m) => m.nama_mapel === selectedMapel);
      return (namaMatch || nipMatch) && sekolahMatch && mapelMatch;
    });
  }, [dataGuru, searchTerm, selectedSekolah, selectedMapel]);


  return (
    <div className="acd-app">
      {/* Sidebar */}
      <SidebarAdminCabdin collapsed={collapsed} onToggle={handleToggleSidebar} />

      {isMobile && !collapsed && (
        <div className="acd-sidebar-overlay" onClick={() => setCollapsed(true)} />
      )}

      {/* Main Content */}
      <main className={`acd-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Spinner hanya di main content */}
        {loading && (
          <div className="loading-main">
            <div className="spinner"></div>
          </div>
        )}

        {!loading && (
          <>
            <header className="acd-header">
              <div className="acd-header-left">
                <div className="acd-title-section">
                  <h1>Data Guru</h1>
                  <div className="acd-subtitle">Cabang Dinas Pendidikan Wilayah VII</div>
                </div>
              </div>

            </header>

            <div className="acd-content">
              {/* Filter Section */}
              <div className="acd-filter-section">
                <div className="acd-filter-header">
                  <FaFilter className="acd-filter-icon" />
                  <h3>Filter Data</h3>
                </div>
                <div className="acd-filter-grid">
                  <div className="acd-filter-group">
                    <label className="acd-filter-label">Sekolah</label>
                    <select
                      className="acd-filter-select"
                      value={selectedSekolah}
                      onChange={(e) => setSelectedSekolah(e.target.value)}
                    >
                      <option value="">Semua Sekolah</option>
                      {sekolahList.map((nama, idx) => (
                        <option key={idx} value={nama}>
                          {nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="acd-filter-group">
                    <label className="acd-filter-label">Mapel</label>
                    <select
                      className="acd-filter-select"
                      value={selectedMapel}
                      onChange={(e) => setSelectedMapel(e.target.value)}
                    >
                      <option value="">Semua Mapel</option>
                      {mapelList.map((nama, idx) => (
                        <option key={idx} value={nama}>
                          {nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="acd-filter-group">
                    <label className="acd-filter-label">Cari Guru</label>
                    <div className="acd-search-container">
                      <FaSearch className="acd-search-icon" />
                      <input
                        type="text"
                        className="acd-search-input"
                        placeholder="Nama atau NIP Guru"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Table Section */}
              <div className="acd-table-section">
                <div className="acd-table-header">
                  <h3>Daftar Guru</h3>
                  <span className="acd-table-count">
                    {filteredGuru.length} guru ditemukan
                  </span>
                </div>

                <div className="acd-table-container">
                  <table className="acd-performance-table">
                    <thead>
  <tr>
    <th className="acd-table-th">Nama Guru</th>
    <th className="acd-table-th">Sekolah</th>
    <th className="acd-table-th">Mapel</th>
    <th className="acd-table-th">Tgl Pensiun</th>
    <th className="acd-table-th">Sisa Waktu Pensiun</th>
    <th className="acd-table-th acd-text-center">Aksi</th>
  </tr>
</thead>

                    <tbody>
  {filteredGuru.map((guru) => {
    const sisaWaktu = hitungSisaPensiun(guru.tanggal_pensiun);

    return (
      <tr key={guru.nip} className="acd-table-row">
        <td className="acd-table-td">
          <div className="acd-guru-info">
            <div className="acd-guru-nama">{guru.nama_lengkap}</div>
            <div className="acd-guru-nip">{guru.nip}</div>
          </div>
        </td>

        <td className="acd-table-td">
          <span className="acd-sekolah-badge">
            {guru.sekolah?.nama_sekolah || '-'}
          </span>
        </td>

        <td className="acd-table-td">
          {(guru.mapel || []).map((m, i) => (
            <span key={i} className="acd-mapel-badge">
              {m.nama_mapel}
            </span>
          ))}
        </td>

        <td className="acd-table-td">
  <span className="acd-tanggal">
    {formatTanggal(guru.tanggal_pensiun)}
  </span>
</td>


        <td className="acd-table-td">
          <span
            className={`acd-sisa-waktu ${
              sisaWaktu.includes('Bulan') && parseInt(sisaWaktu) <= 6
                ? 'acd-warning'
                : 'acd-info'
            }`}
          >
            {sisaWaktu}
          </span>
        </td>

        <td className="acd-table-td acd-text-center">
          <button
            className="acd-action-btn acd-view-btn"
            title="Lihat Detail"
            onClick={() =>
              navigate(`/admin-cabdin/data-guru/detail/${guru.nip}`)
            }
          >
            <FaEye />
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

                  </table>

                  {filteredGuru.length === 0 && (
                    <div className="acd-empty-state">
                      <div className="acd-empty-icon">🔍</div>
                      <h4>Data tidak ditemukan</h4>
                      <p>Coba ubah filter pencarian Anda</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
