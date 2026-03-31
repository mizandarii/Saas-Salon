import { useEffect, useState, useRef } from 'react';
import pb from '../api/pocketbase';
import { useAuth } from '../hooks/useAuth';

export default function BookingForm({ onBookingCreated }) {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [start, setStart] = useState('');
  const [availabilityHint, setAvailabilityHint] = useState('Select a service and date to see available hours.');
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);
  const NIGHT_START_MINUTES = 20 * 60;
  const NIGHT_END_MINUTES = 8 * 60;

  const getPocketBaseErrorMessage = (err, fallback) => {
    if (err?.status === 403) {
      return 'You are not allowed to create this booking. Please contact support.';
    }

    const fieldErrors = err?.response?.data;
    if (fieldErrors && typeof fieldErrors === 'object') {
      const details = Object.entries(fieldErrors)
        .map(([field, value]) => `${field}: ${value?.message || 'invalid value'}`)
        .join('; ');
      return details ? `Could not create booking. ${details}` : fallback;
    }

    return err?.response?.message || fallback;
  };

  const extractMinutes = (dateLike) => {
    const text = String(dateLike || '');
    const timePart = text.includes('T') ? text.split('T')[1] : text.split(' ')[1];
    if (!timePart) return null;

    const cleanTime = timePart.slice(0, 5);
    const [hoursRaw, minutesRaw] = cleanTime.split(':');
    const hours = Number(hoursRaw);
    const minutes = Number(minutesRaw);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    return hours * 60 + minutes;
  };

  const formatMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const isBlockedNightTime = (minutes) => (
    minutes >= NIGHT_START_MINUTES || minutes < NIGHT_END_MINUTES
  );

  const getAvailabilityWindowsForDate = async (service, selectedStart) => {
    const masterId = service?.master;
    if (!masterId) return [];

    const bookingDate = new Date(selectedStart);
    const weekday = bookingDate.getDay();
    const weekdayAlt = weekday === 0 ? 7 : weekday;

    const [windowsByJsWeekday, windowsByIsoWeekday] = await Promise.all([
      pb.collection('availability').getFullList({
        filter: `master = "${masterId}" && weekday = ${weekday}`,
      }),
      pb.collection('availability').getFullList({
        filter: `master = "${masterId}" && weekday = ${weekdayAlt}`,
      }),
    ]);

    return [
      ...windowsByJsWeekday,
      ...windowsByIsoWeekday.filter(
        (w) => !windowsByJsWeekday.some((x) => x.id === w.id),
      ),
    ];
  };

  const isWithinAvailability = async (service, selectedStart) => {
    if (!service?.master) {
      return { ok: false, reason: 'Selected service has no assigned staff member.' };
    }

    const requestedMinutes = extractMinutes(selectedStart);

    if (requestedMinutes === null) {
      return { ok: false, reason: 'Invalid booking time format.' };
    }

    if (isBlockedNightTime(requestedMinutes)) {
      return { ok: false, reason: 'Bookings are allowed only between 08:00 and 20:00.' };
    }

    const windows = await getAvailabilityWindowsForDate(service, selectedStart);

    if (!windows.length) {
      return { ok: false, reason: 'No availability configured for this staff member on this day.' };
    }

    const hasMatchingWindow = windows.some((slot) => {
      const startMinutes = extractMinutes(slot.start);
      const endMinutes = extractMinutes(slot.end);
      if (startMinutes === null || endMinutes === null) return false;

      return requestedMinutes >= startMinutes && requestedMinutes < endMinutes;
    });

    if (!hasMatchingWindow) {
      return { ok: false, reason: 'Selected time is outside staff availability.' };
    }

    return { ok: true };
  };

  useEffect(() => {
    const updateAvailabilityHint = async () => {
      if (!serviceId || !start) {
        if (isMounted.current) {
          setAvailabilityHint('Select a service and date to see available hours.');
        }
        return;
      }

      const selectedService = services.find((s) => s.id === serviceId);
      if (!selectedService) {
        if (isMounted.current) setAvailabilityHint('Select a valid service.');
        return;
      }

      const requestedMinutes = extractMinutes(start);
      if (requestedMinutes !== null && isBlockedNightTime(requestedMinutes)) {
        if (isMounted.current) {
          setAvailabilityHint('Night bookings are disabled. Choose a time between 08:00 and 20:00.');
        }
        return;
      }

      try {
        const windows = await getAvailabilityWindowsForDate(selectedService, start);
        if (!isMounted.current) return;

        if (!windows.length) {
          setAvailabilityHint('No availability for this staff member on the selected day.');
          return;
        }

        const formatted = windows
          .map((slot) => {
            const startMinutes = extractMinutes(slot.start);
            const endMinutes = extractMinutes(slot.end);
            if (startMinutes === null || endMinutes === null) return null;
            return `${formatMinutes(startMinutes)} - ${formatMinutes(endMinutes)}`;
          })
          .filter(Boolean)
          .join(', ');

        setAvailabilityHint(
          formatted
            ? `Available windows: ${formatted}`
            : 'Availability is configured, but time format is invalid in one or more slots.',
        );
      } catch (_err) {
        if (isMounted.current) {
          setAvailabilityHint('Could not load availability windows.');
        }
      }
    };

    updateAvailabilityHint();
  }, [serviceId, start, services]);

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
    setLoading(true);
    try {
      const startDate = new Date(start);
      if (Number.isNaN(startDate.getTime())) {
        alert('Invalid date and time');
        return;
      }

      const selectedService = services.find((s) => s.id === serviceId);
      if (!selectedService) {
        alert('Selected service was not found');
        return;
      }

      const availabilityCheck = await isWithinAvailability(selectedService, start);
      if (!availabilityCheck.ok) {
        alert(availabilityCheck.reason);
        return;
      }

      const booking = await pb.collection('reservations').create({
        client_id: user.id,
        service_id: serviceId,
        start: startDate.toISOString(),
      });
      alert('Booking created successfully!');
      setServiceId('');
      setStart('');
      if (onBookingCreated) onBookingCreated(booking);
    } catch (err) {
      console.error('Reservation create failed', {
        status: err?.status,
        response: err?.response,
      });
      alert(getPocketBaseErrorMessage(err, 'Failed to create booking'));
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
      <p>{availabilityHint}</p>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create booking'}
      </button>
    </form>
  );
}