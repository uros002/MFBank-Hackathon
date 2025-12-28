import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AnsweredQuestions = () => {
  const navigate = useNavigate();
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

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
  useEffect(() => {
    fetchAnsweredQuestions();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnsweredQuestions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnsweredQuestions = async () => {
    try {
      const response = await fetch('http://localhost:5235/api/questions/answered');
      const data = await response.json();
      
      if (data.success) {
        setAnsweredQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching answered questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('sr-Latn-BA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const QuestionCard = ({ question }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        onClick={() => setSelectedQuestion(question)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          border: '2px solid #e8f0fe',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: isHovered 
            ? '0 6px 20px rgba(0, 0, 0, 0.1)' 
            : '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #e8f4e8 0%, #f0f8f0 100%)',
            color: '#2e7d32',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600'
          }}>
            {question.category}
          </div>
          <span style={{
            fontSize: '12px',
            color: '#43a047',
            fontWeight: '600',
            background: '#e8f4e8',
            padding: '4px 12px',
            borderRadius: '12px'
          }}>
            ✓ Odgovoreno
          </span>
        </div>
        
        <div style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#1a4d8f',
          marginBottom: '8px'
        }}>
          {question.name} {question.surname}
        </div>
        
        <div style={{
          fontSize: '14px',
          color: '#5a7ba6',
          lineHeight: '1.5',
          marginBottom: '12px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {question.question}
        </div>
        
        <div style={{
          paddingTop: '12px',
          borderTop: '1px solid #e8f0fe',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#666'
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>📞 {question.phone}</span>
            <span>🏢 {question.office}</span>
          </div>
          <span style={{ fontWeight: '500' }}>
            {formatDate(question.answeredAt)}
          </span>
        </div>
      </div>
    );
  };

  const QuestionDetailModal = ({ question, onClose }) => {
    if (!question) return null;

    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
              color: 'white',
              padding: '24px 32px',
              borderRadius: '16px 16px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <h2 style={{ margin: '0', fontSize: '24px', fontWeight: '700' }}>
                Odgovoreno pitanje
              </h2>
              <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                {formatDate(question.answeredAt)}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                fontSize: '28px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '32px' }}>
            {/* Customer Info */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a4d8f', marginBottom: '12px' }}>
                Informacije o klijentu
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Ime i prezime</div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>{question.name} {question.surname}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Telefon</div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>📞 {question.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Email</div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>
                    {question.email || 'Nije dostupan'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Poslovnica</div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>🏢 {question.office}</div>
                </div>
              </div>
            </div>

            {/* Category */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Kategorija</div>
              <div style={{
                display: 'inline-block',
                background: '#e8f0fe',
                color: '#357abd',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {question.category}
              </div>
            </div>

            {/* Question */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a4d8f', marginBottom: '12px' }}>
                Pitanje
              </h3>
              <div style={{
                background: '#f8fafb',
                padding: '16px',
                borderRadius: '8px',
                border: '2px solid #e8f0fe',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {question.question}
              </div>
            </div>

            {/* Operator Answer */}
            {question.operatorAnswer && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a4d8f', marginBottom: '12px' }}>
                  Napomena operatora
                </h3>
                <div style={{
                  background: '#e8f4e8',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '2px solid #c8e6c9',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  {question.operatorAnswer}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div style={{
              background: '#f5f5f5',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#666'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Primljeno:</strong> {formatDate(question.submittedAt)}
              </div>
              <div>
                <strong>Odgovoreno:</strong> {formatDate(question.answeredAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh',background: 'linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%)'  }}>
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

      {/* Content */}
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px', }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a4d8f',
            marginBottom: '8px'
          }}>
            Istorija odgovorenih pitanja
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#5a7ba6',
            margin: '0'
          }}>
            Ukupno odgovorenih: {answeredQuestions.length}
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            Učitavanje...
          </div>
        ) : answeredQuestions.length > 0 ? (
          <div>
            {answeredQuestions.map(question => (
              <QuestionCard key={question.id} question={question} />
            ))}
          </div>
        ) : (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '60px',
            textAlign: 'center',
            border: '2px dashed #e0e0e0'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <div style={{ fontSize: '18px', color: '#666', fontWeight: '600' }}>
              Nema odgovorenih pitanja
            </div>
          </div>
        )}
      </div>

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <QuestionDetailModal 
          question={selectedQuestion} 
          onClose={() => setSelectedQuestion(null)} 
        />
      )}
    </div>
  );
};

export default AnsweredQuestions;