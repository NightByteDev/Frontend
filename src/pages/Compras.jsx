import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Compras.css';



const Compras = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [showModalFactura, setShowModalFactura] = useState(false);
  
  const [showModalReporte, setShowModalReporte] = useState(false);
  const [reporteData, setReporteData] = useState([]);

  const [showModalDetallesDia, setShowModalDetallesDia] = useState(false);
  const [comprasDelDia, setComprasDelDia] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');

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

  const cargarCompras = async (silencioso = false) => {
    try {
      const response = await axios.get('https://api-lonja-backend.onrender.com/api/compras');
      setCompras(response.data);
      if (!silencioso) setLoading(false);
    } catch (error) {
      console.error(error);
      if (!silencioso) {
        Swal.fire('Error', 'No se pudo cargar el historial de ventas', 'error');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    cargarCompras();
    
    // Actualización automática cada 5 segundos
    const intervalo = setInterval(() => {
      cargarCompras(true); 
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  const generarReporte = () => {
    const reporte = compras.reduce((acc, compra) => {
      const fechaKey = new Date(compra.fecha).toLocaleDateString('es-MX');
      
      if (!acc[fechaKey]) {
        acc[fechaKey] = { 
          fecha: fechaKey, 
          totalVentas: 0,
          listaCompras: []
        };
      }
      
      acc[fechaKey].totalVentas += 1;
      acc[fechaKey].listaCompras.push(compra);
      
      return acc;
    }, {});

    const arrayReporte = Object.values(reporte).sort((a, b) => {
       const dateA = new Date(a.fecha.split('/').reverse().join('-'));
       const dateB = new Date(b.fecha.split('/').reverse().join('-'));
       return dateB - dateA; 
    });

    setReporteData(arrayReporte);
    setShowModalReporte(true);
  };

  const verDetallesDia = (dia) => {
    setFechaSeleccionada(dia.fecha);
    setComprasDelDia(dia.listaCompras);
    setShowModalDetallesDia(true);
  };

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
        await axios.delete(`https://api-lonja-backend.onrender.com/api/compras/${id}`);
        Swal.fire('Eliminado', 'Registro eliminado correctamente.', 'success');
        cargarCompras();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
      }
    }
  };

  const verFactura = (compra) => {
    setFacturaSeleccionada(compra);
    setShowModalFactura(true);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha desconocida';
    return new Date(fecha).toLocaleString('es-MX', {
      day: '2-digit', month: 'long', year: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getImgUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/100x100?text=Sin+Foto';
    if (img.startsWith('http')) return img; 
    return `/imagenes/${img}`;
  };

  return (
    <div className="compras-container">
      <div className="admin-header">
        <h1>Historial de Ventas</h1>
        
        <div style={{display: 'flex', gap: '10px'}}>
            <button 
              onClick={generarReporte} 
              className="btn-reporte-dia" 
              style={{
                backgroundColor: '#27ae60', color: 'white', border: 'none', 
                padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
              }}>
              Reportes Diarios
            </button>
            <button onClick={() => navigate('/menu')} className="btn-volver">← Volver al Menú</button>
        </div>
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

      {showModalReporte && (
        <div className="modal-overlay">
          <div className="modal-content-factura" style={{maxWidth: '600px', padding: '20px'}}>
            <h2 style={{color:'#0056b3', textAlign:'center', marginBottom:'20px'}}>Reporte de Ventas por Día</h2>
            
            <table className="tabla-compras" style={{width: '100%', minWidth: 'auto'}}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Ventas Realizadas</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reporteData.map((dia, idx) => (
                  <tr key={idx}>
                    <td>{dia.fecha}</td>
                    <td>{dia.totalVentas}</td>
                    <td>
                        <button 
                            className="btn-ver" 
                            onClick={() => verDetallesDia(dia)}
                            style={{fontSize: '0.8rem', padding: '5px 10px'}}>
                            Ver Detalles
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{textAlign:'center', marginTop:'20px'}}>
              <button className="btn-cerrar" onClick={() => setShowModalReporte(false)}>Cerrar Reporte</button>
            </div>
          </div>
        </div>
      )}

      {showModalDetallesDia && (
        <div className="modal-overlay" style={{zIndex: 2100}}>
            <div className="modal-content-factura" style={{maxWidth: '700px', padding: '20px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
                    <h2 style={{color:'#0056b3', margin:0}}>Ventas del {fechaSeleccionada}</h2>
                    <button className="btn-cerrar" onClick={() => setShowModalDetallesDia(false)} style={{padding:'5px 10px'}}>X</button>
                </div>

                <table className="tabla-compras" style={{width: '100%', minWidth: 'auto', fontSize:'0.9rem'}}>
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Cliente</th>
                            <th>Producto</th>
                            <th>Lote</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comprasDelDia.map((c) => (
                            <tr key={c.id_cmp}>
                                <td>{new Date(c.fecha).toLocaleTimeString()}</td>
                                <td>{c.Comprador?.nombre} {c.Comprador?.apellido_paterno}</td>
                                <td>{c.Lote?.Especies?.[0]?.nombre || 'N/A'}</td>
                                <td>#{c.id_lte}</td>
                                <td style={{fontWeight:'bold', color:'#27ae60'}}>${parseFloat(c.precio_total).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {showModalFactura && facturaSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content-factura">
            <div className="hoja-factura">
              <div className="factura-header">
                <h2>Lonja de Veracruz</h2>
                <p>Fecha de Emisión: {formatearFecha(facturaSeleccionada.fecha)}</p>
                <p>Folio de Venta: <strong>#{facturaSeleccionada.id_cmp.toString().padStart(6, '0')}</strong></p>
              </div>

              <div className="factura-info">
                <div className="info-grupo">
                  <h4>Datos del Cliente:</h4>
                  <p>{facturaSeleccionada.Comprador?.nombre || 'N/A'} {facturaSeleccionada.Comprador?.apellido_paterno || 'N/A'} {facturaSeleccionada.Comprador?.apellido_materno || 'N/A'}</p>
                  <p>{facturaSeleccionada.Comprador?.correo || 'N/A'}</p>
                  <p>{facturaSeleccionada.Comprador?.direccion || 'N/A'}</p>
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
                      {(parseFloat(facturaSeleccionada.precio_total) / parseFloat(facturaSeleccionada.precio_kilo_final)).toFixed(2)} kg
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
                </p>
              </div>
            </div>

            <div className="modal-actions-factura">
              <button className="btn-cerrar" onClick={() => setShowModalFactura(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compras;