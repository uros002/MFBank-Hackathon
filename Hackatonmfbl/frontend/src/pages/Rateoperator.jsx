import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StarRating = ({ rating, setRating, label }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div style={{ marginBottom: '32px' }}>
      <label style={{
        display: 'block',
        marginBottom: '12px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#1a4d8f'
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '8px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '48px',
              padding: '0',
              transition: 'transform 0.2s',
              transform: (hoverRating >= star || rating >= star) ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <span style={{
              color: (hoverRating >= star || rating >= star) ? '#ffc107' : '#e0e0e0',
              textShadow: (hoverRating >= star || rating >= star) ? '0 2px 4px rgba(255, 193, 7, 0.3)' : 'none'
            }}>
              ★
            </span>
          </button>
        ))}
      </div>
      <div style={{
        marginTop: '8px',
        fontSize: '14px',
        color: '#666',
        minHeight: '20px'
      }}>
        {rating > 0 && (
          <span style={{ fontWeight: '500' }}>
            {rating === 1 && '⭐ Loše'}
            {rating === 2 && '⭐⭐ Može bolje'}
            {rating === 3 && '⭐⭐⭐ Solidno'}
            {rating === 4 && '⭐⭐⭐⭐ Vrlo dobro'}
            {rating === 5 && '⭐⭐⭐⭐⭐ Odlično'}
          </span>
        )}
      </div>
    </div>
  );
};

const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
        padding: '20px',
        animation: 'fadeIn 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '450px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
          margin: '0 auto 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px'
        }}>
          ✓
        </div>

        {/* Title */}
        <h2 style={{
          margin: '0 0 16px 0',
          fontSize: '24px',
          fontWeight: '700',
          color: '#2e7d32'
        }}>
          Hvala na ocjeni!
        </h2>

        {/* Message */}
        <p style={{
          margin: '0 0 32px 0',
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#666'
        }}>
          Vaša ocjena je uspješno poslana. Vaše mišljenje nam pomaže da poboljšamo kvalitet usluge.
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px 32px',
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
            border: 'none',
            borderRadius: '8px',
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
          U redu
        </button>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

const RateOperator = () => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState({
    effectiveness: 0,
    speed: 0,
    kindness: 0,
    professionalism: 0
  });
  const [comment, setComment] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if at least one rating is given
    const hasRating = Object.values(ratings).some(r => r > 0);
    
    if (!hasRating) {
      alert('Molimo ocijenite barem jednu kategoriju.');
      return;
    }

    // Here you would send to backend
    console.log('Ratings:', ratings);
    console.log('Comment:', comment);

    // Show success modal
    setShowModal(true);

    // Reset form
    setTimeout(() => {
      setRatings({
        effectiveness: 0,
        speed: 0,
        kindness: 0,
        professionalism: 0
      });
      setComment('');
    }, 1000);
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #e8f0fe 0%, #f0f7ff 100%)',
          padding: '40px 32px',
          borderBottom: '2px solid #d4e3fc',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
  <img
    src="/logo.png"
    alt="Bank guy"
    style={{
      width: '20%',
      height: '20%',
      borderRadius: '50%',
      objectFit: 'cover'
    }}/>
          </div>
          <h1 style={{
            margin: '0 0 12px 0',
            fontSize: '28px',
            color: '#1a4d8f',
            fontWeight: '700'
          }}>
            Ocijenite našeg operatera
          </h1>
          <p style={{
            margin: '0',
            fontSize: '15px',
            color: '#5a7ba6',
            lineHeight: '1.6'
          }}>
            Vaše mišljenje je važno za nas. Pomozite nam da poboljšamo kvalitet usluge.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
          {/* Effectiveness */}
          <StarRating
            rating={ratings.effectiveness}
            setRating={(value) => setRatings({ ...ratings, effectiveness: value })}
            label="Efikasnost rješavanja problema"
          />

          {/* Speed */}
          <StarRating
            rating={ratings.speed}
            setRating={(value) => setRatings({ ...ratings, speed: value })}
            label="Brzina odgovora"
          />

          {/* Kindness */}
          <StarRating
            rating={ratings.kindness}
            setRating={(value) => setRatings({ ...ratings, kindness: value })}
            label="Ljubaznost i pristup"
          />

          {/* Professionalism */}
          <StarRating
            rating={ratings.professionalism}
            setRating={(value) => setRatings({ ...ratings, professionalism: value })}
            label="Profesionalnost"
          />

          {/* Comment */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1a4d8f'
            }}>
              Dodatni komentar <span style={{ fontSize: '14px', color: '#5a7ba6', fontWeight: '400' }}>(opciono)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="5"
              placeholder="Napišite vaše mišljenje ili prijedloge..."
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '15px',
                border: '2px solid #d4e3fc',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.3s',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4a90e2'}
              onBlur={(e) => e.target.style.borderColor = '#d4e3fc'}
            />
          </div>

          {/* Submit Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              style={{
                padding: '16px 48px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
                width: '100%'
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
              Pošalji ocjenu
            </button>
          </div>

          {/* Back to Home Link */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => navigate('/')}
              style={{
                background: 'none',
                border: 'none',
                color: '#5a7ba6',
                fontSize: '14px',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
              onMouseEnter={(e) => e.target.style.color = '#4a90e2'}
              onMouseLeave={(e) => e.target.style.color = '#5a7ba6'}
            >
              Nazad na početnu
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal isOpen={showModal} onClose={handleModalClose} />
    </div>
  );
};

export default RateOperator;