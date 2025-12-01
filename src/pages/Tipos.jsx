import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Tipos.css';

const Tipos = () => {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nuevoTipo, setNuevoTipo] = useState('');
  const navigate = useNavigate();

  const cargarTipos = async () => {
    try {
      const response = await axios.get('https://api-lonja-backend.onrender.com/api/tipos');
      setTipos(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron cargar los tipos', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTipos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nuevoTipo.trim()) return;

    try {
      await axios.post('https://api-lonja-backend.onrender.com/api/tipos', { nombre: nuevoTipo });
      Swal.fire('Guardado', 'Tipo creado correctamente', 'success');
      setNuevoTipo('');
      setShowModal(false);
      cargarTipos();
    } catch (error) {
      Swal.fire('Error', 'No se pudo guardar', 'error');
    }
  };

  const handleEliminar = async (id) => {
    if (await Swal.fire({ title: '¿Borrar tipo?', text: "Si hay productos de este tipo, no se podrá borrar.", icon: 'warning', showCancelButton: true }).then(r => r.isConfirmed)) {
      try {
        await axios.delete(`https://api-lonja-backend.onrender.com/api/tipos/${id}`);
        Swal.fire('Eliminado', '', 'success');
        cargarTipos();
      } catch (error) {
        Swal.fire('Error', 'No se puede eliminar (probablemente está en uso)', 'error');
      }
    }
  };

  return (
    <div className="tipos-container">
      <div className="admin-header">
        <h1>Gestión de Tipos</h1>
        <div className="header-actions">
          <button onClick={() => setShowModal(true)} className="btn-crear">＋ Nuevo Tipo</button>
          <button onClick={() => navigate('/menu')} className="btn-volver">Volver</button>
        </div>
      </div>

      {loading ? <p>Cargando...</p> : (
        <div className="tabla-container">
          <table className="tabla-tipos">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tipos.map((t) => (
                <tr key={t.id_tpo}>
                  <td>{t.id_tpo}</td>
                  <td>{t.nombre}</td>
                  <td>
                    <button className="btn-eliminar" onClick={() => handleEliminar(t.id_tpo)}>Borrar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Nuevo Tipo de Producto</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre:</label>
                <input 
                  type="text" 
                  value={nuevoTipo} 
                  onChange={(e) => setNuevoTipo(e.target.value)} 
                  placeholder="Ej. Marisco Fresco" 
                  required 
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} style={{background:'#ccc', border:'none', padding:'10px', borderRadius:'6px', cursor:'pointer'}}>Cancelar</button>
                <button type="submit" className="btn-crear">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tipos;