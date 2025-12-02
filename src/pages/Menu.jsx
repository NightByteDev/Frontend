import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Menu.css';
import Swal from 'sweetalert2'; 

const Menu = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
  const usuarioGuardado = localStorage.getItem('usuario');
  const rol = localStorage.getItem('rol');

    if (!usuarioGuardado) {
      navigate('/');
      return;
    }
    if (rol !== 'admin') {
      navigate('/tienda');
      return;
    }

  setUsuario(JSON.parse(usuarioGuardado));
  }, [navigate]);

  const cerrarSesion = () => {
    localStorage.removeItem('usuario');
    navigate('/');
    
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

  return (
    <div className="menu-container">
      
      <header className="menu-header">
        <h1>Panel de Control</h1>

        <div className="user-info">
          <span>Hola, {usuario?.nombre}</span>
          <button className="btn-logout" onClick={cerrarSesion}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="menu-grid">

        <div className="menu-card" onClick={() => navigate('/compras')}>
          <div className="icon">🛒</div>
          <h3>Compras</h3>
          <p>Ver historial de ventas y reportes diarios.</p>
        </div>

        <div className="menu-card" onClick={() => navigate('/lotes')}>
          <div className="icon">📦</div>
          <h3>Lotes</h3>
          <p>Registrar entrada de producto fresco.</p>
        </div>

        <div className="menu-card" onClick={() => navigate('/productos')}>
          <div className="icon">🐟</div>
          <h3>Productos</h3>
          <p>Gestionar catálogo de pescados y mariscos.</p>
        </div>

        <div className="menu-card" onClick={() => navigate('/compradores')}>
          <div className="icon">👥</div>
          <h3>Compradores</h3>
          <p>Administrar cartera de clientes.</p>
        </div>

        <div className="menu-card" onClick={() => navigate('/tipos')}>
          <div className="icon">🏷️</div>
          <h3>Tipos</h3>
          <p>Categorías de productos.</p>
        </div>

      </div>
    </div>
  );
};

export default Menu;