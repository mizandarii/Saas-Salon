import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import pb from '../api/pocketbase';
import './Homepage.css';

export default function Homepage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await pb.collection('services').getFullList({ sort: 'name' });
        if (isMounted.current) setServices(data);
      } catch (err) {
        if (err.message?.includes('autocancelled')) return;
        if (isMounted.current) {
          setError(err.message || 'Failed to load services');
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchServices();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const formatPrice = (service) => {
    if (typeof service?.cost_cents === 'number') {
      return `€${(service.cost_cents / 100).toFixed(2)}`;
    }

    return null;
  };

  return (
    <div className="homepage">
      <header className="header">
        <div className="container">
          <h1 className="logo">✨ Salon Studio</h1>
          <div className="header-actions">
            <Link to="/register" className="login-btn">
              Sign up
            </Link>
            <Link to="/login" className="login-btn">
              Login
            </Link>
          </div>
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
          {loading ? (
            <p className="services-message">Loading services...</p>
          ) : error ? (
            <p className="services-message services-message-error">{error}</p>
          ) : services.length === 0 ? (
            <p className="services-message">No services are available right now.</p>
          ) : (
            <div className="services-grid">
              {services.map(service => (
                <div key={service.id} className="service-card">
                  <h3>{service.name}</h3>
                  <div className="service-details">
                    {typeof service.duration_minutes === 'number' && (
                      <span>{service.duration_minutes} min</span>
                    )}
                    {formatPrice(service) && <span>{formatPrice(service)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to book?</h2>
          <p>Sign in to your account to book an appointment</p>
          <div className="cta-actions">
            <Link to="/register" className="cta-btn">
              Create account
            </Link>
            <Link to="/login" className="cta-btn">
              Get Started
            </Link>
          </div>
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
