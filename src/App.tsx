import CustomerPortalPage from './pages/CustomerPortalPage';
import CustomerPortalPageClean from './pages/CustomerPortalPageClean';

function App() {
  const isClean = window.location.pathname === '/clean';
  return isClean ? <CustomerPortalPageClean /> : <CustomerPortalPage />;
}

export default App;
