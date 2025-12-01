import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import './Tienda.css';

const Tienda = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    } else {
      navigate('/login');
      return;
    }

    const fetchProductos = async () => {
      try {
        const response = await axios.get('https://api-lonja-backend.onrender.com/api/especies');
        setProductos(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar productos:", error);
        Swal.fire('Error', 'No se pudo cargar el catálogo.', 'error');
        setLoading(false);
      }
    };

    fetchProductos();
  }, [navigate]);

  const getImagenUrl = (imgName) => {
    if (!imgName) return 'https://via.placeholder.com/300x400?text=Sin+Imagen';
    if (imgName.startsWith('http')) return imgName;
    return `/imagenes/${imgName}`;
  };

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    
    Swal.fire({
      icon: 'success',
      title: 'Sesión Cerrada',
      text: '¡Vuelve pronto!',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      navigate('/');
    });
  };

  const handleComprar = async (producto) => {

    const precioKilo = parseFloat(producto.Lote?.precio_kilo_salida || 0);
    const kilosTotales = parseFloat(producto.Lote?.kilos || 0);
    const cajas = producto.Lote?.numero_cajas || 0;
    
    const precioTotalLote = (precioKilo * kilosTotales).toFixed(2);

    if (kilosTotales <= 0) {
        return Swal.fire('Agotado', 'Este lote ya no tiene stock disponible.', 'warning');
    }

    const confirmacion = await Swal.fire({
      title: `¿Comprar Lote Completo de ${producto.nombre}?`,
      html: `
        <div style="text-align: left; font-size: 1rem; color: #333; margin-bottom: 10px; line-height: 1.6;">
            <p> <strong>Lote #${producto.id_lte}</strong></p>
            <p> <strong>Peso Total:</strong> ${kilosTotales} kg</p>
            <p> <strong>Cajas:</strong> ${cajas}</p>
            <p> <strong>Precio por Kg:</strong> $${precioKilo}</p>
            <hr style="margin: 10px 0; border: 0; border-top: 1px solid #ccc;">
            <p style="font-size: 1.2rem; color: #0056b3;"><strong>Total a Pagar: $${precioTotalLote}</strong></p>
        </div>
      `,
      imageUrl: getImagenUrl(producto.imagen),
      imageHeight: 150,
      imageAlt: producto.nombre,
      showCancelButton: true,
      confirmButtonColor: '#27ae60',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Comprar lote',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        const datosVenta = {
          precio_kilo_final: precioKilo,
          precio_total: precioTotalLote,
          codigo_cpr: usuario.id,
          id_lte: producto.id_lte
        };

        await axios.post('https://api-lonja-backend.onrender.com/api/compras', datosVenta);

        Swal.fire({
          icon: 'success',
          title: '¡Lote Adquirido!',
          html: `Has comprado el lote completo de <b>${producto.nombre}</b>.<br/>Total pagado: <b>$${precioTotalLote}</b>`,
          confirmButtonColor: '#0056b3'
        });

      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo procesar la compra. Intenta más tarde.', 'error');
      }
    }
  };

  return (
    <div className="tienda-container">
      <header className="tienda-header">
        <div className="header-content">
          <h1>Pescados y Mariscos Frescos</h1>
          <p>Bienvenido, <strong>{usuario?.nombre}</strong></p>
        </div>
        <div className="user-actions">
          <button onClick={cerrarSesion} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </header>

      {loading ? (
        <div className="loading-msg">Cargando la pesca del dia...</div>
      ) : (
        <div className="catalogo-grid">
          {productos.map((prod) => {
            
            const totalLote = (parseFloat(prod.Lote?.precio_kilo_salida || 0) * parseFloat(prod.Lote?.kilos || 0)).toFixed(2);

            return (
              <div key={prod.id_epe} className="producto-card">
                
                <div className="producto-img-box">
                  <img 
                    src={getImagenUrl(prod.imagen)} 
                    alt={prod.nombre} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x400?text=Foto+No+Disponible'; }} 
                  />
                </div>

                <div className="producto-info">
                  <h3 className="producto-nombre">{prod.nombre}</h3>
                  
                  <div className="producto-detalles-extra" style={{marginBottom: '15px', fontSize: '0.9rem', color: '#555', textAlign: 'left', lineHeight: '1.4'}}>
                      <p><strong>Tipo:</strong> {prod.Tipo ? prod.Tipo.nombre : 'General'}</p>
                      <p><strong>Lote:</strong> #{prod.id_lte} ({prod.Lote ? prod.Lote.numero_cajas : 0} cajas)</p>
                      <p><strong>Peso Total:</strong> {prod.Lote ? prod.Lote.kilos : 0} kg</p>
                      <p style={{color: '#27ae60', fontWeight: 'bold', marginTop: '5px'}}>
                        Total Lote: ${totalLote}
                      </p>
                  </div>

                  <div className="producto-footer">
                    <div className="producto-precio" style={{fontSize: '1rem'}}>
                      ${prod.Lote ? prod.Lote.precio_kilo_salida : '0.00'} / kg
                    </div>
                    
                    <button className="btn-comprar" onClick={() => handleComprar(prod)}>
                      Comprar Lote
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
          
          {productos.length === 0 && (
            <p style={{textAlign:'center', width:'100%', fontSize:'1.2rem', color:'#666'}}>
              No hay productos disponibles por el momento.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Tienda;