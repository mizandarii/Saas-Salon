import { useEffect, useState, useRef } from 'react';
import pb from '../api/pocketbase';
import { useAuth } from '../hooks/useAuth';
import BookingForm from './BookingForm';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);

  const fetchBookings = async () => {
    try {
      const data = await pb.collection('reservations').getFullList({
        filter: `client_id = "${user.id}"`,
      });
      if (isMounted.current) setBookings(data);
    } catch (err) {
      // Ignore auto-cancellation errors when component unmounts
      if (err.message?.includes('autocancelled')) return;
      alert(err.message || 'Ошибка при получении бронирований');
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const servicesData = await pb.collection('services').getFullList();
      if (isMounted.current) setServices(servicesData);
      const staffData = await pb.collection('users').getFullList({
        filter: `role_id = "staff_role_id"`
      });
      if (isMounted.current) setStaff(staffData);
    } catch (err) {
      // Ignore auto-cancellation errors when component unmounts
      if (err.message?.includes('autocancelled')) return;
      console.error('Error fetching services/staff:', err);
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
    fetchData();
  }, [user]);

  const handleBookingCreated = (newBooking) => {
    setBookings(prev => [...prev, newBooking]);
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div>
      <h2>My Bookings</h2>
      <ul>
        {bookings.map(b => {
          const service = services.find(s => s.id === b.service_id);
          const staffMember = staff.find(s => s.id === b.staff_id);
          return (
            <li key={b.id}>
              Услуга: {service?.name || b.service_id} ({service?.duration_minutes} мин) <br />
              Мастер: {staffMember?.first_name} {staffMember?.last_name || ''} <br />
              Дата: {new Date(b.date).toLocaleString()}
            </li>
          );
        })}
      </ul>
      <BookingForm onBookingCreated={handleBookingCreated} />
    </div>
  );
}