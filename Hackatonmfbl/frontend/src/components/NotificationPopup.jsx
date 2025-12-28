import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NotificationPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Don't show if on main operator dashboard
    if (location.pathname === '/operator-dashboard') {
      setIsVisible(false);
      return;
    }

    // Only show on operator pages (operator-home and answered-questions)
    const isOperatorPage = location.pathname === '/operator-home' || location.pathname === '/answered-questions';
    
    if (!isOperatorPage) {
      setIsVisible(false);
      return;
    }

    // Check for unanswered questions every 5 minutes
    const checkQuestions = async () => {
      try {
        const response = await fetch('http://localhost:5235/api/questions/count');
        const data = await response.json();
        
        if (data.success && data.count > 0) {
          setQuestionCount(data.count);
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error checking questions:', error);
      }
    };

    // Initial check after 5 seconds (give user time to navigate)
    const initialTimeout = setTimeout(checkQuestions, 5000);

    // Then check every 5 minutes
    const interval = setInterval(checkQuestions, 5 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [location.pathname]);

  const handleGoToDashboard = () => {
    setIsVisible(false);
    navigate('/operator-dashboard');
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Dark overlay background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          padding: '32px',
          width: '400px',
          zIndex: 9999,
          animation: 'popIn 0.4s ease-out',
          border: '3px solid #f57c00'
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            color: '#999',
            cursor: 'pointer',
            padding: '0',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f5f5f5';
            e.target.style.color = '#333';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = '#999';
          }}
        >
          ×
        </button>

        {/* Icon and Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{
            position: 'relative',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src="/bell.svg" alt="Bell" style={{ width: '40px', height: '40px', filter: 'brightness(0) invert(1)' }} />
            {questionCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#d32f2f',
                color: 'white',
                borderRadius: '12px',
                padding: '6px 10px',
                fontSize: '14px',
                fontWeight: '700',
                minWidth: '28px',
                textAlign: 'center',
                border: '2px solid white'
              }}>
                {questionCount > 9 ? '9+' : questionCount}
              </span>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '22px',
              fontWeight: '700',
              color: '#1a4d8f'
            }}>
              Neodgovoreni upiti
            </h3>
            <p style={{
              margin: '0',
              fontSize: '16px',
              color: '#666',
              fontWeight: '500'
            }}>
              {questionCount} {questionCount === 1 ? 'pitanje čeka' : 'pitanja čekaju'}
            </p>
          </div>
        </div>

        {/* Message */}
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '15px',
          lineHeight: '1.6',
          color: '#333',
          textAlign: 'center'
        }}>
          Imate neodgovorene upite, odgovorite na njih što prije.
        </p>

        {/* Button */}
        <button
          onClick={handleGoToDashboard}
          style={{
            width: '100%',
            padding: '16px 24px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(74, 144, 226, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.3)';
          }}
        >
          Idi na kontrolnu tablu →
        </button>

        {/* Animation styles */}
        <style>
          {`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            
            @keyframes popIn {
              from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.8);
              }
              to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
              }
            }
          `}
        </style>
      </div>
    </>
  );
};

export default NotificationPopup;