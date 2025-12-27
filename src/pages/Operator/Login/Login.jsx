import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa";
import "./login.css";
import api from "../../../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState(""); // ganti dari email ke username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!username || !password) {
    setError("Username dan Password wajib diisi.");
    return;
  }

  setLoading(true);

  try {
    const res = await api.post("/login", { username, password });

    const data = res.data;

    const sessionUser = {
      id: data.user.id,
      name: data.user.name,
      username: data.user.username,
      role:
        data.user.role === "admin"
          ? "admin_cabdin"
          : "operator_sekolah",
      sekolah: data.user.sekolah,
      token: data.access_token,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem("sessionUser", JSON.stringify(sessionUser));
    localStorage.setItem("token", data.access_token);

    if (sessionUser.role === "admin_cabdin") {
      navigate("/admin-cabdin/dashboard", { replace: true });
    } else {
      navigate("/operator/dashboard", { replace: true });
    }
  } catch (err) {
    setError(
      err.response?.data?.message || "Username atau password salah."
    );
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="login-page">
      <div className="login-info">
        <h1>Cabang Dinas</h1>
        <h1>Pendidikan Wilayah VII</h1>
        <p>Jl. Slamet Riyadi No. 1</p>
        <p>Kauman, Kecamatan Pasar Kliwon, Kota Surakarta</p>
        <p>57112</p>
      </div>

      <div className="login-card-container">
        <div className="login-card">
          <FaGraduationCap className="login-icon" />

          <h2>SELAMAT DATANG</h2>
          <p className="subtext">
            Sistem Informasi Data Guru Cabang Dinas Pendidikan Wilayah VII
            Surakarta
          </p>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Masukkan Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  disabled={loading}
                >
                  {showPassword ? "🤐" : "👁️"}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember">
                <input type="checkbox" disabled={loading} /> Ingat saya
              </label>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Memproses...
                </>
              ) : (
                "MASUK"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
