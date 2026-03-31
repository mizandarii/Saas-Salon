import { Link } from 'react-router-dom';
import './Homepage.css';

export default function Homepage() {
  const services = [
    {
      id: 1,
      name: 'Haircut',
      description: 'Professional haircut and styling',
      price: '$30'
    },
    {
      id: 2,
      name: 'Hair Coloring',
      description: 'Full color or highlights',
      price: '$60'
    },
    {
      id: 3,
      name: 'Manicure',
      description: 'Classic or gel manicure',
      price: '$25'
    },
    {
      id: 4,
      name: 'Pedicure',
      description: 'Relaxing foot treatment',
      price: '$35'
    },
    {
      id: 5,
      name: 'Facial',
      description: 'Rejuvenating facial treatment',
      price: '$50'
    },
    {
      id: 6,
      name: 'Hair Extensions',
      description: 'Premium hair extensions',
      price: '$100'
    }
  ];

  return (
    <div className="homepage">
      <header className="header">
        <div className="container">
          <h1 className="logo">✨ Salon Studio</h1>
          <Link to="/login" className="login-btn">
            Login
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <h2>Welcome to Salon Studio</h2>
          <p>Discover our premium salon services</p>
        </div>
      </section>

      <section className="services">
        <div className="container">
          <h2>Our Services</h2>
          <div className="services-grid">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="price">{service.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to book?</h2>
          <p>Sign in to your account to book an appointment</p>
          <Link to="/login" className="cta-btn">
            Get Started
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 Salon Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
