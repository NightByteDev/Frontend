import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const productosDestacados = [
    {
      id: 1,
      nombre: "Almeja Reina",
      precio: "$85.00 / kg",
      desc: "Apreciada por su exquisito sabor y versatilidad culinaria.",
      img: "images/Almejas.jpg"
    },
    {
      id: 2,
      nombre: "Camarón",
      precio: "$120.00 / kg",
      desc: "Ideal para cócteles y platillos gourmet.",
      img: "images/Camaron.jpg"
    },
    {
      id: 3,
      nombre: "Pulpo",
      precio: "$160.00 / kg",
      desc: "Captura del día, perfecto para asar.",
      img: "images/Pulpo.jpg"
    },
    {
      id: 4,
      nombre: "Jaiba Azul",
      precio: "$95.00 / kg",
      desc: "Excelente para caldos y chilpachole.",
      img: "images/Jaiba.jpg"
    }
  ];

  return (
    <div className="home-container">
      
      <div className="top-bar">
        <div className="contact-info">
          <span>📞 (229) 555-0199</span>
          <span>✉️ contacto@lonjadeveracruz.com</span>
          <span>Veracruz, Ver.</span>
        </div>
        <div className="social-links">
          <a href="https://www.facebook.com" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.twitter.com" target="_blank" rel="noreferrer">X</a>
        </div>
      </div>

      <nav className="sticky-nav">
        <div className="logo">
          <h1>Lonja de Veracruz</h1>
        </div>
        <div className="nav-actions">
          <button onClick={() => navigate('/login')} className="btn-nav-login">
            Iniciar Sesión
          </button>
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-content">
          <h2>La Frescura del Mar a tu Negocio</h2>
          <p>Distribuimos la mejor calidad en pescados y mariscos de la región.</p>
        </div>
      </header>

      <section className="info-section">
        <h2>¿Por qué elegirnos?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🌊</span>
            <h3>Calidad Garantizada</h3>
            <p>Nuestros productos provienen directamente de las mejores costas, garantizando frescura diaria.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🚚</span>
            <h3>Logística Eficiente</h3>
            <p>Control de lotes y distribución optimizada para que el producto llegue en perfectas condiciones.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🤝</span>
            <h3>Trato Directo</h3>
            <p>Conectamos directamente con compradores mayoristas y minoristas sin intermediarios innecesarios.</p>
          </div>
        </div>
      </section>
      
      <section className="info-section" style={{backgroundColor: '#f8f9fa'}}>
        <h2>Acerca de Nosotros</h2>
        <p style={{maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem'}}>
            Fundada hace más de 30 años en el puerto de Veracruz, comenzamos como una pequeña embarcación familiar. 
            Hoy somos un referente de la lonja, manteniendo la tradición de calidad y frescura.
        </p>
      </section>

      <section className='info-section'>
        <div className='features-grid'>
            <div className='feature-card'>
                <h3>Nuestra Visión</h3>
                <p>Ser la plataforma de marisco en línea líder en el Golfo de México, reconocida por la excelencia 
                    en el servicio y la sostenibilidad, llevando el sabor del mar a cada rincón del país.
                </p>
            </div>
            <div className='feature-card'>
                <h3>Nuestro Compromiso</h3>
                <p>Nuestro compromiso es doble: con la calidad de nuestros productos, asegurando el mejor manejo 
                    desde la pesca hasta la entrega, y con nuestros clientes, ofreciendo precios justos y transparentes.
                </p>
            </div>
        </div>
      </section>

      <section className="info-section" style={{backgroundColor: '#f8f9fa', color: 'black'}}>
        <h2>Nuestros Horarios</h2>
        <p>Lunes a Sábado: 4:00 AM - 2:00 PM</p>
        <p>Domingos: 6:00 AM - 12:00 PM</p>
      </section>

      <section className="info-section" style={{ backgroundColor: '#fff' }}>
        <h2>Nuestros Productos Destacados</h2>
        <p style={{marginBottom: '2rem', fontSize: '1.1rem', color: '#666'}}>
          Contamos con una gran variedad de productos y una excelente calidad que nuestros clientes respaldan.
        </p>
        
        <div className="products-grid">
          {productosDestacados.map((prod) => (
            <div key={prod.id} className="product-card">
              <div className="product-img-container">
                <img src={prod.img} alt={prod.nombre} />
              </div>
              <div className="product-info">
                <h3>{prod.nombre}</h3>
                <p className="product-desc">{prod.desc}</p>
                <span className="product-price">{prod.precio}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '3rem' }}>
          <button onClick={() => navigate('/tienda')} className="btn-view-more">
            Ver todo el catálogo →
          </button>
        </div>
      </section>

      <footer className="site-footer">
        <p>{new Date().getFullYear()} Sistema Lonja.</p>
      </footer>
    </div>
  );
};

export default Home;