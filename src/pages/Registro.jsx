import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Registro.css';

const Registro = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    direccion: '',
    correo: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/compradores', formData);
      alert('¡Registro exitoso! Ahora puedes iniciar sesión como Comprador.');
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert('Error al registrar: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="registro-container">
      <div className="registro-box">
        
        <h2 className="registro-title">Registro para Nuevos Usuarios</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="registro-grid">

            <div className="col-full">
              <label className="registro-label">Nombre(s)</label>
              <input 
                type="text" name="nombre" required
                value={formData.nombre} onChange={handleChange}
                className="registro-input" placeholder="Ej. Juan Carlos"
              />
            </div>

            <div>
              <label className="registro-label">Apellido Paterno</label>
              <input 
                type="text" name="apellido_paterno" required
                value={formData.apellido_paterno} onChange={handleChange}
                className="registro-input" placeholder="Ej. Pérez"
              />
            </div>

            <div>
              <label className="registro-label">Apellido Materno</label>
              <input 
                type="text" name="apellido_materno" required
                value={formData.apellido_materno} onChange={handleChange}
                className="registro-input" placeholder="Ej. López"
              />
            </div>

            <div className="col-full">
              <label className="registro-label">Dirección</label>
              <input 
                type="text" name="direccion" required
                value={formData.direccion} onChange={handleChange}
                className="registro-input" placeholder="Calle, Número, Colonia, Ciudad"
              />
            </div>

            <div className="col-full">
              <label className="registro-label">Correo Electrónico</label>
              <input 
                type="email" name="correo" required
                value={formData.correo} onChange={handleChange}
                className="registro-input" placeholder="juan@ejemplo.com"
              />
            </div>

            <div className="col-full">
              <label className="registro-label">Contraseña</label>
              <input 
                type="password" name="password" required
                value={formData.password} onChange={handleChange}
                className="registro-input" placeholder="••••••••"
              />
            </div>

          </div>

          <button type="submit" className="registro-button">
            Registrarse
          </button>
        </form>

        <button onClick={() => navigate('/login')} className="registro-back">
          ← Volver al Login
        </button>

      </div>
    </div>
  );
};

export default Registro;