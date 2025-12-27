// src/pages/Operator/Dashboard/GuruActions.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaEye,
  FaTrashAlt,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa'
import './GuruActions.css'

export default function GuruActions({ guru = {}, onDelete, showDelete = true }) {
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleView = () => {
    // Langsung navigate ke halaman view guru
    navigate(`/operator/data-guru/view/${guru.nip}`)
  }

  const handleDeleteClick = () => setConfirmOpen(true)
  const handleCancelDelete = () => setConfirmOpen(false)
  const handleConfirmDelete = () => {
    setConfirmOpen(false)
    if (typeof onDelete === 'function') onDelete(guru?.nip)
  }

  return (
    <>
      <div className="actions-inline">
        <button
          className="action-btn view"
          title="Lihat"
          onClick={handleView}
          type="button"
        >
          <FaEye />
        </button>

        {showDelete && (
          <button
            className="action-btn danger"
            title="Hapus"
            onClick={handleDeleteClick}
            type="button"
          >
            <FaTrashAlt />
          </button>
        )}
      </div>

      {/* Modal Konfirmasi Hapus - Sama seperti di Dashboard */}
      {confirmOpen && (
        <div className="modal-overlay">
          <div className="modal-container delete-modal">
            <div className="modal-icon">
              <FaExclamationTriangle />
            </div>
            <div className="modal-content">
              <h3>Konfirmasi Hapus</h3>
              <p>Apakah Anda yakin ingin menghapus data guru <strong>{guru?.nama_lengkap || guru?.nama || '—'}</strong>?</p>
              <p className="modal-warning">Data yang dihapus tidak dapat dikembalikan.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-modal-secondary" onClick={handleCancelDelete}>
                Batal
              </button>
              <button className="btn-modal-danger" onClick={handleConfirmDelete}>
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}