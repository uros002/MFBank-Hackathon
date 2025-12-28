import React, { useState } from 'react';

const ConfirmationDialog = ({ message, onConfirm, onCancel }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20000,
        padding: '20px'
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'modalFadeIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '20px',
          fontWeight: '700',
          color: '#1a4d8f'
        }}>
          Potvrda
        </h3>
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '15px',
          lineHeight: '1.5',
          color: '#333'
        }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              background: '#f5f5f5',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#e0e0e0'}
            onMouseLeave={(e) => e.target.style.background = '#f5f5f5'}
          >
            Otkaži
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(74, 144, 226, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(74, 144, 226, 0.3)';
            }}
          >
            Potvrdi
          </button>
        </div>
      </div>
    </div>
  );
};

const QuestionModal = ({ question, onClose, onQuestionAnswered }) => {
  const [operatorAnswer, setOperatorAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [markedAsAnswered, setMarkedAsAnswered] = useState(false);

  if (!question) return null;

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

  const getTimeLeftColor = (minutes) => {
    if (minutes <= 0) return '#d32f2f';
    if (minutes <= 5) return '#f57c00';
    return '#4a90e2';
  };

  const handleMarkAsAnswered = () => {
    setShowConfirmation(true);
  };

  const handleConfirmMarkAsAnswered = async () => {
    setIsSubmitting(true);
    setShowConfirmation(false);

    try {
      const response = await fetch(`http://localhost:5235/api/questions/${question.id}/mark-answered`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          operatorAnswer: operatorAnswer || 'Pitanje je odgovoreno telefonskim putem.'
        })
      });

      const result = await response.json();

      if (result.success) {
        setMarkedAsAnswered(true);
        
        // Show success message
        setTimeout(() => {
          if (onQuestionAnswered) {
            onQuestionAnswered(question.id);
          }
          onClose();
        }, 1500);
      } else {
        alert('Greška: ' + (result.error || 'Nepoznata greška'));
      }
    } catch (error) {
      console.error('Error marking as answered:', error);
      alert('Greška pri ažuriranju pitanja. Molimo pokušajte ponovo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendOperatorEmail = async () => {
  if (!operatorAnswer.trim()) {
    alert("Unesite odgovor prije slanja emaila.");
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5235/api/questions/${question.id}/send-operator-email`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: question.email,
          customerName: `${question.name} ${question.surname}`,
          question: question.question,
          answer: operatorAnswer
        })
      }
    );

    const data = await response.json();

    if (!data.success) {
      alert("Greška – email nije poslan.");
      return;
    }

    // Nakon slanja emaila — zatvori pitanje
    await fetch(
      `http://localhost:5235/api/questions/${question.id}/mark-answered`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operatorAnswer
        })
      }
    );

    if (onQuestionAnswered) onQuestionAnswered(question.id);
    onClose();

  } catch (err) {
    console.error(err);
    alert("Greška prilikom slanja emaila.");
  }
};

  return (
    <>
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
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'modalFadeIn 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Success Overlay */}
          {markedAsAnswered && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              borderRadius: '16px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>✓</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#43a047' }}>
                  Pitanje je označeno kao odgovoreno!
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1a4d8f 0%, #2d6bb8 100%)',
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
                Detalji pitanja
              </h2>
              <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '14px' }}>
                ID: {question.id}
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
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: '32px' }}>
            {/* Status Banner */}
            <div
              style={{
                background: question.isHighAlert
                  ? 'linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)'
                  : 'linear-gradient(135deg, #e8f0fe 0%, #f0f7ff 100%)',
                border: question.isHighAlert ? '2px solid #ffcdd2' : '2px solid #bbdefb',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>
                  {question.isHighAlert ? '🚨' : '📋'}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: question.isHighAlert ? '#d32f2f' : '#1a4d8f'
                    }}
                  >
                    {question.isHighAlert ? 'Hitno pitanje' : 'Novo pitanje'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                    {formatDate(question.submittedAt)}
                  </div>
                </div>
              </div>
              <div
                style={{
                  background: getTimeLeftColor(question.timeLeftMinutes),
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '700'
                }}
              >
                {question.timeLeftMinutes > 0
                  ? `${question.timeLeftMinutes} min preostalo`
                  : 'Isteklo vrijeme'}
              </div>
            </div>

            {/* Customer Information */}
            <div style={{ marginBottom: '24px' }}>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a4d8f',
                  marginBottom: '16px'
                }}
              >
                Informacije o klijentu
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}
              >
                <InfoField label="Ime i prezime" value={`${question.name} ${question.surname}`} />
                <InfoField label="Telefon" value={question.phone} icon="📞" />
                <InfoField
                  label="Email"
                  value={question.email || 'Nije dostupan'}
                  icon="✉️"
                />
                <InfoField label="Poslovnica" value={question.office} icon="🏢" />
              </div>
            </div>

            {/* Category and Confidence */}
            <div style={{ marginBottom: '24px' }}>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a4d8f',
                  marginBottom: '16px'
                }}
              >
                Kategorija pitanja
              </h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Badge label="Kategorija" value={question.category} color="#4a90e2" />
              </div>
            </div>

            {/* Question */}
            <div style={{ marginBottom: '24px' }}>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#1a4d8f',
                  marginBottom: '12px'
                }}
              >
                Pitanje
              </h3>
              <div
                style={{
                  background: '#f8fafb',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #e8f0fe',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  color: '#333'
                }}
              >
                {question.question}
              </div>
            </div>

{/* Suggested Answer - Only show if AI found a valid answer */}
{question.suggestedAnswer && 
 !question.suggestedAnswer.includes('No quick answer found') &&
 !question.suggestedAnswer.includes('Operator should review') &&
 question.suggestedAnswer !== 'No answer available.' && (
  <div style={{ marginBottom: '24px' }}>
    <h3
      style={{
        fontSize: '18px',
        fontWeight: '700',
        color: '#1a4d8f',
        marginBottom: '12px'
      }}
    >
      Dobijeni odgovor (AI)
    </h3>
    <div
      style={{
        background: 'linear-gradient(135deg, #e8f0fe 0%, #f0f7ff 100%)',
        padding: '20px',
        borderRadius: '12px',
        border: '2px solid #bbdefb',
        fontSize: '15px',
        lineHeight: '1.6',
        color: '#333'
      }}
    >
      {question.suggestedAnswer}
    </div>
  </div>
)}

{/* Answer Section */}
<div style={{ marginBottom: '24px' }}>
  <h3
    style={{
      fontSize: '18px',
      fontWeight: '700',
      color: '#1a4d8f',
      marginBottom: '12px'
    }}
  >
    Odgovor operatora
  </h3>
  {/* Instructions */}
  <div style={{
    marginTop: '12px',
    padding: '16px',
    background: question.email ? '#f0f7ff' : '#f0f7ff',
    border: `2px solid ${question.email ? '#f0f7ff' : '#f0f7ff'}`,
    borderRadius: '8px',
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.6'
  }}>
    <strong style={{ display: 'block', marginBottom: '8px', color: question.email ? '#1565c0' : '#f57c00' }}>
      {question.email ? '✉️ Opcija 1 - Email:' : '📞 Uputstvo:'}
    </strong>
    {question.email ? (
      <>
        Unesite odgovor i pošaljite email korisniku. Pitanje će biti automatski označeno kao odgovoreno.
        <br /><br />
        <strong style={{ color: '#1565c0' }}>📞 Opcija 2 - Poziv:</strong>
        <br />
        Nazovite klijenta na {question.phone}, odgovorite na pitanje, a zatim ručno označite kao odgovoreno.
      </>
    ) : (
      <>
        Email nije dostupan. Nazovite klijenta na {question.phone}, odgovorite na pitanje, 
        a zatim označite kao odgovoreno klikom na dugme ispod.
      </>
    )}
  </div>
  <textarea
    value={operatorAnswer}
    onChange={(e) => setOperatorAnswer(e.target.value)}
    placeholder={question.email ? "Unesite odgovor koji želite poslati korisniku..." : "Opciono: Unesite napomenu o odgovoru..."}
    disabled={isSubmitting}
    style={{
      width: '100%',
      minHeight: '120px',
      padding: '16px',
      fontSize: '15px',
      border: '2px solid #d4e3fc',
      borderRadius: '12px',
      resize: 'vertical',
      fontFamily: 'inherit',
      background: 'white',
      boxSizing: 'border-box',
      marginTop: '20px',
      opacity: isSubmitting ? 0.6 : 1
    }}
    onFocus={(e) => e.target.style.borderColor = '#4a90e2'}
    onBlur={(e) => e.target.style.borderColor = '#d4e3fc'}
  />
  
  

  {/* Action Buttons */}
  <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
    {question.email && (
      <button 
        onClick={handleSendOperatorEmail}
        disabled={isSubmitting || !operatorAnswer.trim()}
        style={{
          padding: '14px 32px',
          fontSize: '15px',
          fontWeight: '600',
          color: 'white',
          background: isSubmitting || !operatorAnswer.trim()
            ? '#ccc'
            : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          border: 'none',
          borderRadius: '8px',
          cursor: isSubmitting || !operatorAnswer.trim() ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s',
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting && operatorAnswer.trim()) {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(25, 118, 210, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 4px 12px rgba(25, 118, 210, 0.3)';
        }}
      >
        {isSubmitting ? (
          <>
            <span style={{ 
              display: 'inline-block',
              width: '16px',
              height: '16px',
              border: '2px solid white',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            Šaljem email...
          </>
        ) : (
          <>
            <span style={{ fontSize: '18px' }}>✉️</span>
            Pošalji email i zatvori pitanje
          </>
        )}
      </button>
    )}
    
    <button
      onClick={handleMarkAsAnswered}
      disabled={isSubmitting}
      style={{
        padding: '14px 32px',
        fontSize: '15px',
        fontWeight: '600',
        color: 'white',
        background: "#4a90e2",
        border: 'none',
        borderRadius: '8px',
        cursor: isSubmitting ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s',
        boxShadow: '0 4px 12px rgba(67, 160, 71, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onMouseEnter={(e) => {
        if (!isSubmitting) {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = '0 6px 16px rgba(67, 160, 71, 0.4)';
        }
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 12px rgba(67, 160, 71, 0.3)';
      }}
    >
      {isSubmitting ? 'Čuvam...' : (
        <>
          <span style={{ fontSize: '18px' }}>✓</span>
          Ručno zatvori pitanje
        </>
      )}
    </button>
  </div>
</div>
          </div>
        </div>

        {/* Animation styles */}
        <style>
<style>
  {`
    @keyframes modalFadeIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `}
</style>
        </style>
        
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <ConfirmationDialog
          message="Da li ste sigurni da želite označiti ovo pitanje kao odgovoreno? Ova akcija će ukloniti pitanje iz liste neriješenih pitanja."
          onConfirm={handleConfirmMarkAsAnswered}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </>
  );
};

const InfoField = ({ label, value, icon }) => (
  <div>
    <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '500' }}>
      {label}
    </div>
    <div style={{ fontSize: '15px', color: '#333', fontWeight: '600' }}>
      {icon && <span style={{ marginRight: '6px' }}>{icon}</span>}
      {value}
    </div>
  </div>
);

const Badge = ({ label, value, color }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      background: `${color}15`,
      border: `2px solid ${color}40`,
      padding: '8px 16px',
      borderRadius: '20px'
    }}
  >
    <span style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>{label}:</span>
    <span style={{ fontSize: '14px', color: color, fontWeight: '700' }}>{value}</span>
  </div>
);

export default QuestionModal;