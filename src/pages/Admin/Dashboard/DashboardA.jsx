import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaEye, FaSchool, FaUserGraduate, FaUsers, FaPlus } from 'react-icons/fa';
import SidebarAdminCabdin from '../Sidebar/SidebarA';
import { useNavigate } from 'react-router-dom';
import './DashboardA.css';
import api from '../../../services/api';

export default function DashboardAdminCabdin() {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleViewDetail = (sekolahId) => {
    navigate(`/admin-cabdin/detail-sekolah/${sekolahId}`);
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);  

  // useEffect untuk fetch data dengan loading
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true); // Mulai loading
        setError(null); // Reset error
        
        const res = await api.get('/dashboard-admin');

        console.log('JUMLAH SEKOLAH DARI API:', res.data.daftar_sekolah.length);
console.log('ISI SEKOLAH:', res.data.daftar_sekolah);
        console.log("FULL RESPONSE:", res.data);
    console.log("DETAIL STATS:", res.data.stats.detail);
        setDashboard(res.data);
      } catch (err) {
        
        console.error("Gagal memuat data dashboard:", err);
        setError("Gagal memuat data dashboard. Silakan coba lagi.");
      } finally {
        setLoading(false); // Selesai loading (baik sukses maupun error)
      }
    };
    fetchDashboard();
  }, []);
  
  const handleToggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  const handleTambahSekolah = () => {
    navigate('/admin-cabdin/tambah-sekolah');
  };

  const handleDataGuru = () => {
    navigate('/admin-cabdin/data-guru');
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const startIndex = (currentPage - 1) * itemsPerPage;
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  // Loading state
  if (loading) {
    return (
      <div className="acd-app">
        <SidebarAdminCabdin collapsed={collapsed} onToggle={handleToggleSidebar} />
        {isMobile && !collapsed && (
          <div 
            className="acd-sidebar-overlay"
            onClick={() => setCollapsed(true)}
            />
        )}
        <main className={`acd-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="acd-loading-screen">
            <div className="spinner"></div>
            {/* <p>Memuat data dashboard...</p> */}
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="acd-app">
        <SidebarAdminCabdin collapsed={collapsed} onToggle={handleToggleSidebar} />
        {isMobile && !collapsed && (
          <div 
            className="acd-sidebar-overlay"
            onClick={() => setCollapsed(true)}
          />
        )}
        <main className={`acd-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="acd-error-screen">
            <div className="acd-error-icon">⚠️</div>
            <h3>Terjadi Kesalahan</h3>
            <p>{error}</p>
            <button 
              className="acd-retry-btn" 
              onClick={() => window.location.reload()}
            >
              Coba Lagi
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Data tidak ditemukan
  if (!dashboard) {
    return (
      <div className="acd-app">
        <SidebarAdminCabdin collapsed={collapsed} onToggle={handleToggleSidebar} />
        {isMobile && !collapsed && (
          <div 
            className="acd-sidebar-overlay"
            onClick={() => setCollapsed(true)}
          />
        )}
        <main className={`acd-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="acd-error-screen">
            <div className="acd-error-icon">🔍</div>
            <h3>Data Tidak Ditemukan</h3>
            <p>Data dashboard tidak tersedia.</p>
          </div>
        </main>
      </div>
    );
  }

  // ✅ Data dari backend
  const statsData = [
    {
      icon: <FaSchool />,
      title: 'Total Sekolah',
      value: dashboard.stats.total_sekolah,
      subtitle: 'Sekolah',
      detail: `SMA ${dashboard.sekolah_pie.find(i => i.label === 'SMA')?.value || 0}%, SMK ${dashboard.sekolah_pie.find(i => i.label === 'SMK')?.value || 0}%, SLB ${dashboard.sekolah_pie.find(i => i.label === 'SLB')?.value || 0}%`,
      color: '#3b82f6'
    },
    {
      icon: <FaUsers />,
      title: 'Total Guru',
      value: dashboard.stats.total_guru,
      subtitle: 'Guru',
      detail: `PNS ${dashboard.stats?.detail?.pns || 0}, P3K ${dashboard.stats?.detail?.p3k || 0}, P3K Paruh Waktu ${dashboard.stats?.detail?.paruh_waktu || 0}`,
      color: '#10b981'
    },
    {
      icon: <FaUserGraduate />,
      title: 'Guru Akan Pensiun',
      value: dashboard.stats.guru_akan_pensiun,
      subtitle: 'Guru',
      detail: 'Dalam 3 Tahun',
      color: '#ef4444'
    }
  ];
  
  const sekolahData = dashboard.daftar_sekolah || [];

  const filteredSekolah = sekolahData.filter(sekolah =>
    sekolah.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sekolah.alamat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(
  1,
  Math.ceil(filteredSekolah.length / itemsPerPage)
);


  const paginatedSekolah = filteredSekolah.slice(startIndex, startIndex + itemsPerPage);
  const guruData = dashboard.guru_pie || [];
  const sekolahJenisData = dashboard.sekolah_pie || [];
const handlePrevPage = () => {
  setCurrentPage((prev) => Math.max(prev - 1, 1));
};

const handleNextPage = () => {
  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
};

const handlePageClick = (page) => {
  setCurrentPage(page);
};

  const PieChart = ({ data, size = 120 }) => {
  let accumulated = 0;
  const center = size / 2;
  const radius = size / 2 - 10;

  return (
    <div className="acd-pie-chart" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {data.map((item, index) => {
          const startAngle = accumulated;
          const endAngle = accumulated + item.value * 3.6;
          accumulated = endAngle;

          const startRad = (startAngle * Math.PI) / 180;
          const endRad = (endAngle * Math.PI) / 180;

          const startX = center + radius * Math.cos(startRad);
          const startY = center + radius * Math.sin(startRad);
          const endX = center + radius * Math.cos(endRad);
          const endY = center + radius * Math.sin(endRad);

          const largeArcFlag = item.value > 50 ? 1 : 0;

          const pathData = `
            M ${center} ${center}
            L ${startX} ${startY}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
            Z
          `;

          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}     // 🔥 WARNA AMAN
              stroke="#fff"
              strokeWidth="2"
            />
          );
        })}

        {/* inner hole */}
        <circle cx={center} cy={center} r={radius / 2} fill="#fff" />
      </svg>
    </div>
  );
};

  // Konten utama ketika sudah selesai loading dan data tersedia
  return (
    <div className="acd-app">
      <SidebarAdminCabdin collapsed={collapsed} onToggle={handleToggleSidebar} />
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && !collapsed && (
        <div 
          className="acd-sidebar-overlay"
          onClick={() => setCollapsed(true)}
        />
      )}
      <main className={`acd-main ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="acd-header">
          <div className="acd-header-left">
            <div className="acd-title-section">
              <h1>Dashboard Admin</h1>
              <div className="acd-subtitle">Cabang Dinas Pendidikan Wilayah VII</div>
            </div>
          </div>
        </header>

        <div className="acd-content">
          {/* Statistik Cards */}
          <div className="acd-stats-grid">
            {statsData.map((stat, index) => (
              <div key={index} className="acd-stat-card">
                <div className="acd-stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                  {stat.icon}
                </div>
                <div className="acd-stat-content">
                  <h3 className="acd-stat-title">{stat.title}</h3>
                  <div className="acd-stat-main">
                    <span className="acd-stat-value">{stat.value}</span>
                    <span className="acd-stat-subtitle">{stat.subtitle}</span>
                  </div>
                  <p className="acd-stat-detail">{stat.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabel Sekolah */}
          <div className="acd-performance-section">
            <div className="acd-section-header">
              <h2 className="acd-section-title">Performa Sekolah</h2>
            </div>
            <div className="acd-search-add-row">
              <div className="acd-search-wrapper">
                <input
                  type="text"
                  placeholder="Cari sekolah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="acd-search-btn"><FaSearch /></button>
              </div>
              <button className="acd-add-school-btn" onClick={handleTambahSekolah}>
                <FaPlus className="acd-add-icon" /> Tambah Sekolah
              </button>
            </div>

            <div className="acd-table-container">
              <table className="acd-performance-table">
                <thead>
                  <tr>
                    <th>Nama Sekolah</th>
                    <th>Jenjang</th>
                    <th>Jumlah Guru</th>
                    <th>PNS</th>
                    <th>P3K</th>
                    <th>Paruh Waktu</th>
                    <th>Guru yang Akan Pensiun</th>
                    <th>Status</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSekolah.map((s) => (
                    <tr key={s.id}>
                      <td className="acd-school-cell">
                        <div className="acd-school-name">{s.nama}</div>
                        <div className="acd-school-address">{s.alamat}</div>
                      </td>
                      <td><span className="acd-jenjang-badge">{s.jenjang}</span></td>
                      <td className="acd-count-cell">{s.jumlahGuru}</td>
                      <td className="acd-count-cell">{s.pns}</td>
                      <td className="acd-count-cell">{s.p3k}</td>
                      <td className="acd-count-cell">{s.p3k_paruh_waktu}</td>
                      <td><span className="acd-pensiun-badge">{s.masaPensiun} Orang</span></td>
                      <td>
  <span
    className={`acd-status-badge ${
      s.status === 'aktif' ? 'aktif' : 'nonaktif'
    }`}
  >
    {s.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
  </span>
</td>

                      <td>
                        <button className="acd-action-btn acd-view-btn" onClick={() => handleViewDetail(s.id)}>
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredSekolah.length === 0 && (
                    <tr>
                      <td colSpan="8" className="acd-no-data-message">
                        Tidak ada data sekolah ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="acd-pagination-section">
  <div className="acd-pagination">
    <button
      className="acd-pagination-btn acd-prev-btn"
      onClick={handlePrevPage}
      disabled={currentPage === 1}
    >
      Sebelumnya
    </button>

    <div className="acd-page-numbers">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          className={`acd-page-btn ${currentPage === page ? 'active' : ''}`}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </button>
      ))}
    </div>

    <button
      className="acd-pagination-btn acd-next-btn"
      onClick={handleNextPage}
      disabled={currentPage === totalPages}
    >
      Selanjutnya
    </button>
  </div>
</div>


            {/* Aksi Cepat Section */}
            <div className="acd-quick-actions">
              
            </div>

            {/* Pie Charts */}
            <div className="acd-region-stats">
              <h3 className="acd-bottom-section-title">Statistik Wilayah</h3>
              <div className="acd-stats-content">
                <div className="acd-pie-charts">
                  <div className="acd-pie-chart-group">
                    <h4>Status Guru</h4>
                    <div className="acd-chart-container">
                      <PieChart data={guruData} size={140} />
                      <div className="acd-chart-legend">
                        {guruData.map((item, i) => (
                          <div key={i} className="acd-legend-item">
                            <div className="acd-legend-color" style={{ backgroundColor: item.color }}></div>
                            <span>{item.label} {item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="acd-pie-chart-group">
                    <h4>Jenjang Sekolah</h4>
                    <div className="acd-chart-container">
                      <PieChart data={sekolahJenisData} size={140} />
                      <div className="acd-chart-legend">
                        {sekolahJenisData.map((item, i) => (
                          <div key={i} className="acd-legend-item">
                            <div className="acd-legend-color" style={{ backgroundColor: item.color }}></div>
                            <span>{item.label} {item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="acd-stats-details">
                  <div className="acd-stats-list">
                    <h4>Detail Statistik</h4>

                    {/* Statistik Guru */}
                    {guruData.map((item, i) => (
                      <div key={`guru-${i}`} className="acd-stats-detail-item">
                        <span>{item.label}</span>
                        <span className="acd-stat-percentage">{item.value}%</span>
                      </div>
                    ))}

                    <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #ddd' }} />

                    {/* Statistik Jenjang Sekolah */}
                    {sekolahJenisData.map((item, i) => (
                      <div key={`sekolah-${i}`} className="acd-stats-detail-item">
                        <span>{item.label}</span>
                        <span className="acd-stat-percentage">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}