import { useEffect, useState } from 'react';
import { Typography } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

interface Props {
  lockedUntil: string; // ISO datetime
  onExpired: () => void;
}

/** Shows a live countdown for a reserved (locked) appointment slot. */
export default function LockCountdown({ lockedUntil, onExpired }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((new Date(lockedUntil).getTime() - Date.now()) / 1000)),
  );

  useEffect(() => {
    if (secondsLeft <= 0) {
      onExpired();
      return;
    }
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          onExpired();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [lockedUntil, onExpired, secondsLeft]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isUrgent = secondsLeft <= 60;

  return (
    <Typography.Text type={isUrgent ? 'danger' : 'warning'} strong>
      <ClockCircleOutlined style={{ marginRight: 6 }} />
      Slot reserved — confirm within {minutes}:{String(seconds).padStart(2, '0')}
    </Typography.Text>
  );
}
