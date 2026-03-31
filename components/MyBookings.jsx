import { useEffect, useState, useRef } from 'react';
import pb from '../api/pocketbase';
import { useAuth } from '../hooks/useAuth';
import BookingForm from './BookingForm';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
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
      });
      if (isMounted.current) setBookings(data);
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

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>My Bookings</h2>
      <ul>
        {bookings.map(b => {
          const service = b.expand?.service_id;
          const master = service?.expand?.master;
          return (
            <li key={b.id}>
              Service: {service?.name || b.service_id} ({service?.duration_minutes} min) <br />
              Staff: {getMasterFirstName(master)} <br />
              Date: {b.start ? new Date(b.start).toLocaleString() : '-'}
            </li>
          );
        })}
      </ul>
      <BookingForm onBookingCreated={handleBookingCreated} />
    </div>
  );
}