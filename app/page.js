import { Suspense } from 'react';
import HomeClient from './HomeClient';

export default function Page() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
        <p className="text-white">Chargement...</p>
      </div>
    }>
      <HomeClient />
    </Suspense>
  );
}