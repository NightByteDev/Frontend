import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Lotes.css';

const Lotes = () => {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id_lte: null,
    kilos: '',
    numero_cajas: '',
    precio_kilo_salida: ''
  });

  const cargarLotes = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/lotes');
      setLotes(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron cargar los lotes', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLotes();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const abrirModalCrear = () => {
    setFormData({ id_lte: null, kilos: '', numero_cajas: '', precio_kilo_salida: '' });
    setShowModal(true);
  };

  const abrirModalEditar = (lote) => {
    setFormData({
      id_lte: lote.id_lte,
      kilos: lote.kilos,
      numero_cajas: lote.numero_cajas,
      precio_kilo_salida: lote.precio_kilo_salida
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowModal(false);

    try {
      if (formData.id_lte) {
        await axios.put(`http://localhost:3000/api/lotes/${formData.id_lte}`, formData);
        Swal.fire('Actualizado', 'Lote modificado correctamente', 'success');
      } else {
        await axios.post('http://localhost:3000/api/lotes', formData);
        Swal.fire('Guardado', 'Lote registrado correctamente', 'success');
      }
      cargarLotes();
    } catch (error) {
      console.error(error);
      setShowModal(true);
      Swal.fire('Error', 'No se pudo guardar el lote', 'error');
    }
  };

  const handleEliminar = async (id) => {
    if (await Swal.fire({ title: '¿Borrar lote?', text: "Si hay productos asociados a este lote, no se podrá borrar.", icon: 'warning', showCancelButton: true }).then(r => r.isConfirmed)) {
      try {
        await axios.delete(`http://localhost:3000/api/lotes/${id}`);
        Swal.fire('Eliminado', '', 'success');
        cargarLotes();
      } catch (error) {
        const msg = error.response?.data?.error || 'Error al eliminar';
        Swal.fire('Error', msg, 'error');
      }
    }
  };

  return (
    <div className="lotes-container">
      <div className="admin-header">
        <h1>Gestión de Lotes</h1>
        <div className="header-actions">
          <button onClick={abrirModalCrear} className="btn-crear">＋ Nuevo Lote</button>
          <button onClick={() => navigate('/menu')} className="btn-volver">Volver</button>
        </div>
      </div>

      {loading ? <p>Cargando...</p> : (
        <div className="tabla-container">
          <table className="tabla-lotes">
            <thead>
              <tr>
                <th>#</th>
                <th>ID Real</th>
                <th>Fecha Entrada</th>
                <th>Kilos</th>
                <th>Cajas</th>
                <th>Precio Salida (kg)</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lotes.map((l, index) => (
                <tr key={l.id_lte}>
                  <td style={{fontWeight: 'bold', color: '#888'}}>{index + 1}</td>
                  <td>#{l.id_lte}</td>
                  <td>{new Date(l.fecha).toLocaleDateString()}</td>
                  <td>{l.kilos} kg</td>
                  <td>{l.numero_cajas}</td>
                  <td>${l.precio_kilo_salida}</td>
                  <td style={{display: 'flex', gap: '10px'}}>
                    <button 
                      className="btn-editar" 
                      onClick={() => abrirModalEditar(l)}>
                      Editar
                    </button>
                    <button className="btn-eliminar" onClick={() => handleEliminar(l.id_lte)}>Borrar</button>
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
            <h2>{formData.id_lte ? 'Editar Lote #' + formData.id_lte : 'Registrar Nuevo Lote'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Kilos Totales:</label>
                  <input type="number" step="0.01" name="kilos" value={formData.kilos} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Número de Cajas:</label>
                  <input type="number" name="numero_cajas" value={formData.numero_cajas} onChange={handleInputChange} required />
                </div>
                <div className="form-group" style={{gridColumn: '1 / -1'}}>
                  <label>Precio de Salida (por kg):</label>
                  <input type="number" step="0.01" name="precio_kilo_salida" value={formData.precio_kilo_salida} onChange={handleInputChange} required placeholder="$0.00" />
                </div>
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

export default Lotes;