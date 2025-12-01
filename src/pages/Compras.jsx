import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Compras.css';

const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const cargarCompras = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/compras');
      setCompras(response.data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo cargar el historial de ventas', 'error');
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCompras();
  }, []);

  const handleEliminar = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar registro de venta?',
      text: "Esto afectará los reportes financieros. Úsalo solo para corregir errores.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Borrar venta',
      cancelButtonText: 'Cancelar'
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/api/compras/${id}`);
        Swal.fire('Eliminado', 'Registro eliminado correctamente.', 'success');
        cargarCompras();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
      }
    }
  };

  const verFactura = (compra) => {
    setFacturaSeleccionada(compra);
    setShowModal(true);
  };

  // Helper para formato de fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha desconocida';
    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Helper para imágenes
  const getImgUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/100x100?text=Sin+Foto';
    if (img.startsWith('http')) return img; 
    return `/imagenes/${img}`;
  };

  return (
    <div className="compras-container">
      <div className="admin-header">
        <h1>Historial de Ventas</h1>
        <button onClick={() => navigate('/menu')} className="btn-volver">← Volver al Menú</button>
      </div>

      {loading ? <p style={{textAlign:'center'}}>Cargando reportes...</p> : (
        <div className="tabla-container">
          <table className="tabla-compras">
            <thead>
              <tr>
                <th>#</th>
                <th>Fecha</th>
                <th>Comprador</th>
                <th>Producto Vendido</th>
                <th>Lote</th>
                <th>Total Venta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((c, index) => {
              
                const compradorNombre = c.Comprador ? `${c.Comprador.nombre} ${c.Comprador.apellido_paterno}` : 'Cliente Eliminado';

                const lote = c.Lote || {}; 
                const especies = lote.Especies || [];
                const producto = especies.length > 0 ? especies[0] : null;
                
                const nombreProducto = producto ? producto.nombre : (c.Lote ? `Lote #${c.id_lte}` : 'Producto no disponible');
                const imgProducto = producto ? producto.imagen : null;

                return (
                  <tr key={c.id_cmp}>
                    <td style={{fontWeight:'bold', color:'#888'}}>{index + 1}</td>
                    <td>{formatearFecha(c.fecha)}</td>
                    <td>
                      <div style={{fontWeight:'bold'}}>{compradorNombre}</div>
                      <small style={{color:'#666'}}>{c.Comprador?.correo || 'Sin correo'}</small>
                    </td>
                    <td>
                      <div className="detalle-producto">
                        {imgProducto && <img src={getImgUrl(imgProducto)} alt="" className="thumb-img" />}
                        <span>{nombreProducto}</span>
                      </div>
                    </td>
                    <td>#{c.id_lte}</td>
                    <td>
                      <span className="total-tag">${parseFloat(c.precio_total).toFixed(2)}</span>
                    </td>
                    <td className="acciones">
                      <button className="btn-ver" onClick={() => verFactura(c)}>Ver Factura</button>
                      <button className="btn-eliminar" onClick={() => handleEliminar(c.id_cmp)}>Borrar</button>
                    </td>
                  </tr>
                );
              })}
              {compras.length === 0 && (
                <tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}>No hay ventas registradas aún.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && facturaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content-factura">
            
            <div className="hoja-factura" id="factura-impresa">
              <div className="factura-header">
                <h2>Lonja de Veracruz</h2>
                <p>Fecha de Emisión: {formatearFecha(facturaSeleccionada.fecha)}</p>
                <p>Folio de Venta: <strong>#{facturaSeleccionada.id_cmp.toString().padStart(6, '0')}</strong></p>
              </div>

              <div className="factura-info">
                <div className="info-grupo">
                  <h4>Datos del Cliente:</h4>
                  <p>{facturaSeleccionada.Comprador?.nombre || 'Consumidor'} {facturaSeleccionada.Comprador?.apellido_paterno || 'N/A'} {facturaSeleccionada.Comprador?.apellido_materno || 'N/A'}</p>
                  <p>{facturaSeleccionada.Comprador?.correo || 'Sin correo'}</p>
                  <p>{facturaSeleccionada.Comprador?.direccion || 'Sin dirección registrada'}</p>
                </div>
                <div className="info-grupo" style={{textAlign: 'right'}}>
                  <h4>Detalles de Origen:</h4>
                  <p>Lote ID: #{facturaSeleccionada.id_lte}</p>
                  <p>Tipo: {facturaSeleccionada.Lote?.Especies?.[0]?.Tipo?.nombre || 'General'}</p>
                  <p>Cajas Lote: {facturaSeleccionada.Lote?.numero_cajas || 'N/A'}</p>
                  <p>Peso por Caja: {facturaSeleccionada.Lote?.kilos && facturaSeleccionada.Lote?.numero_cajas? (facturaSeleccionada.Lote.kilos / facturaSeleccionada.Lote.numero_cajas).toFixed(2) + ' kg': 'N/A'}</p>
                  <p>Peso Total: {facturaSeleccionada.Lote?.kilos || 'N/A'} kg</p>
                </div>
              </div>

              <table className="tabla-factura">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Cantidad (kg)</th>
                    <th>Precio Unit.</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      {facturaSeleccionada.Lote?.Especies?.[0]?.nombre || 'Producto de Mar'}
                      <br/>
                      <small style={{color:'#666'}}>Calidad Premium - Frescura Garantizada</small>
                    </td>
                    <td>
                      {
                        (parseFloat(facturaSeleccionada.precio_kilo_final) > 0)
                        ? (parseFloat(facturaSeleccionada.precio_total) / parseFloat(facturaSeleccionada.precio_kilo_final)).toFixed(2)
                        : '0.00'
                      } kg
                    </td>
                    <td>${parseFloat(facturaSeleccionada.precio_kilo_final).toFixed(2)}</td>
                    <td>${parseFloat(facturaSeleccionada.precio_total).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="factura-footer">
                <div className="total-line">
                  Total Pagado: ${parseFloat(facturaSeleccionada.precio_total).toFixed(2)}
                </div>
                
                <p style={{marginTop:'30px', fontSize:'0.8rem', fontStyle:'italic', color:'#555'}}>
                  ¡Gracias por su compra! <br/>
                  Este documento es un comprobante de venta simplificado.
                </p>
              </div>
            </div>

            <div className="modal-actions-factura">
              <button className="btn-cerrar" onClick={() => setShowModal(false)}>Cerrar</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Compras;