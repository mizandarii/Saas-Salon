import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import pb from '../api/pocketbase';
import { useAuth } from '../hooks/useAuth';
import BookingForm from './BookingForm';
import './PortalPages.css';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState('');
  const isMounted = useRef(true);

  const getMasterFirstName = (master) => {
    const fullName = master?.display_name?.trim();
    if (!fullName) return 'Unknown';
    return fullName.split(' ')[0];
  };

  const fetchBookings = async () => {
    try {
      const data = await pb.collection('reservations').getFullList({
        filter: `client_id = "${user.id}"`,
        expand: 'service_id,service_id.master',
        sort: 'start',
      });
      const sortedData = [...data].sort((a, b) => {
        const dateA = a.start ? new Date(a.start).getTime() : 0;
        const dateB = b.start ? new Date(b.start).getTime() : 0;
        return dateA - dateB;
      });
      if (isMounted.current) setBookings(sortedData);
    } catch (err) {
      // Ignore auto-cancellation errors when component unmounts
      if (err.message?.includes('autocancelled')) return;
      alert(err.message || 'Failed to load bookings');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchBookings();
  }, [user]);

  const handleBookingCreated = () => {
    fetchBookings();
  };

  const getBookingStatus = (bookingStart) => {
    if (!bookingStart) return 'unknown';
    const bookingTime = new Date(bookingStart).getTime();
    return bookingTime >= Date.now() ? 'upcoming' : 'past';
  };

  const handleCancelBooking = async (bookingId) => {
    const shouldCancel = window.confirm('Cancel this booking?');
    if (!shouldCancel) return;

    setCancellingId(bookingId);
    try {
      await pb.collection('reservations').delete(bookingId);
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    } finally {
      setCancellingId('');
    }
  };

  if (loading) {
    return (
      <div className="portal-page">
        <header className="portal-header">
          <div className="portal-container">
            <Link to="/" className="portal-logo-link">✨ Salon Studio</Link>
          </div>
        </header>
        <main className="portal-main">
          <p className="portal-loading">Loading your bookings...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <header className="portal-header">
        <div className="portal-container portal-header-content">
          <Link to="/" className="portal-logo-link">✨ Salon Studio</Link>
          <span className="portal-header-label">My Bookings</span>
        </div>
      </header>

      <main className="portal-main portal-main-wide">
        <section className="portal-card bookings-card">
          <h2>Upcoming and past bookings</h2>
          {bookings.length === 0 ? (
            <p className="portal-subtitle">No bookings yet. Create your first one below.</p>
          ) : (
            <ul className="bookings-list">
              {bookings.map((b, index) => {
                const service = b.expand?.service_id;
                const master = service?.expand?.master;
                const status = getBookingStatus(b.start);
                return (
                  <li
                    key={b.id}
                    className={`booking-item booking-item-${status} booking-item-animated`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="booking-item-head">
                      <h3>{service?.name || b.service_id}</h3>
                      <span className={`booking-status booking-status-${status}`}>
                        {status === 'upcoming' ? 'Upcoming' : status === 'past' ? 'Past' : 'Unknown'}
                      </span>
                    </div>
                    <p>
                      {typeof service?.duration_minutes === 'number'
                        ? `${service.duration_minutes} min`
                        : 'Duration unavailable'}
                    </p>
                    <p>Staff: {getMasterFirstName(master)}</p>
                    <p>Date: {b.start ? new Date(b.start).toLocaleString() : '-'}</p>
                    {status === 'upcoming' && (
                      <button
                        type="button"
                        className="booking-cancel-btn"
                        onClick={() => handleCancelBooking(b.id)}
                        disabled={cancellingId === b.id}
                      >
                        {cancellingId === b.id ? 'Cancelling...' : 'Cancel booking'}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="portal-card booking-form-card">
          <BookingForm onBookingCreated={handleBookingCreated} />
        </section>
      </main>
    </div>
  );
}