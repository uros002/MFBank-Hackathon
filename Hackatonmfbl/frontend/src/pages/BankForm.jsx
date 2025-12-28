import React, { useState } from 'react';

const BankForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    email: '',
    office: '',
    category: '',
    question: ''
  });
  const [modalState, setModalState] = useState({
  isOpen: false,
  isSuccess: false,
  message: ''
});

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const offices = [
    'Poslovnica Banja Luka',
    'Poslovnica Sarajevo',
    'Poslovnica Trebinje',
    'Poslovnica Bijeljina',
    'Poslovnica Doboj'
  ];

  const categories = [
    'Investicioni kredit za stanovništvo',
    'Potrošački (nenamjenski) kredit',
    'Overdraft – prekoračenje po računu',
    'Stambeni kredit MF Banke',
    'Kredit za poljoprivrednike',
    'Ostalo/Ne znam'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ime je obavezno';
    }
    
    if (!formData.surname.trim()) {
      newErrors.surname = 'Prezime je obavezno';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Broj telefona je obavezan';
    }
    
    if (!formData.office) {
      newErrors.office = 'Molimo odaberite poslovnicu';
    }
    
    if (!formData.category) {
      newErrors.category = 'Molimo odaberite kategoriju';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Send to ASP.NET backend
        const response = await fetch('http://localhost:5235/api/questions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

if (result.success) {
  // Show success modal
  setModalState({
    isOpen: true, 
    isSuccess: true,
    message: 'Vaš zahtjev je uspješno primljen!'
  });

  // Reset form
  setFormData({
    name: '',
    surname: '',
    phone: '',
    email: '',
    office: '',
    category: '',
    question: ''
  });
} else {
  // Show error modal
  setModalState({
    isOpen: true,
    isSuccess: false,
    message: result.error || 'Došlo je do greške. Molimo pokušajte ponovo.'
  });
}
} catch (error) {
  console.error('Error:', error);
  // Show error modal
  setModalState({
    isOpen: true,
    isSuccess: false,
    message: 'Greška pri slanju zahtjeva. Molimo pokušajte ponovo.'
  });
} finally {
  setIsSubmitting(false);
}
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f2fd 0%, #f0f7ff 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
        overflow: 'hidden'
      }}>
        {/* FAQ Notice Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)',
          padding: '16px 32px',
          borderBottom: '2px solid #ffe082',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>💡</span>
          <p style={{
            margin: '0',
            fontSize: '14px',
            color: '#7d6608',
            fontWeight: '500'
          }}>
            Prije slanja zahtjeva, provjerite{' '}
            <a 
              href="/faq" 
              style={{
                color: '#1a4d8f',
                fontWeight: '600',
                textDecoration: 'none',
                borderBottom: '2px solid #1a4d8f'
              }}
              onMouseEnter={(e) => e.target.style.color = '#4a90e2'}
              onMouseLeave={(e) => e.target.style.color = '#1a4d8f'}
            >
              često postavljana pitanja
            </a>
            {' '} možda je odgovor već tu!
          </p>
        </div>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #e8f0fe 0%, #f0f7ff 100%)',
          padding: '32px',
          borderBottom: '2px solid #d4e3fc'
        }}>
          <h1 style={{
            margin: '0',
            fontSize: '28px',
            color: '#1a4d8f',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Kontakt forma
          </h1>
          <p style={{
            margin: '8px 0 0 0',
            fontSize: '15px',
            color: '#5a7ba6',
            textAlign: 'center'
          }}>
            Popunite formu i kontaktiraćemo vas u najkraćem mogućem roku
          </p>
        </div>

        {/* Form */}
        <form autoComplete="off" onSubmit={handleSubmit} style={{ padding: '40px' } }>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Name */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1a4d8f'
              }}>
                Ime <span style={{ color: '#d32f2f' }}>*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: errors.name ? '2px solid #d32f2f' : '2px solid #d4e3fc',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box',
                  opacity: isSubmitting ? 0.6 : 1
                }}
                onFocus={(e) => e.target.style.borderColor = '#4a90e2'}
                onBlur={(e) => e.target.style.borderColor = errors.name ? '#d32f2f' : '#d4e3fc'}
              />
              {errors.name && (
                <span style={{ fontSize: '12px', color: '#d32f2f', marginTop: '4px', display: 'block' }}>
                  {errors.name}
                </span>
              )}
            </div>

            {/* Surname */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1a4d8f'
              }}>
                Prezime <span style={{ color: '#d32f2f' }}>*</span>
              </label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: errors.surname ? '2px solid #d32f2f' : '2px solid #d4e3fc',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box',
                  opacity: isSubmitting ? 0.6 : 1
                }}
                onFocus={(e) => e.target.style.borderColor = '#4a90e2'}
                onBlur={(e) => e.target.style.borderColor = errors.surname ? '#d32f2f' : '#d4e3fc'}
              />
              {errors.surname && (
                <span style={{ fontSize: '12px', color: '#d32f2f', marginTop: '4px', display: 'block' }}>
                  {errors.surname}
                </span>
              )}
            </div>

            {/* Phone */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1a4d8f'
              }}>
                Broj telefona <span style={{ color: '#d32f2f' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="06X XXX XXX"
                  style={{
                    width: '100%',
                    padding: '12px 50px 12px 16px',
                    fontSize: '15px',
                    border: errors.phone ? '2px solid #d32f2f' : '2px solid #d4e3fc',
                    borderRadius: '8px',
                    outline: 'none',
                    transition: 'border-color 0.3s',
                    boxSizing: 'border-box',
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4a90e2'}
                  onBlur={(e) => e.target.style.borderColor = errors.phone ? '#d32f2f' : '#d4e3fc'}
                />
                <span style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '20px'
                }}>
                  🇧🇦
                </span>
              </div>
              {errors.phone && (
                <span style={{ fontSize: '12px', color: '#d32f2f', marginTop: '4px', display: 'block' }}>
                  {errors.phone}
                </span>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1a4d8f'
              }}>
                Email <span style={{ fontSize: '12px', color: '#5a7ba6', fontWeight: '400' }}>(opciono)</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: '2px solid #d4e3fc',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  boxSizing: 'border-box',
                  opacity: isSubmitting ? 0.6 : 1
                }}
                onFocus={(e) => e.target.style.borderColor = '#4a90e2'}
                onBlur={(e) => e.target.style.borderColor = '#d4e3fc'}
              />
            </div>

            {/* Office */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1a4d8f'
              }}>
                Poslovnica <span style={{ color: '#d32f2f' }}>*</span>
              </label>
              <select
                name="office"
                value={formData.office}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: errors.office ? '2px solid #d32f2f' : '2px solid #d4e3fc',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  opacity: isSubmitting ? 0.6 : 1
                }}
                onFocus={(e) => e.target.style.borderColor = '#4a90e2'}
                onBlur={(e) => e.target.style.borderColor = errors.office ? '#d32f2f' : '#d4e3fc'}
              >
                <option value="">Odaberite poslovnicu</option>
                {offices.map((office, index) => (
                  <option key={index} value={office}>{office}</option>
                ))}
              </select>
              {errors.office && (
                <span style={{ fontSize: '12px', color: '#d32f2f', marginTop: '4px', display: 'block' }}>
                  {errors.office}
                </span>
              )}
            </div>

            {/* Category */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#1a4d8f'
              }}>
                Kategorija <span style={{ color: '#d32f2f' }}>*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: errors.category ? '2px solid #d32f2f' : '2px solid #d4e3fc',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'border-color 0.3s',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  opacity: isSubmitting ? 0.6 : 1
                }}
                onFocus={(e) => e.target.style.borderColor = '#4a90e2'}
                onBlur={(e) => e.target.style.borderColor = errors.category ? '#d32f2f' : '#d4e3fc'}
              >
                <option value="">Odaberite kategoriju</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && (
                <span style={{ fontSize: '12px', color: '#d32f2f', marginTop: '4px', display: 'block' }}>
                  {errors.category}
                </span>
              )}
            </div>
          </div>

          {/* Question */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#1a4d8f'
            }}>
              Vaše pitanje ili poruka
            </label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleChange}
              disabled={isSubmitting}
              rows="8"
              placeholder="Unesite svoje pitanje ili poruku..."
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
                boxSizing: 'border-box',
                opacity: isSubmitting ? 0.6 : 1
              }}
              onFocus={(e) => e.target.style.borderColor = '#4a90e2'}
              onBlur={(e) => e.target.style.borderColor = '#d4e3fc'}
            />
          </div>

          {/* Submit Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '14px 48px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: isSubmitting 
                  ? 'linear-gradient(135deg, #94b8d1 0%, #7a9fb8 100%)'
                  : 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                border: 'none',
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(74, 144, 226, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(74, 144, 226, 0.3)';
              }}
            >
              {isSubmitting ? 'Šaljem...' : 'Pošalji zahtjev'}
            </button>
            {/* Success/Error Modal */}
{modalState.isOpen && (
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
    onClick={() => setModalState({ isOpen: false, isSuccess: false, message: '' })}
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
        background: modalState.isSuccess 
          ? 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)'
          : 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
        margin: '0 auto 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
        color: 'white'
      }}>
        {modalState.isSuccess ? '✓' : '✕'}
      </div>

      {/* Title */}
      <h2 style={{
        margin: '0 0 16px 0',
        fontSize: '24px',
        fontWeight: '700',
        color: modalState.isSuccess ? '#2e7d32' : '#d32f2f'
      }}>
        {modalState.isSuccess ? 'Uspješno!' : 'Greška'}
      </h2>

      {/* Message */}
      <p style={{
        margin: '0 0 32px 0',
        fontSize: '16px',
        lineHeight: '1.6',
        color: '#666'
      }}>
        {modalState.message}
      </p>

      {/* Close Button */}
      <button
        onClick={() => setModalState({ isOpen: false, isSuccess: false, message: '' })}
        style={{
          width: '100%',
          padding: '14px 32px',
          fontSize: '16px',
          fontWeight: '600',
          color: 'white',
          background: modalState.isSuccess
            ? 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)'
            : 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
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
)}
          </div>
        </form>
        
      </div>
      
    </div>
    
  );
};

export default BankForm;