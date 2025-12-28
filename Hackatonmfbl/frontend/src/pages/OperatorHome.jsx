import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OperatorHome = () => {
  const navigate = useNavigate();
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    // Fetch question count
    const fetchCount = async () => {
      try {
        const response = await fetch('http://localhost:5235/api/questions/count');
        const data = await response.json();
        
        if (data.success) {
          setTotalCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching count:', error);
      }
    };

    fetchCount();
    
    // Refresh count every 5 seconds
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBellClick = () => {
    navigate('/operator-dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafb' }}>
      {/* Navbar */}
      <nav style={{
        background: 'linear-gradient(135deg, #1a4d8f 0%, #2d6bb8 100%)',
        padding: '0 40px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
<div 
  onClick={() => navigate('/operator-home')}
  style={{
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
    letterSpacing: '-0.5px',
    cursor: 'pointer'
  }}
>
  MF Banka
</div>
        
        <button
          onClick={handleBellClick}
          style={{
            position: 'relative',
            background: 'rgba(255, 255, 255, 0.15)',
            border: 'none',
            borderRadius: '12px',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <img src="/bell.svg" alt="Bell" style={{ width: '24px', height: '24px', filter: 'brightness(0) invert(1)' }} />
          
          {totalCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#d32f2f',
              color: 'white',
              borderRadius: '10px',
              padding: '2px 7px',
              fontSize: '12px',
              fontWeight: '700',
              minWidth: '20px',
              textAlign: 'center',
              border: '2px solid #1a4d8f'
            }}>
              {totalCount > 9 ? '9+' : totalCount}
            </span>
          )}
        </button>
      </nav>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 70px)',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%)' 
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '60px 80px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          maxWidth: '600px'
        }}>
          {/* Icon */}
<div
  style={{
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e8f0fe 0%, #f0f7ff 100%)',
    margin: '0 auto 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden' // important so the image clips cleanly into the circle
  }}
>
  <img
    src="/bankguy.png"
    alt="Bank guy"
    style={{
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      objectFit: 'cover'
    }}
  />
</div>

          {/* Welcome Text */}
          <h1 style={{
            margin: '0 0 16px 0',
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a4d8f'
          }}>
            Dobrodošli, Marko!
          </h1>
          
          <p style={{
            margin: '0 0 40px 0',
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#5a7ba6'
          }}>
            {totalCount > 0 
              ? `Trenutno imate ${totalCount} ${totalCount === 1 ? 'neodgovoreno pitanje' : 'neodgovorenih pitanja'} koja čekaju na vaš odgovor.`
              : 'Trenutno nemate neodgovorenih pitanja.'
            }
          </p>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <button
              onClick={() => navigate('/operator-dashboard')}
              style={{
                padding: '16px 48px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #2d6bb8  0%, #2d6bb8  100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
                position: 'relative'
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
              📊 Idi na kontrolnu tablu
              {totalCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  background: '#d32f2f',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: '2px solid white'
                }}>
                  {totalCount}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/answered-questions')}
              style={{
                padding: '16px 48px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(67, 160, 71, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(67, 160, 71, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(67, 160, 71, 0.3)';
              }}
            >
              📋 Istorija odgovorenih zahtjeva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorHome;