import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import './Productos.css';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [tipos, setTipos] = useState([]); 
  const [lotes, setLotes] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (!usuarioGuardado) {
      navigate('/');
      return;
    }
    const rol = localStorage.getItem('rol');
    if (rol !== 'admin') {
      navigate('/tienda'); 
    }

  }, [navigate]);

  const [formData, setFormData] = useState({
    id_epe: null,
    nombre: '',
    id_tpo: '',
    id_lte: ''
  });

  // Estados para manejar la imagen
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);

  const cargarDatos = async () => {
    try {
      const [resProd, resTipos, resLotes] = await Promise.all([
        axios.get('https://api-lonja-backend.onrender.com/api/especies'),
        axios.get('https://api-lonja-backend.onrender.com/api/tipos'),
        axios.get('https://api-lonja-backend.onrender.com/api/lotes')
      ]);

      setProductos(resProd.data);
      setTipos(resTipos.data);
      setLotes(resLotes.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudieron cargar los datos.', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenArchivo(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  // CREAR
  const abrirModalCrear = () => {
    setFormData({ id_epe: null, nombre: '', id_tpo: '', id_lte: '' });
    setImagenArchivo(null);
    setImagenPreview(null);
    setShowModal(true);
  };

  // EDITAR
  const abrirModalEditar = (prod) => {
    setFormData({
      id_epe: prod.id_epe,
      nombre: prod.nombre,
      id_tpo: prod.id_tpo,
      id_lte: prod.id_lte
    });
    setImagenArchivo(null);
    setImagenPreview(getImgUrl(prod.imagen));
    setShowModal(true);
  };

  // Guaradr
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.id_tpo || !formData.id_lte) {
      return Swal.fire('Atención', 'Nombre, Tipo y Lote son obligatorios', 'warning');
    }

    const dataToSend = new FormData();
    dataToSend.append('nombre', formData.nombre);
    dataToSend.append('id_tpo', formData.id_tpo);
    dataToSend.append('id_lte', formData.id_lte);
    
    if (imagenArchivo) {
      dataToSend.append('imagen', imagenArchivo);
    }

    setShowModal(false);

    try {
      Swal.fire({ 
        title: 'Subiendo a la Nube...', 
        text: 'Estamos procesando tu imagen, por favor espera.', 
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading() 
      });

      if (formData.id_epe) {
        await axios.put(`https://api-lonja-backend.onrender.com/api/especies/${formData.id_epe}`, dataToSend);
      } else {
        await axios.post('https://api-lonja-backend.onrender.com/api/especies', dataToSend);
      }

      Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'El producto se ha registrado correctamente en el sistema.',
        timer: 2000,
        showConfirmButton: false
      });
      
      cargarDatos(); 
      
      setImagenArchivo(null);
      setImagenPreview(null);

    } catch (error) {
      console.error(error);
      
      setShowModal(true);
      
      Swal.fire({
        icon: 'error',
        title: 'Hubo un error',
        text: error.response?.data?.error || 'No se pudo guardar el producto. Revisa tu conexión.'
      });
    }
  };

  const handleEliminar = async (id) => {
    if (await Swal.fire({ title: '¿Borrar producto?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Borrar', cancelButtonText: 'Cancelar' }).then(r => r.isConfirmed)) {
      try {
        await axios.delete(`https://api-lonja-backend.onrender.com/api/especies/${id}`);
        Swal.fire('Eliminado', '', 'success');
        cargarDatos();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar', 'error');
      }
    }
  };

  const getImgUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/300x200?text=Sin+Foto';
    if (img.startsWith('http')) return img; // URL de Cloudinary
    return `/imagenes/${img}`;
  };

  return (
    <div className="productos-container">
      <div className="admin-header">
        <h1>Gestión de Productos</h1>
        <div style={{display:'flex', gap:'10px'}}>
            <button onClick={abrirModalCrear} className="btn-crear">＋ Nuevo Producto</button>
            <button onClick={() => navigate('/menu')} style={{background:'transparent', border:'1px solid #666', borderRadius:'6px', padding:'10px', cursor:'pointer'}}>Volver</button>
        </div>
      </div>

      {loading ? <p>Cargando inventario...</p> : (
        <div className="admin-grid">
          {productos.map(prod => (
            <div key={prod.id_epe} className="admin-card">
              <img src={getImgUrl(prod.imagen)} alt={prod.nombre} className="card-img-top" />
              <div className="card-body">
                <h3>{prod.nombre}</h3>
                <div className="card-details">
                  <p><strong>Tipo:</strong> {prod.Tipo ? prod.Tipo.nombre : 'Sin Tipo'}</p>
                  <p><strong>Lote:</strong> #{prod.id_lte} (${prod.Lote ? prod.Lote.precio_kilo_salida : '0'}/kg)</p>
                </div>
                <div className="card-actions">
                  <button className="btn-editar" onClick={() => abrirModalEditar(prod)}>Editar</button>
                  <button className="btn-eliminar" onClick={() => handleEliminar(prod.id_epe)}>Borrar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{formData.id_epe ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label>Nombre del Producto:</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required placeholder="Ej. Huachinango" />
              </div>

              <div className="form-group">
                <label>Imagen del Producto:</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  style={{padding: '5px'}}/>
                
                {imagenPreview && (
                  <div style={{marginTop:'10px', textAlign:'center'}}>
                    <p style={{fontSize:'0.8rem', color:'#666'}}>Vista Previa:</p>
                    <img src={imagenPreview} alt="Preview" className="preview-img" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Tipo de Producto:</label>
                <select name="id_tpo" value={formData.id_tpo} onChange={handleInputChange} required>
                  <option value="">Seleccione un tipo...</option>
                  {tipos.map(t => (
                    <option key={t.id_tpo} value={t.id_tpo}>{t.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Lote de Origen (Stock/Precio):</label>
                <select name="id_lte" value={formData.id_lte} onChange={handleInputChange} required>
                  <option value="">Seleccione un lote...</option>
                  {lotes.map(l => (
                    <option key={l.id_lte} value={l.id_lte}>
                      Lote #{l.id_lte} - ${l.precio_kilo_salida}/kg ({l.kilos}kg)
                    </option>
                  ))}
                </select>
              </div>

              <div style={{display:'flex', justifyContent:'flex-end', gap:'10px', marginTop:'20px'}}>
                <button type="button" onClick={() => setShowModal(false)} style={{background:'#ccc', border:'none', padding:'10px 20px', borderRadius:'6px', cursor:'pointer'}}>Cancelar</button>
                <button type="submit" className="btn-crear">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;