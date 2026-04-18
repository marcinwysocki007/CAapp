import { useState } from 'react';
import CustomerPortalPage from './pages/CustomerPortalPage';
import CustomerPortalPageClean from './pages/CustomerPortalPageClean';

function App() {
  const [showClean, setShowClean] = useState(false);
  return (
    <>
      {/* Dev toggle — fixed top-right */}
      <button
        onClick={() => setShowClean((v) => !v)}
        style={{
          position: 'fixed', top: 12, right: 12, zIndex: 9999,
          background: showClean ? '#9B1FA1' : '#fff',
          color: showClean ? '#fff' : '#9B1FA1',
          border: '1.5px solid #9B1FA1',
          borderRadius: 999, padding: '4px 12px',
          fontSize: 12, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}
      >
        {showClean ? '← Original' : 'Clean →'}
      </button>
      {showClean ? <CustomerPortalPageClean /> : <CustomerPortalPage />}
    </>
  );
}

export default App;
