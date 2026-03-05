import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  getEdificios,
  createEdificio,
  updateEdificio,
  deleteEdificio,
} from "../services/edificios";
import { getDivisiones } from "../services/divisiones";
import {
  getAulasByEdificio,
  createAula,
  updateAula,
  deleteAula,
  toggleDisponibilidadAula,
  type Aula,
} from "../services/aulas";
import "./Usuarios/Usuarios.css"; // reutiliza el mismo CSS

interface Edificio {
  id_building: number;
  name_building: string;
  descrip_building?: string;
  code_building?: string;
  imagen_url?: string;
  lat_building: number;
  lon_building: number;
  id_div?: number;
  name_div?: string;
}

interface Division {
  id_div: number;
  name_div: string;
}

function Edificios() {
  const navigate = useNavigate();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [edificiosData, setEdificiosData] = useState<Edificio[]>([]);
  const [divisiones, setDivisiones] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name_building: "",
    descrip_building: "",
    code_building: "",
    imagen_url: "",
    lat_building: "",
    lon_building: "",
    id_div: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id_building: 0,
    name_building: "",
    descrip_building: "",
    code_building: "",
    imagen_url: "",
    lat_building: "",
    lon_building: "",
    id_div: "",
  });

  const [modalError, setModalError] = useState("");

  // Estados para modal de aulas
  const [showAulasModal, setShowAulasModal] = useState(false);
  const [selectedEdificio, setSelectedEdificio] = useState<Edificio | null>(
    null,
  );
  const [aulasData, setAulasData] = useState<Aula[]>([]);
  const [loadingAulas, setLoadingAulas] = useState(false);
  const [showAddAulaModal, setShowAddAulaModal] = useState(false);
  const [showEditAulaModal, setShowEditAulaModal] = useState(false);
  const [aulaModalError, setAulaModalError] = useState("");

  const [addAulaForm, setAddAulaForm] = useState({
    nombre_aula: "",
    codigo_aula: "",
    planta: "baja",
    capacidad: "0",
    tipo_aula: "salon",
    equipamiento: "{}",
  });

  const [editAulaForm, setEditAulaForm] = useState({
    id_aula: 0,
    nombre_aula: "",
    codigo_aula: "",
    planta: "baja",
    capacidad: "0",
    tipo_aula: "salon",
    equipamiento: "{}",
    disponible: true,
  });

  const fetchEdificios = () => {
    getEdificios()
      .then((data) => {
        setEdificiosData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchDivisiones = () => {
    getDivisiones()
      .then((data) => setDivisiones(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchEdificios();
    fetchDivisiones();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setShowLogoutMenu(false);
    navigate("/", { replace: true });
  };

  const filteredEdificios = edificiosData.filter(
    (e) =>
      e.name_building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.code_building ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddSubmit = async () => {
    setModalError("");
    try {
      await createEdificio({
        name_building: addForm.name_building,
        code_building: addForm.code_building || undefined,
        imagen_url: addForm.imagen_url || undefined,
        lat_building: parseFloat(addForm.lat_building),
        lon_building: parseFloat(addForm.lon_building),
        id_div: addForm.id_div ? parseInt(addForm.id_div) : undefined,
      });
      setShowAddModal(false);
      setAddForm({
        name_building: "",
        descrip_building: "",
        code_building: "",
        imagen_url: "",
        lat_building: "",
        lon_building: "",
        id_div: "",
      });
      fetchEdificios();
    } catch (error) {
      if (error instanceof Error) {
        setModalError(error.message);
      } else {
        setModalError("No se pudo conectar con el servidor");
      }
    }
  };

  const openEditModal = (e: Edificio) => {
    setModalError("");
    setEditForm({
      id_building: e.id_building,
      name_building: e.name_building,
      descrip_building: e.descrip_building ?? "",
      code_building: e.code_building ?? "",
      imagen_url: e.imagen_url ?? "",
      lat_building: String(e.lat_building),
      lon_building: String(e.lon_building),
      id_div: e.id_div ? String(e.id_div) : "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    setModalError("");
    try {
      await updateEdificio(editForm.id_building, {
        name_building: editForm.name_building,
        code_building: editForm.code_building || undefined,
        imagen_url: editForm.imagen_url || undefined,
        lat_building: parseFloat(editForm.lat_building),
        lon_building: parseFloat(editForm.lon_building),
        id_div: editForm.id_div ? parseInt(editForm.id_div) : undefined,
      });
      setShowEditModal(false);
      fetchEdificios();
    } catch (error) {
      if (error instanceof Error) {
        setModalError(error.message);
      } else {
        setModalError("No se pudo conectar con el servidor");
      }
    }
  };

  const handleDelete = async (id_building: number, name: string) => {
    if (!window.confirm(`¿Eliminar el edificio "${name}"?`)) return;
    try {
      await deleteEdificio(id_building);
      fetchEdificios();
    } catch {
      alert("Error al eliminar el edificio");
    }
  };

  // ============================================================
  // FUNCIONES PARA GESTIÓN DE AULAS
  // ============================================================

  const openAulasModal = async (edificio: Edificio) => {
    setSelectedEdificio(edificio);
    setShowAulasModal(true);
    setLoadingAulas(true);
    try {
      const aulas = await getAulasByEdificio(edificio.id_building);
      setAulasData(aulas);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAulas(false);
    }
  };

  const refreshAulas = async () => {
    if (!selectedEdificio) return;
    setLoadingAulas(true);
    try {
      const aulas = await getAulasByEdificio(selectedEdificio.id_building);
      setAulasData(aulas);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingAulas(false);
    }
  };

  const openAddAulaModal = () => {
    setAulaModalError("");
    setAddAulaForm({
      nombre_aula: "",
      codigo_aula: "",
      planta: "baja",
      capacidad: "0",
      tipo_aula: "salon",
      equipamiento: "{}",
    });
    setShowAddAulaModal(true);
  };

  const handleAddAulaSubmit = async () => {
    if (!selectedEdificio) return;
    setAulaModalError("");
    try {
      let equipamiento = {};
      try {
        equipamiento = addAulaForm.equipamiento
          ? JSON.parse(addAulaForm.equipamiento)
          : {};
      } catch {
        setAulaModalError("Equipamiento debe ser un JSON válido");
        return;
      }

      await createAula({
        nombre_aula: addAulaForm.nombre_aula,
        codigo_aula: addAulaForm.codigo_aula || undefined,
        id_building: selectedEdificio.id_building,
        planta: addAulaForm.planta || undefined,
        capacidad: parseInt(addAulaForm.capacidad),
        tipo_aula: addAulaForm.tipo_aula || undefined,
        equipamiento,
      });
      setShowAddAulaModal(false);
      refreshAulas();
    } catch (error) {
      if (error instanceof Error) {
        setAulaModalError(error.message);
      } else {
        setAulaModalError("No se pudo crear el aula");
      }
    }
  };

  const openEditAulaModal = (aula: Aula) => {
    setAulaModalError("");
    setEditAulaForm({
      id_aula: aula.id_aula,
      nombre_aula: aula.nombre_aula,
      codigo_aula: aula.codigo_aula || "",
      planta: aula.planta || "baja",
      capacidad: String(aula.capacidad),
      tipo_aula: aula.tipo_aula || "salon",
      equipamiento: JSON.stringify(aula.equipamiento || {}, null, 2),
      disponible: aula.disponible,
    });
    setShowEditAulaModal(true);
  };

  const handleEditAulaSubmit = async () => {
    setAulaModalError("");
    try {
      let equipamiento = {};
      try {
        equipamiento = editAulaForm.equipamiento
          ? JSON.parse(editAulaForm.equipamiento)
          : {};
      } catch {
        setAulaModalError("Equipamiento debe ser un JSON válido");
        return;
      }

      await updateAula(editAulaForm.id_aula, {
        nombre_aula: editAulaForm.nombre_aula,
        codigo_aula: editAulaForm.codigo_aula || undefined,
        planta: editAulaForm.planta || undefined,
        capacidad: parseInt(editAulaForm.capacidad),
        tipo_aula: editAulaForm.tipo_aula || undefined,
        equipamiento,
        disponible: editAulaForm.disponible,
      });
      setShowEditAulaModal(false);
      refreshAulas();
    } catch (error) {
      if (error instanceof Error) {
        setAulaModalError(error.message);
      } else {
        setAulaModalError("No se pudo actualizar el aula");
      }
    }
  };

  const handleDeleteAula = async (id_aula: number, nombre: string) => {
    if (!window.confirm(`¿Eliminar el aula "${nombre}"?`)) return;
    try {
      await deleteAula(id_aula);
      refreshAulas();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Error al eliminar el aula");
      }
    }
  };

  const handleToggleDisponibilidad = async (id_aula: number) => {
    try {
      await toggleDisponibilidadAula(id_aula);
      refreshAulas();
    } catch {
      alert("Error al cambiar disponibilidad");
    }
  };

  const modalStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: "12px",
    padding: "32px",
    width: "420px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    maxHeight: "90vh",
    overflowY: "auto",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    boxSizing: "border-box",
  };

  const selectStyle: React.CSSProperties = { ...inputStyle };

  const labelStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 600,
    color: "#6b7280",
    marginBottom: "-8px",
  };

  return (
    <div className="usuarios-container">
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate("/dashboard")}>
            <span className="nav-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </span>
            <span className="nav-text">Dashboard</span>
          </button>

          <button className="nav-item" onClick={() => navigate("/usuarios")}>
            <span className="nav-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span className="nav-text">Usuarios</span>
          </button>

          <button className="nav-item" onClick={() => navigate("/eventos")}>
            <span className="nav-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <span className="nav-text">Eventos</span>
          </button>

          <button
            className="nav-item active"
            onClick={() => navigate("/edificios")}
          >
            <span className="nav-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 22V12h6v10" />
                <path d="M3 9h18" />
              </svg>
            </span>
            <span className="nav-text">Edificios</span>
          </button>
          <button className="nav-item" onClick={() => navigate("/divisiones")}>
            <span className="nav-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 3h7v7H3z" />
                <path d="M14 3h7v7h-7z" />
                <path d="M3 14h7v7H3z" />
                <path d="M14 14h7v7h-7z" />
              </svg>
            </span>
            <span className="nav-text">Divisiones</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div
            className="user-profile"
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
          >
            <div className="user-avatar">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span className="user-name">Admin</span>
          </div>
          {showLogoutMenu && (
            <div className="logout-menu">
              <button className="logout-btn" onClick={handleLogout}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        <div className="top-nav">
          <span className="top-nav-text inactive">Dashboards</span>
          <span className="top-nav-separator">/</span>
          <span className="top-nav-text active">Edificios</span>
        </div>

        <div className="content-card">
          <div className="content-header">
            <div className="header-left">
              <h2 className="content-title">Edificios</h2>
              <button
                className="btn-primary"
                onClick={() => {
                  setModalError("");
                  setShowAddModal(true);
                }}
              >
                Agregar
              </button>
            </div>
            <div className="header-right">
              <div className="search-box">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por nombre o código"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>

          <div className="table-container" style={{ overflowX: "auto" }}>
            {loading ? (
              <p style={{ padding: "20px", textAlign: "center" }}>
                Cargando edificios...
              </p>
            ) : (
              <table className="data-table" style={{ minWidth: "1200px" }}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Código</th>
                    <th>Descripción</th>
                    {/* <th>División</th> */}
                    <th>Latitud</th>
                    <th>Longitud</th>
                    <th>Imagen</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEdificios.map((ed) => (
                    <tr key={ed.id_building}>
                      <td className="cell-name">{ed.name_building}</td>
                      <td>{ed.code_building ?? "—"}</td>
                      <td>{ed.descrip_building ?? "—"}</td>
                      {/* <td>{ed.name_div ?? "—"}</td> */}
                      <td>{ed.lat_building}</td>
                      <td>{ed.lon_building}</td>
                      <td>
                        {ed.imagen_url ? (
                          <img
                            src={ed.imagen_url}
                            alt={ed.name_building}
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                              borderRadius: "6px",
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="cell-actions">
                        <button
                          className="action-btn"
                          title="Ver Aulas"
                          style={{ color: "#0ea5e9" }}
                          onClick={() => openAulasModal(ed)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        </button>
                        <button
                          className="action-btn"
                          title="Editar"
                          onClick={() => openEditModal(ed)}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="action-btn"
                          title="Eliminar"
                          style={{ color: "#dc2626" }}
                          onClick={() =>
                            handleDelete(ed.id_building, ed.name_building)
                          }
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="content-footer">
            <p className="footer-text">© 2026</p>
          </div>
        </div>
      </main>

      {/* MODAL AGREGAR */}
      {showAddModal && (
        <div style={modalStyle} onClick={() => setShowAddModal(false)}>
          <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: "18px" }}>Agregar Edificio</h3>
            {modalError && (
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                {modalError}
              </div>
            )}
            <span style={labelStyle}>Nombre</span>
            <input
              style={inputStyle}
              placeholder="Nombre del edificio"
              value={addForm.name_building}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, name_building: e.target.value }))
              }
            />

            <span style={labelStyle}>Código</span>
            <input
              style={inputStyle}
              placeholder="Ej: ED-01"
              value={addForm.code_building}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, code_building: e.target.value }))
              }
            />

            <span style={labelStyle}>División</span>
            <select
              style={selectStyle}
              value={addForm.id_div}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, id_div: e.target.value }))
              }
            >
              <option value="">Seleccionar división</option>
              {divisiones.map((d) => (
                <option key={d.id_div} value={d.id_div}>
                  {d.name_div}
                </option>
              ))}
            </select>

            <span style={labelStyle}>Latitud</span>
            <input
              style={inputStyle}
              placeholder="Ej: 20.5888"
              type="number"
              step="any"
              value={addForm.lat_building}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, lat_building: e.target.value }))
              }
            />

            <span style={labelStyle}>Longitud</span>
            <input
              style={inputStyle}
              placeholder="Ej: -100.3899"
              type="number"
              step="any"
              value={addForm.lon_building}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, lon_building: e.target.value }))
              }
            />

            <span style={labelStyle}>URL de imagen</span>
            <input
              style={inputStyle}
              placeholder="https://..."
              value={addForm.imagen_url}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, imagen_url: e.target.value }))
              }
            />

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn-filter"
                onClick={() => setShowAddModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleAddSubmit}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR */}
      {showEditModal && (
        <div style={modalStyle} onClick={() => setShowEditModal(false)}>
          <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: "18px" }}>Editar Edificio</h3>
            {modalError && (
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              >
                {modalError}
              </div>
            )}
            <span style={labelStyle}>Nombre</span>
            <input
              style={inputStyle}
              placeholder="Nombre del edificio"
              value={editForm.name_building}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, name_building: e.target.value }))
              }
            />

            <span style={labelStyle}>Código</span>
            <input
              style={inputStyle}
              placeholder="Ej: ED-01"
              value={editForm.code_building}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, code_building: e.target.value }))
              }
            />

            <span style={labelStyle}>División</span>
            <select
              style={selectStyle}
              value={editForm.id_div}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, id_div: e.target.value }))
              }
            >
              <option value="">Seleccionar división</option>
              {divisiones.map((d) => (
                <option key={d.id_div} value={d.id_div}>
                  {d.name_div}
                </option>
              ))}
            </select>

            <span style={labelStyle}>Latitud</span>
            <input
              style={inputStyle}
              placeholder="Ej: 20.5888"
              type="number"
              step="any"
              value={editForm.lat_building}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, lat_building: e.target.value }))
              }
            />

            <span style={labelStyle}>Longitud</span>
            <input
              style={inputStyle}
              placeholder="Ej: -100.3899"
              type="number"
              step="any"
              value={editForm.lon_building}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, lon_building: e.target.value }))
              }
            />

            <span style={labelStyle}>URL de imagen</span>
            <input
              style={inputStyle}
              placeholder="https://..."
              value={editForm.imagen_url}
              onChange={(e) =>
                setEditForm((p) => ({ ...p, imagen_url: e.target.value }))
              }
            />

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn-filter"
                onClick={() => setShowEditModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleEditSubmit}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GESTIÓN DE AULAS */}
      {showAulasModal && selectedEdificio && (
        <div style={modalStyle} onClick={() => setShowAulasModal(false)}>
          <div
            style={{
              ...cardStyle,
              maxWidth: "900px",
              width: "90%",
              maxHeight: "85vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "18px" }}>
                  Aulas de {selectedEdificio.name_building}
                </h3>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  Código: {selectedEdificio.code_building || "Sin código"}
                </p>
              </div>
              <button
                className="btn-primary"
                onClick={openAddAulaModal}
                style={{ whiteSpace: "nowrap" }}
              >
                + Añadir Aula
              </button>
            </div>

            {loadingAulas ? (
              <p
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                Cargando aulas...
              </p>
            ) : aulasData.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{
                    margin: "0 auto 12px",
                    display: "block",
                    opacity: 0.5,
                  }}
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <p style={{ margin: 0, fontSize: "14px" }}>
                  No hay aulas registradas en este edificio
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
                  Haz clic en "Añadir Aula" para crear una
                </p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Código</th>
                      <th>Planta</th>
                      <th>Capacidad</th>
                      <th>Tipo</th>
                      <th>Disponible</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {aulasData.map((aula) => (
                      <tr key={aula.id_aula}>
                        <td className="cell-name">{aula.nombre_aula}</td>
                        <td>{aula.codigo_aula || "—"}</td>
                        <td>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "12px",
                              fontWeight: 500,
                              backgroundColor:
                                aula.planta === "baja"
                                  ? "#dbeafe"
                                  : aula.planta === "alta"
                                    ? "#ede9fe"
                                    : aula.planta === "sotano"
                                      ? "#f3f4f6"
                                      : "#fef3c7",
                              color:
                                aula.planta === "baja"
                                  ? "#1e40af"
                                  : aula.planta === "alta"
                                    ? "#6b21a8"
                                    : aula.planta === "sotano"
                                      ? "#374151"
                                      : "#92400e",
                            }}
                          >
                            {aula.planta || "—"}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: 600,
                              color: aula.capacidad > 0 ? "#059669" : "#6b7280",
                            }}
                          >
                            {aula.capacidad}
                          </span>
                          {aula.capacidad > 0 && (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#6b7280",
                                marginLeft: "4px",
                              }}
                            >
                              personas
                            </span>
                          )}
                        </td>
                        <td>{aula.tipo_aula || "—"}</td>
                        <td>
                          <button
                            onClick={() =>
                              handleToggleDisponibilidad(aula.id_aula)
                            }
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              border: "none",
                              fontSize: "12px",
                              fontWeight: 500,
                              cursor: "pointer",
                              backgroundColor: aula.disponible
                                ? "#d1fae5"
                                : "#fee2e2",
                              color: aula.disponible ? "#065f46" : "#991b1b",
                            }}
                          >
                            {aula.disponible
                              ? "✓ Disponible"
                              : "✗ No disponible"}
                          </button>
                        </td>
                        <td className="cell-actions">
                          <button
                            className="action-btn"
                            title="Editar"
                            onClick={() => openEditAulaModal(aula)}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="action-btn"
                            title="Eliminar"
                            style={{ color: "#dc2626" }}
                            onClick={() =>
                              handleDeleteAula(aula.id_aula, aula.nombre_aula)
                            }
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div
              style={{
                marginTop: "16px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn-filter"
                onClick={() => setShowAulasModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL AÑADIR AULA */}
      {showAddAulaModal && (
        <div style={modalStyle} onClick={() => setShowAddAulaModal(false)}>
          <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: "18px", marginBottom: "16px" }}>
              Añadir Aula
            </h3>

            {aulaModalError && (
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  borderRadius: "8px",
                  fontSize: "13px",
                  marginBottom: "12px",
                }}
              >
                {aulaModalError}
              </div>
            )}

            <span style={labelStyle}>Nombre del Aula *</span>
            <input
              style={inputStyle}
              placeholder="Ej: Aula 101, Laboratorio A"
              value={addAulaForm.nombre_aula}
              onChange={(e) =>
                setAddAulaForm((p) => ({ ...p, nombre_aula: e.target.value }))
              }
            />

            <span style={labelStyle}>Código</span>
            <input
              style={inputStyle}
              placeholder="Ej: A-101"
              value={addAulaForm.codigo_aula}
              onChange={(e) =>
                setAddAulaForm((p) => ({ ...p, codigo_aula: e.target.value }))
              }
            />

            <span style={labelStyle}>Planta</span>
            <select
              style={selectStyle}
              value={addAulaForm.planta}
              onChange={(e) =>
                setAddAulaForm((p) => ({ ...p, planta: e.target.value }))
              }
            >
              <option value="baja">Planta Baja</option>
              <option value="alta">Planta Alta</option>
              <option value="sotano">Sótano</option>
              <option value="azotea">Azotea</option>
            </select>

            <span style={labelStyle}>Capacidad (personas) *</span>
            <input
              style={inputStyle}
              type="number"
              min="0"
              placeholder="30"
              value={addAulaForm.capacidad}
              onChange={(e) =>
                setAddAulaForm((p) => ({ ...p, capacidad: e.target.value }))
              }
            />

            <span style={labelStyle}>Tipo de Aula</span>
            <select
              style={selectStyle}
              value={addAulaForm.tipo_aula}
              onChange={(e) =>
                setAddAulaForm((p) => ({ ...p, tipo_aula: e.target.value }))
              }
            >
              <option value="salon">Salón</option>
              <option value="laboratorio">Laboratorio</option>
              <option value="auditorio">Auditorio</option>
              <option value="sala_juntas">Sala de Juntas</option>
              <option value="taller">Taller</option>
            </select>

            <span style={labelStyle}>Equipamiento (JSON)</span>
            <textarea
              style={{
                ...inputStyle,
                minHeight: "80px",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
              placeholder='{"proyector": true, "aire_acondicionado": true}'
              value={addAulaForm.equipamiento}
              onChange={(e) =>
                setAddAulaForm((p) => ({ ...p, equipamiento: e.target.value }))
              }
            />

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "16px",
              }}
            >
              <button
                className="btn-filter"
                onClick={() => setShowAddAulaModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleAddAulaSubmit}>
                Crear Aula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR AULA */}
      {showEditAulaModal && (
        <div style={modalStyle} onClick={() => setShowEditAulaModal(false)}>
          <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: "18px", marginBottom: "16px" }}>
              Editar Aula
            </h3>

            {aulaModalError && (
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  borderRadius: "8px",
                  fontSize: "13px",
                  marginBottom: "12px",
                }}
              >
                {aulaModalError}
              </div>
            )}

            <span style={labelStyle}>Nombre del Aula *</span>
            <input
              style={inputStyle}
              placeholder="Ej: Aula 101, Laboratorio A"
              value={editAulaForm.nombre_aula}
              onChange={(e) =>
                setEditAulaForm((p) => ({ ...p, nombre_aula: e.target.value }))
              }
            />

            <span style={labelStyle}>Código</span>
            <input
              style={inputStyle}
              placeholder="Ej: A-101"
              value={editAulaForm.codigo_aula}
              onChange={(e) =>
                setEditAulaForm((p) => ({ ...p, codigo_aula: e.target.value }))
              }
            />

            <span style={labelStyle}>Planta</span>
            <select
              style={selectStyle}
              value={editAulaForm.planta}
              onChange={(e) =>
                setEditAulaForm((p) => ({ ...p, planta: e.target.value }))
              }
            >
              <option value="baja">Planta Baja</option>
              <option value="alta">Planta Alta</option>
              <option value="sotano">Sótano</option>
              <option value="azotea">Azotea</option>
            </select>

            <span style={labelStyle}>Capacidad (personas) *</span>
            <input
              style={inputStyle}
              type="number"
              min="0"
              placeholder="30"
              value={editAulaForm.capacidad}
              onChange={(e) =>
                setEditAulaForm((p) => ({ ...p, capacidad: e.target.value }))
              }
            />

            <span style={labelStyle}>Tipo de Aula</span>
            <select
              style={selectStyle}
              value={editAulaForm.tipo_aula}
              onChange={(e) =>
                setEditAulaForm((p) => ({ ...p, tipo_aula: e.target.value }))
              }
            >
              <option value="salon">Salón</option>
              <option value="laboratorio">Laboratorio</option>
              <option value="auditorio">Auditorio</option>
              <option value="sala_juntas">Sala de Juntas</option>
              <option value="taller">Taller</option>
            </select>

            <span style={labelStyle}>Equipamiento (JSON)</span>
            <textarea
              style={{
                ...inputStyle,
                minHeight: "80px",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
              placeholder='{"proyector": true, "aire_acondicionado": true}'
              value={editAulaForm.equipamiento}
              onChange={(e) =>
                setEditAulaForm((p) => ({ ...p, equipamiento: e.target.value }))
              }
            />

            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="checkbox"
                id="disponible"
                checked={editAulaForm.disponible}
                onChange={(e) =>
                  setEditAulaForm((p) => ({
                    ...p,
                    disponible: e.target.checked,
                  }))
                }
                style={{ width: "auto" }}
              />
              <label
                htmlFor="disponible"
                style={{ margin: 0, fontSize: "14px", color: "#374151" }}
              >
                Aula disponible para uso
              </label>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "16px",
              }}
            >
              <button
                className="btn-filter"
                onClick={() => setShowEditAulaModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleEditAulaSubmit}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Edificios;
