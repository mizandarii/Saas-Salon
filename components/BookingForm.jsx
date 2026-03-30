import { useEffect, useState } from 'react';
import pb from '../api/pocketbase';
import { useAuth } from '../hooks/useAuth';

export default function BookingForm({ onBookingCreated }) {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем услуги
        const servicesData = await pb.collection('services').getFullList();
        setServices(servicesData);

        // Получаем мастеров (staff)
        const staffData = await pb.collection('users').getFullList({
          filter: `role_id = "staff_role_id"` // замените на реальный ID роли staff
        });
        setStaff(staffData);
      } catch (err) {
        alert(err.message || 'Ошибка при загрузке данных');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceId || !staffId || !date) return alert('Заполните все поля');
    setLoading(true);
    try {
      const booking = await pb.collection('reservations').create({
        client_id: user.id,
        service_id: serviceId,
        staff_id: staffId,
        date,
      });
      alert('Бронирование создано!');
      setServiceId('');
      setStaffId('');
      setDate('');
      if (onBookingCreated) onBookingCreated(booking);
    } catch (err) {
      alert(err.message || 'Ошибка при создании брони');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Создать бронь</h2>

      <label>Услуга:</label>
      <select value={serviceId} onChange={e => setServiceId(e.target.value)}>
        <option value="">Выберите услугу</option>
        {services.map(s => (
          <option key={s.id} value={s.id}>
            {s.name} ({s.duration_minutes} мин / {s.price_cents / 100}€)
          </option>
        ))}
      </select>

      <label>Мастер:</label>
      <select value={staffId} onChange={e => setStaffId(e.target.value)}>
        <option value="">Выберите мастера</option>
        {staff.map(s => (
          <option key={s.id} value={s.id}>
            {s.first_name} {s.last_name || ''}
          </option>
        ))}
      </select>

      <label>Дата и время:</label>
      <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} />

      <button type="submit" disabled={loading}>
        {loading ? 'Создаём...' : 'Создать бронь'}
      </button>
    </form>
  );
}