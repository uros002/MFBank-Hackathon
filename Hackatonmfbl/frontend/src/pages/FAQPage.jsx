import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FAQPage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Koji su uslovi za dobijanje stambenog kredita?",
      answer: "Za stambeni kredit potrebna je standardna dokumentacija: lična karta, potvrda o primanjima, dokumentacija o nekretnini, validna procjena vrijednosti i obavezno zasnivanje hipoteke. Kamatna stopa zavisi od vrijednosti nekretnine, vaših primanja i roka otplate."
    },
    {
      question: "Koliki je maksimalan rok otplate za potrošački kredit?",
      answer: "Maksimalan rok otplate nenamjenskog kredita iznosi do 10 godina, u zavisnosti od iznosa i kreditne sposobnosti. Duži rok otplate znači manju mjesečnu ratu, ali i viši ukupan trošak kredita."
    },
    {
      question: "Šta je overdraft i kako funkcioniše?",
      answer: "Dozvoljeno prekoračenje ili overdraft je usluga koja vam omogućava da idete u minus na tekućem računu do unaprijed odobrenog limita. Sredstva koristite samo kada vam zatrebaju i plaćate kamatu samo za iznos koji ste iskoristili."
    },
    {
      question: "Za šta mogu koristiti investicioni kredit?",
      answer: "Investicioni kredit je namijenjen za veće lične investicije poput renoviranja stana ili kuće, kupovine opreme, ulaganja u privatni posao, nabavke alata, vozila ili bilo koje druge investicije koje povećavaju vrijednost vaše imovine."
    },
    {
      question: "Kako se otplaćuje poljoprivredni kredit?",
      answer: "Otplata poljoprivrednih kredita može biti sezonska, što znači da se rate usklađuju sa ciklusima proizvodnje i periodima kada imate najveće prihode. Kod većine proizvoda postoji mogućnost odgođene prve rate do završetka sezone ili žetve."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a4d8f 0%, #357abd 100%)',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          overflow: 'hidden',
          marginBottom: '32px'
        }}>
<div style={{
  background: 'linear-gradient(135deg, #e8f0fe 0%, #f0f7ff 100%)',
  padding: '40px 32px',
  borderBottom: '2px solid #d4e3fc',
  position: 'relative',
  overflow: 'hidden'
}}>
  {/* Left Logo */}
  <img
    src="/logo.png"
    alt="Bank logo"
    style={{
      position: 'absolute',
      left: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      objectFit: 'cover',
      opacity: '0.15'
    }}
  />

  {/* Right Logo */}
  <img
    src="/logo.png"
    alt="Bank logo"
    style={{
      position: 'absolute',
      right: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      objectFit: 'cover',
      opacity: '0.15'
    }}
  />

  {/* Content */}
  <h1 style={{
    margin: '0 0 12px 0',
    fontSize: '32px',
    color: '#1a4d8f',
    fontWeight: '700',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1
  }}>
    Često postavljana pitanja
  </h1>
  <p style={{
    margin: '0',
    fontSize: '16px',
    color: '#5a7ba6',
    textAlign: 'center',
    lineHeight: '1.6',
    position: 'relative',
    zIndex: 1
  }}>
    Pronađite odgovore na najčešća pitanja o našim uslugama
  </p>
</div>
        </div>

        {/* FAQ Items */}
        <div style={{ marginBottom: '32px' }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                borderRadius: '12px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Question */}
              <button
                onClick={() => toggleFAQ(index)}
                style={{
                  width: '100%',
                  padding: '24px 32px',
                  background: openIndex === index 
                    ? 'linear-gradient(135deg, #e8f0fe 0%, #f0f7ff 100%)'
                    : 'white',
                  border: 'none',
                  borderBottom: openIndex === index ? '2px solid #d4e3fc' : 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (openIndex !== index) {
                    e.currentTarget.style.background = '#f8fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (openIndex !== index) {
                    e.currentTarget.style.background = 'white';
                  }
                }}
              >
                <span style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a4d8f',
                  flex: 1,
                  paddingRight: '20px'
                }}>
                  {faq.question}
                </span>
                <span style={{
                  fontSize: '24px',
                  color: '#4a90e2',
                  transition: 'transform 0.3s ease',
                  transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                  display: 'inline-block'
                }}>
                  ▼
                </span>
              </button>

              {/* Answer */}
              <div
                style={{
                  maxHeight: openIndex === index ? '500px' : '0',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease'
                }}
              >
                <div style={{
                  padding: '24px 32px',
                  fontSize: '15px',
                  lineHeight: '1.8',
                  color: '#333',
                  background: '#f8fafb'
                }}>
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form Button */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '20px',
            fontWeight: '600',
            color: '#1a4d8f'
          }}>
            Niste pronašli odgovor?
          </h3>
          <p style={{
            margin: '0 0 24px 0',
            fontSize: '15px',
            color: '#5a7ba6',
            lineHeight: '1.6'
          }}>
            Kontaktirajte nas putem kontakt forme i naš tim će vam odgovoriti u najkraćem roku.
          </p>
          <button
            onClick={() => navigate('/zahtjevi')}
            style={{
              padding: '14px 48px',
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
            Idi na kontakt formu
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;