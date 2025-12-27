import { useNavigate } from 'react-router-dom';
import { FaUsers, FaBuilding } from 'react-icons/fa';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-judul">
        <h1>Cabang Dinas Pendidikan</h1>
        <h2>Wilayah VII Surakarta</h2>
        <p>
          Memastikan kualitas dan keberlangsungan pendidikan SMA, SMK, dan SLB di Kota
          Surakarta dan Sukoharjo dengan layanan yang bermutu dan paripurna
        </p>
      </div>

      <div className="landing-options">
        <div
          className="option option--ketenagaan"
          onClick={() => window.location.href = 'https://testweb2025.host.adellya.my.id/cabdin_pendidikan/index.php'}
        >
          <FaUsers className="option-icon" />
          <div className="option-label">Ketenagaan</div>
        </div>

        <div
          className="option option--kepegawaian"
          onClick={() => navigate('/login')}
        >
          <FaBuilding className="option-icon" />
          <div className="option-label">Kepegawaian</div>
        </div>
      </div>
    </div>
  );
}
