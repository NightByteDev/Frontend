import { Navigate } from 'react-router-dom';

const RutaProtegida = ({ children, rolRequerido }) => {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const rol = localStorage.getItem('rol');

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (rolRequerido && rol !== rolRequerido) {
    
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RutaProtegida;