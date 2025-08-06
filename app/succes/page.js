import { Suspense } from 'react';
import SuccesClient from './SuccesClient';

export default function Success() {
  return (
    <Suspense fallback={
      <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center', color: '#fff' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            <p>Chargement...</p>
          </div>
        </div>
      </div>
    }>
      <SuccesClient />
    </Suspense>
  );
}