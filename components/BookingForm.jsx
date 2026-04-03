import { useEffect, useState, useRef } from 'react';
import pb from '../api/pocketbase';
import { useAuth } from '../hooks/useAuth';

function isAllowedBookingTime(dateTimeValue) {
  const selectedDate = new Date(dateTimeValue);
  const hour = selectedDate.getHours();
  return hour >= 7 && hour < 20;
}

export default function BookingForm({ onBookingCreated }) {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [start, setStart] = useState('');
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const servicesData = await pb.collection('services').getFullList();
        if (isMounted.current) setServices(servicesData);
      } catch (err) {
        // Ignore auto-cancellation errors when component unmounts
        if (err.message?.includes('autocancelled')) return;
        alert(err.message || 'Failed to load services');
      }
    };
    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceId || !start) return alert('Please fill in all fields');
    if (!isAllowedBookingTime(start)) {
      return alert('Bookings are only available between 07:00 and 19:59.');
    }

    setLoading(true);
    try {
      const booking = await pb.collection('reservations').create({
        client_id: user.id,
        service_id: serviceId,
        start: new Date(start).toISOString(),
      });
      alert('Booking created successfully!');
      setServiceId('');
      setStart('');
      if (onBookingCreated) onBookingCreated(booking);
    } catch (err) {
      alert(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Booking</h2>

      <label>Service:</label>
      <select value={serviceId} onChange={e => setServiceId(e.target.value)}>
        <option value="">Select a service</option>
        {services.map(s => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.duration_minutes} min / {(s.cost_cents || 0) / 100} EUR)
          </option>
        ))}
      </select>

      <label>Date and time:</label>
      <input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
      <small>Available booking time: 07:00-19:59</small>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create booking'}
      </button>
    </form>
  );
}