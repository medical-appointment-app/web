import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App';
import { LocaleProvider, useLocale } from './i18n/LocaleContext';

function ThemedApp() {
  const { antdLocale } = useLocale();
  return (
    <ConfigProvider
      locale={antdLocale}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <App />
    </ConfigProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <ThemedApp />
    </LocaleProvider>
  </StrictMode>,
);
