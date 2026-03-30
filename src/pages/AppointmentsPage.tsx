import { useState, useCallback } from 'react';
import {
  Steps, DatePicker, Button, List, Card, Alert,
  Typography, Space, Spin, message, Result,
} from 'antd';
import { CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { appointmentsApi } from '../api/appointments';
import { doctorApi } from '../api/doctor';
import LockCountdown from '../components/LockCountdown';
import type { AppointmentResponse, AvailableSlotResponse } from '../types';

const { Title, Text } = Typography;
const DOCTOR_ID_PLACEHOLDER = '1'; // Replace with real doctor ID from /api/doctor

const STEPS = ['Pick a date', 'Choose a slot', 'Confirm'];

export default function AppointmentsPage() {
  const [current, setCurrent] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [slots, setSlots] = useState<AvailableSlotResponse[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [reserved, setReserved] = useState<AppointmentResponse | null>(null);
  const [confirmed, setConfirmed] = useState<AppointmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Step 1 → Step 2: load slots for chosen date ───────────────────────────
  const handleDateConfirm = async () => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    setError(null);
    try {
      const data = await appointmentsApi.getSlots(selectedDate.format('YYYY-MM-DD'));
      setSlots(data);
      setCurrent(1);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSlotsLoading(false);
    }
  };

  // ── Step 2 → Step 3: reserve the selected slot ────────────────────────────
  const handleReserve = async (slot: AvailableSlotResponse) => {
    setError(null);

    // Get the doctor ID from the API (cached for simplicity using a one-off call).
    let doctorId = DOCTOR_ID_PLACEHOLDER;
    try {
      const doctor = await doctorApi.get();
      doctorId = String(doctor.id);
    } catch {
      // fall back to placeholder if doctor endpoint is inaccessible
    }

    const scheduledAt = `${slot.date}T${slot.time}`;
    try {
      const appointment = await appointmentsApi.reserve({ scheduledAt, doctorId });
      setReserved(appointment);
      setCurrent(2);
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  // ── Step 3: confirm the reservation ──────────────────────────────────────
  const handleConfirm = async () => {
    if (!reserved) return;
    setError(null);
    try {
      const appointment = await appointmentsApi.confirm(reserved.id);
      setConfirmed(appointment);
      message.success('Appointment confirmed!');
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  // Called by the countdown when the lock expires before confirmation
  const handleLockExpired = useCallback(() => {
    setReserved(null);
    setCurrent(1);
    setError('Your hold expired. Please choose a slot again.');
  }, []);

  // ── Completed state ───────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <Result
        status="success"
        icon={<CheckCircleOutlined />}
        title="Appointment Confirmed!"
        subTitle={`Scheduled for ${dayjs(confirmed.scheduledAt).format('dddd, MMMM D YYYY [at] HH:mm')} · ${confirmed.durationMinutes} min`}
        extra={
          <Button type="primary" onClick={() => window.location.replace('/my-appointments')}>
            View My Appointments
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Title level={3}>Book an Appointment</Title>

      <Steps
        current={current}
        items={STEPS.map((title) => ({ title }))}
        style={{ marginBottom: 40 }}
      />

      {error && (
        <Alert
          type="error"
          message={error}
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 24 }}
        />
      )}

      {/* ── Step 0: Pick a date ─────────────────────────────────────────── */}
      {current === 0 && (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Text>Select the date you'd like to visit.</Text>
            <DatePicker
              size="large"
              style={{ width: '100%' }}
              disabledDate={(d) => d.isBefore(dayjs(), 'day')}
              value={selectedDate}
              onChange={setSelectedDate}
            />
            <Button
              type="primary"
              size="large"
              icon={<CalendarOutlined />}
              disabled={!selectedDate}
              loading={slotsLoading}
              onClick={handleDateConfirm}
              block
            >
              See Available Slots
            </Button>
          </Space>
        </Card>
      )}

      {/* ── Step 1: Choose a slot ───────────────────────────────────────── */}
      {current === 1 && (
        <Card
          title={`Available slots on ${selectedDate?.format('MMMM D, YYYY')}`}
          extra={
            <Button size="small" onClick={() => setCurrent(0)}>
              ← Change date
            </Button>
          }
        >
          {slotsLoading ? (
            <Spin />
          ) : slots.length === 0 ? (
            <Alert type="info" message="No slots available on this day. Please try another date." />
          ) : (
            <List
              grid={{ gutter: 12, xs: 2, sm: 3, md: 4 }}
              dataSource={slots}
              renderItem={(slot) => (
                <List.Item>
                  <Button
                    block
                    onClick={() => handleReserve(slot)}
                    style={{ height: 56 }}
                  >
                    <div style={{ lineHeight: 1.4 }}>
                      <div style={{ fontWeight: 600 }}>{slot.time.slice(0, 5)}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{slot.durationMinutes} min</div>
                    </div>
                  </Button>
                </List.Item>
              )}
            />
          )}
        </Card>
      )}

      {/* ── Step 2: Confirm ─────────────────────────────────────────────── */}
      {current === 2 && reserved && (
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {reserved.lockedUntil && (
              <LockCountdown
                lockedUntil={reserved.lockedUntil}
                onExpired={handleLockExpired}
              />
            )}

            <div>
              <Text type="secondary">Date &amp; time</Text>
              <div style={{ fontSize: 20, fontWeight: 600 }}>
                {dayjs(reserved.scheduledAt).format('dddd, MMMM D YYYY [at] HH:mm')}
              </div>
            </div>

            <div>
              <Text type="secondary">Duration</Text>
              <div>{reserved.durationMinutes} minutes</div>
            </div>

            <Space>
              <Button onClick={() => setCurrent(1)}>← Back</Button>
              <Button type="primary" size="large" onClick={handleConfirm}>
                Confirm Appointment
              </Button>
            </Space>
          </Space>
        </Card>
      )}
    </div>
  );
}
