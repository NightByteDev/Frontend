import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Compradores.css';

const Compradores = () => {
  const [compradores, setCompradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  const cargarCompradores = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/compradores');
      setCompradores(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Error al conectar con el servidor.', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCompradores();
  }, []);

  const compradoresFiltrados = compradores.filter((c) => {
    const termino = busqueda.toLowerCase();
    const nombreCompleto = `${c.nombre} ${c.apellido_paterno} ${c.apellido_materno}`.toLowerCase();
    const correo = c.correo.toLowerCase();
    return nombreCompleto.includes(termino) || correo.includes(termino);
  });

  const handleEliminar = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esto. Si el usuario tiene compras, podría dar error.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/compradores/${id}`);
        Swal.fire(
          '¡Eliminado!',
          'El comprador ha sido eliminado.',
          'success'
        );
        cargarCompradores();
      } catch (error) {
        Swal.fire(
          'Error',
          'No se pudo eliminar (posiblemente tiene compras asociadas).',
          'error'
        );
      }
    }
  };

  const handleEditar = (usuario) => {
    setEditingUser({ ...usuario });
  };

  const handleGuardarCambios = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/api/compradores/${editingUser.codigo_cpr}`, editingUser);
      Swal.fire('Actualizado', 'Datos actualizados correctamente.', 'success');
      setEditingUser(null);
      cargarCompradores();
    } catch (error) {
      Swal.fire('Error', 'No se pudo actualizar.', 'error');
    }
  };

  const handleInputChange = (e) => {
    setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
  };

  return (
    <div className="compradores-container">
      <div className="admin-header">
        <h1>Gestión de Compradores</h1>
        <button onClick={() => navigate('/menu')} className="btn-volver">Volver</button>
      </div>

      <div className="buscador-container">
        <input 
          type="text" 
          placeholder="🔍 Buscar por nombre o correo..." 
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-buscador"
        />
      </div>

      {loading ? (
        <p style={{textAlign: 'center'}}>Cargando...</p>
      ) : (
        <div className="tabla-container">
          <table className="tabla-compradores">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre Completo</th>
                <th>Correo</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {compradoresFiltrados.map((c) => (
                <tr key={c.codigo_cpr}>
                  <td>{c.codigo_cpr}</td>
                  <td>{c.nombre} {c.apellido_paterno} {c.apellido_materno}</td>
                  <td>{c.correo}</td>
                  <td>{c.direccion || '-'}</td>
                  <td className="acciones">
                    <button className="btn-editar" onClick={() => handleEditar(c)}>Editar</button>
                    <button className="btn-eliminar" onClick={() => handleEliminar(c.codigo_cpr)}>Borrar</button>
                  </td>
                </tr>
              ))}
              {compradoresFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '20px'}}>
                    No se encontraron resultados para "{busqueda}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Editar Comprador</h2>
            <form onSubmit={handleGuardarCambios}>
              <div className="form-group">
                <label>Nombre:</label>
                <input type="text" name="nombre" value={editingUser.nombre || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Apellido P.:</label>
                <input type="text" name="apellido_paterno" value={editingUser.apellido_paterno || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Apellido M.:</label>
                <input type="text" name="apellido_materno" value={editingUser.apellido_materno || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Correo:</label>
                <input type="email" name="correo" value={editingUser.correo || ''} onChange={handleInputChange} />
              </div>
              <div className="form-group">
                <label>Dirección:</label>
                <input type="text" name="direccion" value={editingUser.direccion || ''} onChange={handleInputChange} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setEditingUser(null)}>Cancelar</button>
                <button type="submit" className="btn-guardar">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compradores;