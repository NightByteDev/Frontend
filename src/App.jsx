import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Menu from './pages/Menu.jsx';
import Registro from './pages/Registro.jsx';
import Tienda from './pages/Tienda.jsx';
import Compradores from './pages/Compradores.jsx';
import Productos from './pages/Productos.jsx';
import Tipos from './pages/Tipos.jsx';
import Lotes from './pages/Lotes.jsx';
import Compras from './pages/Compras.jsx';

function App() {
  return (
    <div className="App">
      <Routes>
      
        <Route path="/" element={<Home />} />
        
        <Route path="/home" element={<Home />} />
        
        <Route path="/login" element={<Login />} />

        <Route path="/registro" element={<Registro />} />

        <Route path="/tienda" element={<Tienda />} />

        <Route path="/menu" element={<Menu />} />

        <Route path="/productos" element={<Productos />} />

        <Route path="/tipos" element={<Tipos />} />

        <Route path="/lotes" element={<Lotes />} />

        <Route path="/compradores" element={<Compradores />} />

        <Route path="/compras" element={<Compras />} />
      
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;