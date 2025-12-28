import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import BankForm from './pages/BankForm';
import OperatorDashboard from './pages/OperatorDashboard';
import AnsweredQuestions from './pages/AnsweredQuestions';
import NotificationPopup from './components/NotificationPopup';
import FAQPage from './pages/FAQPage';
import OperatorHome from './pages/OperatorHome';
import RateOperator from './pages/Rateoperator';

function App() {
  return (
    <Router>
      <div>
        {/* Global notification popup - shows on operator-home and answered-questions pages */}
        <NotificationPopup />
        
        <Routes>
          <Route path="/zahtjevi" element={<BankForm />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/operator-home" element={<OperatorHome />} />
          <Route path="/operator-dashboard" element={<OperatorDashboard />} />
          <Route path="/answered-questions" element={<AnsweredQuestions />} />
          <Route path="/rate-operator" element={<RateOperator />} />
          <Route path="/" element={
            <div style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h1 style={{ color: '#1a4d8f', marginBottom: '20px', fontSize: '36px' }}>Dobrodošli u MF Banka</h1>
                <p style={{ color: '#5a7ba6', marginBottom: '32px', fontSize: '16px' }}>Odaberite opciju</p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link 
                    to="/faq" 
                    style={{
                      display: 'inline-block',
                      padding: '14px 32px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white',
                      background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)'
                    }}
                  >
                    📋 Često postavljana pitanja
                  </Link>
                  <Link 
                    to="/zahtjevi" 
                    style={{
                      display: 'inline-block',
                      padding: '14px 32px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white',
                      background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
                    }}
                  >
                    Kontakt forma
                  </Link>
                  <Link 
                    to="/operator-home" 
                    style={{
                      display: 'inline-block',
                      padding: '14px 32px',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white',
                      background: 'linear-gradient(135deg, #1a4d8f 0%, #2d6bb8 100%)',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(26, 77, 143, 0.3)'
                    }}
                  >
                    👨‍💼 Operator Portal
                  </Link>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
