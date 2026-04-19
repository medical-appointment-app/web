import { useCallback, useState } from 'react';
import {
  Alert, Button, Card, DatePicker, List, Result, Space, Spin, Steps,
  Typography, message,
} from 'antd';
import { CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { appointmentsApi } from '../api/appointments';
import { doctorApi } from '../api/doctor';
import LockCountdown from '../components/LockCountdown';
import { useLocale } from '../i18n/LocaleContext';
import type { AppointmentResponse, AvailableSlotResponse } from '../types';

const { Title, Text } = Typography;

const DOCTOR_ID_PLACEHOLDER = '1'; // Fallback if /api/doctor is unreachable.

// ── Pure helpers ─────────────────────────────────────────────────────────────

const toScheduledAt = (slot: AvailableSlotResponse): string =>
  `${slot.date}T${slot.time}`;

const filterUpcomingSlots = (
  slots: AvailableSlotResponse[],
  selectedDate: Dayjs | null,
): AvailableSlotResponse[] => {
  const now = dayjs();
  const isToday = selectedDate?.isSame(now, 'day') ?? false;
  if (!isToday) return slots;
  return slots.filter((slot) => dayjs(toScheduledAt(slot)).isAfter(now));
};

const resolveDoctorId = async (): Promise<string> => {
  try {
    const doctor = await doctorApi.get();
    return String(doctor.id);
  } catch {
    return DOCTOR_ID_PLACEHOLDER;
  }
};

// ── Wizard state + actions ───────────────────────────────────────────────────

function useBookingWizard() {
  const { t } = useLocale();
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [slots, setSlots] = useState<AvailableSlotResponse[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [reserved, setReserved] = useState<AppointmentResponse | null>(null);
  const [confirmed, setConfirmed] = useState<AppointmentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = async () => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    setError(null);
    try {
      const data = await appointmentsApi.getSlots(selectedDate.format('YYYY-MM-DD'));
      setSlots(data);
      setStep(1);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSlotsLoading(false);
    }
  };

  const reserveSlot = async (slot: AvailableSlotResponse) => {
    setError(null);
    const doctorId = await resolveDoctorId();
    try {
      const appointment = await appointmentsApi.reserve({
        scheduledAt: toScheduledAt(slot),
        doctorId,
      });
      setReserved(appointment);
      setStep(2);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const confirmReservation = async () => {
    if (!reserved) return;
    setError(null);
    try {
      const appointment = await appointmentsApi.confirm(reserved.id);
      setConfirmed(appointment);
      message.success(t('appt.confirm.success'));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleLockExpired = useCallback(() => {
    setReserved(null);
    setStep(1);
    setError(t('appt.lockExpired'));
  }, [t]);

  return {
    step,
    goToStep: setStep,
    selectedDate,
    setSelectedDate,
    slots,
    slotsLoading,
    reserved,
    confirmed,
    error,
    clearError: () => setError(null),
    loadSlots,
    reserveSlot,
    confirmReservation,
    handleLockExpired,
  };
}

// ── Main component ───────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const { t } = useLocale();
  const wizard = useBookingWizard();

  if (wizard.confirmed) {
    return <BookingResultView appointment={wizard.confirmed} />;
  }

  const stepTitles = [
    t('appt.step.pickDate'),
    t('appt.step.pickSlot'),
    t('appt.step.confirm'),
  ];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Title level={3}>{t('appt.title')}</Title>

      <Steps
        current={wizard.step}
        items={stepTitles.map((title) => ({ title }))}
        style={{ marginBottom: 40 }}
      />

      {wizard.error && (
        <Alert
          type="error"
          message={wizard.error}
          closable
          onClose={wizard.clearError}
          style={{ marginBottom: 24 }}
        />
      )}

      {wizard.step === 0 && (
        <PickDateStep
          selectedDate={wizard.selectedDate}
          loading={wizard.slotsLoading}
          onDateChange={wizard.setSelectedDate}
          onNext={wizard.loadSlots}
        />
      )}

      {wizard.step === 1 && (
        <PickSlotStep
          selectedDate={wizard.selectedDate}
          slots={wizard.slots}
          loading={wizard.slotsLoading}
          onSelectSlot={wizard.reserveSlot}
          onChangeDate={() => wizard.goToStep(0)}
        />
      )}

      {wizard.step === 2 && wizard.reserved && (
        <ConfirmStep
          appointment={wizard.reserved}
          onConfirm={wizard.confirmReservation}
          onBack={() => wizard.goToStep(1)}
          onLockExpired={wizard.handleLockExpired}
        />
      )}
    </div>
  );
}

// ── Step components ──────────────────────────────────────────────────────────

interface PickDateStepProps {
  selectedDate: Dayjs | null;
  loading: boolean;
  onDateChange: (date: Dayjs | null) => void;
  onNext: () => void;
}

function PickDateStep({ selectedDate, loading, onDateChange, onNext }: PickDateStepProps) {
  const { t } = useLocale();
  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Text>{t('appt.pickDate.hint')}</Text>
        <DatePicker
          size="large"
          style={{ width: '100%' }}
          disabledDate={(d) => d.isBefore(dayjs(), 'day')}
          value={selectedDate}
          onChange={onDateChange}
        />
        <Button
          type="primary"
          size="large"
          icon={<CalendarOutlined />}
          disabled={!selectedDate}
          loading={loading}
          onClick={onNext}
          block
        >
          {t('appt.pickDate.cta')}
        </Button>
      </Space>
    </Card>
  );
}

interface PickSlotStepProps {
  selectedDate: Dayjs | null;
  slots: AvailableSlotResponse[];
  loading: boolean;
  onSelectSlot: (slot: AvailableSlotResponse) => void;
  onChangeDate: () => void;
}

function PickSlotStep({
  selectedDate, slots, loading, onSelectSlot, onChangeDate,
}: PickSlotStepProps) {
  const { t } = useLocale();
  const visibleSlots = filterUpcomingSlots(slots, selectedDate);
  const isToday = selectedDate?.isSame(dayjs(), 'day') ?? false;

  const emptyMessage =
    isToday && slots.length > 0
      ? t('appt.slots.emptyToday')
      : t('appt.slots.emptyDay');

  return (
    <Card
      title={t('appt.slots.title', {
        date: selectedDate?.format(t('date.longFormat')) ?? '',
      })}
      extra={
        <Button size="small" onClick={onChangeDate}>
          {t('appt.slots.changeDate')}
        </Button>
      }
    >
      {loading ? (
        <Spin />
      ) : visibleSlots.length === 0 ? (
        <Alert type="info" message={emptyMessage} />
      ) : (
        <List
          grid={{ gutter: 12, xs: 2, sm: 3, md: 4 }}
          dataSource={visibleSlots}
          renderItem={(slot) => (
            <List.Item>
              <SlotButton slot={slot} onClick={() => onSelectSlot(slot)} />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
}

interface SlotButtonProps {
  slot: AvailableSlotResponse;
  onClick: () => void;
}

function SlotButton({ slot, onClick }: SlotButtonProps) {
  const { t } = useLocale();
  return (
    <Button block onClick={onClick} style={{ height: 56 }}>
      <div style={{ lineHeight: 1.4 }}>
        <div style={{ fontWeight: 600 }}>{slot.time.slice(0, 5)}</div>
        <div style={{ fontSize: 11, color: '#888' }}>
          {t('appt.slots.minutes', { minutes: slot.durationMinutes })}
        </div>
      </div>
    </Button>
  );
}

interface ConfirmStepProps {
  appointment: AppointmentResponse;
  onConfirm: () => void;
  onBack: () => void;
  onLockExpired: () => void;
}

function ConfirmStep({ appointment, onConfirm, onBack, onLockExpired }: ConfirmStepProps) {
  const { t } = useLocale();
  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {appointment.lockedUntil && (
          <LockCountdown
            lockedUntil={appointment.lockedUntil}
            onExpired={onLockExpired}
          />
        )}

        <LabeledValue label={t('appt.confirm.dateTime')} emphasize>
          {dayjs(appointment.scheduledAt).format(t('date.dayFormat'))}
        </LabeledValue>

        <LabeledValue label={t('appt.confirm.duration')}>
          {t('appt.confirm.durationValue', { minutes: appointment.durationMinutes ?? 0 })}
        </LabeledValue>

        <Space>
          <Button onClick={onBack}>{t('appt.confirm.back')}</Button>
          <Button type="primary" size="large" onClick={onConfirm}>
            {t('appt.confirm.cta')}
          </Button>
        </Space>
      </Space>
    </Card>
  );
}

interface LabeledValueProps {
  label: string;
  emphasize?: boolean;
  children: React.ReactNode;
}

function LabeledValue({ label, emphasize, children }: LabeledValueProps) {
  return (
    <div>
      <Text type="secondary">{label}</Text>
      <div style={emphasize ? { fontSize: 20, fontWeight: 600 } : undefined}>
        {children}
      </div>
    </div>
  );
}

interface BookingResultViewProps {
  appointment: AppointmentResponse;
}

function BookingResultView({ appointment }: BookingResultViewProps) {
  const { t } = useLocale();
  return (
    <Result
      status="success"
      icon={<CheckCircleOutlined />}
      title={t('appt.result.title')}
      subTitle={t('appt.result.subtitle', {
        when: dayjs(appointment.scheduledAt).format(t('date.dayFormat')),
        minutes: appointment.durationMinutes ?? 0,
      })}
      extra={
        <Button type="primary" onClick={() => window.location.replace('/my-appointments')}>
          {t('appt.result.viewMine')}
        </Button>
      }
    />
  );
}
