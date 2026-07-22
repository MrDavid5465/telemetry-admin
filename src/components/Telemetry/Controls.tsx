import React, { useEffect, useRef } from 'react';
import { useMatch } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { useLiveTelemetry } from './useLiveTelemetry';
import { REGISTER_CAR } from './clientsQueries';
import { GET_KNOWN_CARS } from './Groups/queries';

const StatusDot: React.FC<{ active: boolean }> = ({ active }) => (
  <div
    title={active ? 'Telemetry active' : 'No telemetry'}
    style={{
      display: 'flex',
      alignItems: 'center',
      height: '3.85em',
      paddingRight: '0.924em',
      paddingLeft: '0.385em',
      flexShrink: 0,
    }}
  >
    <div style={{
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: active ? '#4caf50' : '#666',
    }} />
  </div>
);

const TelemetryControls: React.FC = () => {
  const onDashRoute = !!useMatch('/telemetryadmin/dashboards/:name/show');
  const { car, simStatus } = useLiveTelemetry(onDashRoute);
  const isActive = simStatus === 'Active';

  const [registerCar] = useMutation(REGISTER_CAR, {
    refetchQueries: [{ query: GET_KNOWN_CARS }],
  });
  const lastCarRef = useRef('');
  useEffect(() => {
    if (onDashRoute || !car || simStatus !== 'Active') return;
    if (car !== lastCarRef.current) {
      lastCarRef.current = car;
      registerCar({ variables: { name: car } });
    }
  }, [car, simStatus, onDashRoute, registerCar]);

  return <StatusDot active={isActive} />;
};

export default TelemetryControls;
