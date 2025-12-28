import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionModal from '../components/QuestionModal';


const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: '90px',
      right: '20px',
      background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '8px',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
      zIndex: 10000,
      animation: 'slideIn 0.3s ease-out',
      minWidth: '300px',
      maxWidth: '400px'
    }}>
      <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
        <span style={{ fontSize: '24px' }}>🔔</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Novo pitanje</div>
          <div style={{ fontSize: '14px', opacity: 0.95 }}>{message}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1'
          }}
        >
          ×
        </button>
      </div>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

const QuestionCard = ({ question, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    // Only show if 15 minutes have passed
    if (diffMins < 15) return null;
    
    const expiredMins = diffMins - 15;
    
    if (expiredMins < 60) return `Pitanje isteklo prije ${expiredMins} min. Odgovorite što prije!`;
    if (expiredMins < 1440) return `Pitanje isteklo prije ${Math.floor(expiredMins / 60)} h. Odgovorite što prije!`;
    return date.toLocaleDateString('sr-Latn-BA');
  };

  const getTimeColor = (minutes) => {
    if (minutes <= 0) return '#fa1414ff';
    if (minutes <= 5) return '#bd0b0bff';
    if (minutes <= 10) return '#FF6D1F';
    return '#4a90e2';
  };

  const getBorderColor = (minutes) => {
    if (minutes <= 5) return '#d32f2f';      // Red
    if (minutes <= 10) return '#ff9800';     // Yellow/Orange
    return '#e8f0fe';                        // Default light blue
  };

  const getBorderWidth = (minutes) => {
    if (minutes <= 5) return '3px';          // Thicker for urgent
    if (minutes <= 10) return '3px';         // Thicker for warning
    return '2px';                            // Normal
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '16px',
        border: `${getBorderWidth(question.timeLeftMinutes)} solid ${getBorderColor(question.timeLeftMinutes)}`,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: isHovered 
          ? `0 8px 24px ${getBorderColor(question.timeLeftMinutes)}40`
          : '0 2px 8px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div>
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #e8f0fe 0%, #f0f7ff 100%)',
            color: '#357abd',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            {question.category}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span style={{
            fontSize: '12px',
            color: '#5a7ba6',
            fontWeight: '500'
          }}>
            {formatTime(question.submittedAt)}
          </span>
          <span style={{
            fontSize: '12px',
            fontWeight: '700',
            color: getTimeColor(question.timeLeftMinutes),
            background: `${getTimeColor(question.timeLeftMinutes)}15`,
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            {question.timeLeftMinutes > 0 ? `Ostalo još ${question.timeLeftMinutes} min` : 'Isteklo!'}
          </span>
        </div>
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
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}>
        {question.question}
      </div>
      
      <div style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #e8f0fe',
        display: 'flex',
        gap: '16px',
        fontSize: '12px',
        color: '#5a7ba6'
      }}>
        <span>📞 {question.phone}</span>
        <span>🏢 {question.office}</span>
      </div>
    </div>
  );
};

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const [highAlertQuestions, setHighAlertQuestions] = useState([]);
  const [newQuestions, setNewQuestions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [toast, setToast] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const prevCountRef = useRef(0);
  const prevQuestionsRef = useRef([]);


  // Fetch questions from backend
  const fetchQuestions = async () => {
    try {
      // Fetch high alert questions
      const highAlertRes = await fetch('http://localhost:5235/api/questions/high-alert');
      const highAlertData = await highAlertRes.json();
      
      // Fetch new questions
      const newRes = await fetch('http://localhost:5235/api/questions/new');
      const newData = await newRes.json();

      if (highAlertData.success && newData.success) {
        const newHighAlert = highAlertData.questions || [];
        const newNew = newData.questions || [];
        
        setHighAlertQuestions(newHighAlert);
        setNewQuestions(newNew);

        // Calculate total count
        const newTotal = newHighAlert.length + newNew.length;
        
        // Check for new questions
        const allCurrentQuestions = [...newHighAlert, ...newNew];
        const allPreviousQuestions = prevQuestionsRef.current;
        
        // Find newly added questions
        const newlyAdded = allCurrentQuestions.filter(current => 
          !allPreviousQuestions.some(prev => prev.id === current.id)
        );

        // Show toast for new questions
        if (newlyAdded.length > 0 && allPreviousQuestions.length > 0) {
          const latest = newlyAdded[0];
          setToast(`Nova poruka od ${latest.name} ${latest.surname} - ${latest.category}`);
        }

        // Update refs
        prevCountRef.current = newTotal;
        prevQuestionsRef.current = allCurrentQuestions;
        setTotalCount(newTotal);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchQuestions();
    
    // Poll for updates every 3 seconds (more responsive)
    const interval = setInterval(fetchQuestions, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleBellClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question);
  };

  const closeModal = () => {
    setSelectedQuestion(null);
  };

   const handleQuestionAnswered = (questionId) => {
      // Immediately refresh the questions
      fetchQuestions();
      
      console.log(`Question ${questionId} has been answered`);
    };

    // Update the QuestionModal rendering
    {selectedQuestion && (
      <QuestionModal 
        question={selectedQuestion} 
        onClose={closeModal}
        onQuestionAnswered={handleQuestionAnswered}
      />
    )}


return (
  <div style={{ 
    minHeight: '100vh', 
    background: 'linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%)' 
  }}>
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

    {/* Toast Notification */}
    {toast && (
      <Toast 
        message={toast} 
        onClose={() => setToast(null)} 
      />
    )}

    {/* Question Modal */}
    {selectedQuestion && (
      <QuestionModal 
        question={selectedQuestion} 
        onClose={closeModal} 
      />
    )}

    {/* Dashboard Content */}
    <div style={{ padding: '40px', maxWidth: '1600px', margin: '0 auto' }}>
      <h1 style={{
        fontSize: '32px',
        fontWeight: '700',
        color: '#1a4d8f',
        marginBottom: '32px'
      }}>
        Kontrolna tabla
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '32px'
      }}>
        {/* High Alert Section - WRAPPED IN BOX */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(211, 47, 47, 0.15)',
          border: '3px solid #ffcdd2'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px' }}>🚨</span>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#d32f2f',
                  margin: '0'
                }}>
                  Hitna pitanja
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#c62828',
                  margin: '4px 0 0 0'
                }}>
                  Zahtjevaju hitnu pažnju
                </p>
              </div>
              <div style={{
                marginLeft: 'auto',
                background: '#d32f2f',
                color: 'white',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '18px',
                fontWeight: '700'
              }}>
                {highAlertQuestions.length}
              </div>
            </div>
          </div>

          <div style={{
            maxHeight: 'calc(100vh - 340px)',
            overflowY: 'auto',
            paddingRight: '8px'
          }}>
            {highAlertQuestions.length > 0 ? (
              highAlertQuestions.map(question => (
                <QuestionCard 
                  key={question.id} 
                  question={question}
                  onClick={() => handleQuestionClick(question)}
                />
              ))
            ) : (
              <div style={{
                background: '#fafafa',
                borderRadius: '10px',
                padding: '40px',
                textAlign: 'center',
                color: '#5a7ba6',
                border: '2px dashed #e0e0e0'
              }}>
                Nema hitnih pitanja
              </div>
            )}
          </div>
        </div>

        {/* New Questions Section - WRAPPED IN BOX */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 12px rgba(39, 98, 166, 0.15)',
          border: '3px solid #bbdefb'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #e8f0fe 0%, #f0f7ff 100%)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px' }}>📋</span>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#1a4d8f',
                  margin: '0'
                }}>
                  Nova pitanja
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: '#357abd',
                  margin: '4px 0 0 0'
                }}>
                  Najnovija primljena pitanja
                </p>
              </div>
              <div style={{
                marginLeft: 'auto',
                background: '#4a90e2',
                color: 'white',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '18px',
                fontWeight: '700'
              }}>
                {newQuestions.length}
              </div>
            </div>
          </div>

          <div style={{
            maxHeight: 'calc(100vh - 340px)',
            overflowY: 'auto',
            paddingRight: '8px'
          }}>
            {newQuestions.length > 0 ? (
              newQuestions.map(question => (
                <QuestionCard 
                  key={question.id} 
                  question={question}
                  onClick={() => handleQuestionClick(question)}
                />
              ))
            ) : (
              <div style={{
                background: '#fafafa',
                borderRadius: '10px',
                padding: '40px',
                textAlign: 'center',
                color: '#5a7ba6',
                border: '2px dashed #e0e0e0'
              }}>
                Nema novih pitanja
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Custom scrollbar styling */}
    <style>
      {`
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f3f5;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #4a90e2;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #357abd;
        }
      `}
    </style>
  </div>
);
}

export default OperatorDashboard;