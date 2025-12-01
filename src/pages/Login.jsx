import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Login.css';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://api-lonja-backend.onrender.com/api/admin/login', {
        correo,
        password
      });

      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido Admin!',
        text: response.data.mensaje,
        timer: 1500,
        showConfirmButton: false
      });

      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
      localStorage.setItem('rol', 'admin');
      navigate('/menu'); 

    } catch (error) {

      if (error.response && error.response.status === 404) {
        try {
          const responseComprador = await axios.post('https://api-lonja-backend.onrender.com/api/compradores/login', {
            correo,
            password
          });

          Swal.fire({
            icon: 'success',
            title: '¡Bienvenido a la Tienda!',
            text: responseComprador.data.mensaje,
            timer: 1500,
            showConfirmButton: false
          });

          localStorage.setItem('usuario', JSON.stringify(responseComprador.data.usuario));
          localStorage.setItem('rol', 'comprador');
          navigate('/tienda');

        } catch (errorComprador) {
          const msg = errorComprador.response?.data?.error || 'Credenciales incorrectas';
          Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: msg,
            confirmButtonColor: '#0056b3'
          });
        }

      } else {
        const mensajeError = error.response?.data?.error || 'Error al conectar con el servidor';
        Swal.fire({
          icon: 'error',
          title: 'Error de Acceso',
          text: mensajeError,
          confirmButtonColor: '#0056b3'
        });
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">

        <h2>Bienvenido</h2>
        <p className="subtitle">Inicia sesión en Lonja de Veracruz</p>

        <form onSubmit={handleLogin}>
          
          <div className="input-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required 
              placeholder="nombre@ejemplo.com"/>
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••"/>
          </div>
          
          <button 
            type="submit"
            className="btn-login">
            Iniciar Sesión
          </button>
        </form>

        <hr className="divider" />

        <div className="register">
          ¿Quieres comprar y no tienes cuenta?
          <button 
            onClick={() => navigate('/registro')}
            className="link-btn">
            Regístrate aquí
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;