# Bank Customer Service System - HACKATHON

A comprehensive customer service management system for MF Banka that uses AI-powered FAQ matching to automatically categorize and suggest answers to customer questions, with a real-time operator dashboard for handling inquiries.

## 🎯 System Overview

This system consists of three main components:

1. **ASP.NET Core API Backend** - Manages questions, queue processing, and email notifications
2. **Python Flask API** - AI-powered FAQ matching using similarity algorithms
3. **React Frontend** - Customer-facing forms and operator dashboard

## 🏗️ Architecture

```
┌─────────────────────┐
│   React Frontend    │
│  (Customer & Ops)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐      ┌──────────────────┐
│   ASP.NET Core API  │◄────►│  Python FAQ API  │
│   (Port 5235)       │      │   (Port 5001)    │
└──────────┬──────────┘      └──────────────────┘
           │
           ▼
┌─────────────────────┐
│   Email Service     │
│   (SMTP)            │
└─────────────────────┘
```

## 🚀 Features

### Customer Features
- **Smart Question Submission** - Submit questions through an intuitive form
- **Automatic Categorization** - AI automatically categorizes questions into credit types
- **Instant Email Responses** - Receive immediate email with AI-suggested answers (when confidence is high)
- **FAQ Page** - Self-service answers to common questions
- **15-Minute Response Guarantee** - Questions escalate if not answered within 15 minutes

### Operator Features
- **Real-Time Dashboard** - Live updates of incoming questions
- **Priority Queue System** - Questions automatically move to "High Alert" after 10 minutes
- **Question Timer** - Visual countdown showing time remaining for each question
- **Smart Answer Suggestions** - AI provides suggested answers with confidence scores
- **Answer History** - Track all answered questions with timestamps
- **Email Integration** - Send follow-up emails directly to customers

### AI/Automation Features
- **Exact Match Detection** - Finds identical questions in FAQ database
- **Similarity Matching** - Uses Levenshtein distance for fuzzy matching (55% threshold)
- **Keyword-Based Pre-filtering** - Fast category detection using keyword mapping
- **Confidence Scoring** - Provides confidence levels for suggested answers
- **Automatic Email Dispatch** - Sends emails based on answer confidence

## 📋 Prerequisites

### Backend (ASP.NET Core)
- .NET 6.0 or higher
- Visual Studio 2022 or VS Code with C# extension

### Python FAQ Service
- Python 3.8 or higher
- pip package manager

### Frontend
- Node.js 16.x or higher
- npm or yarn

### Email Service
- SMTP server credentials (Gmail, Outlook, etc.)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bank-customer-service-system
```

### 2. Backend Setup (ASP.NET Core)

```bash
cd BankAPI

# Restore dependencies
dotnet restore

# Configure email settings in appsettings.json
{
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "SmtpUser": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "FromEmail": "your-email@gmail.com",
    "FromName": "MF Banka"
  }
}

# Build the project
dotnet build

# Run the API
dotnet run
```

The API will start on `http://localhost:5235`

### 3. Python FAQ Service Setup

```bash
cd python-faq-service

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install flask flask-cors

# Generate the FAQ model
python faqmodel.py

# Start the Flask API
python faq_api.py
```

The Python API will start on `http://localhost:5001`

**Note:** The `PitanjaOdgovoriJSON.json` file must be present in the same directory as the Python scripts. This file contains your FAQ database.

### 4. Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The React app will start on `http://localhost:3000`



## 🔌 API Endpoints

### ASP.NET Core API (`http://localhost:5235`)

#### Questions Management
- `POST /api/questions` - Submit new question
- `GET /api/questions` - Get all questions
- `GET /api/questions/{id}` - Get question by ID
- `GET /api/questions/high-alert` - Get urgent questions (≤5 min remaining)
- `GET /api/questions/new` - Get regular questions (>5 min remaining)
- `GET /api/questions/count` - Get unanswered question count
- `GET /api/questions/answered` - Get answered questions history
- `GET /api/questions/answered/count` - Get answered questions count
- `PUT /api/questions/{id}/mark-answered` - Mark question as answered
- `POST /api/questions/{id}/send-operator-email` - Send follow-up email
- `GET /api/questions/test` - API health check

### Python FAQ API (`http://localhost:5001`)

- `POST /api/process-question` - Process question with AI
  ```json
  {
    "question": "Koliki je maksimalan rok otplate?",
    "category": "Stambeni kredit MF Banke" // optional
  }
  ```

- `GET /health` - Health check

## 📧 Email Configuration

The system sends three types of emails:

1. **Confirmation Email** (Low confidence answers)
   - Confirms receipt of question
   - Promises 15-minute callback

2. **Answer Email** (High confidence answers)
   - Includes AI-generated answer
   - Still promises operator callback

3. **Operator Follow-up Email**
   - Sent manually by operators
   - Contains personalized answer
   - Includes rating link

### Gmail Setup Example

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings → Security
   - Select "App passwords"
   - Generate password for "Mail"
3. Use the generated password in `appsettings.json`

## ⚙️ Configuration

### Backend Configuration (`appsettings.json`)

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "SmtpUser": "your-email@gmail.com",
    "SmtpPassword": "your-app-password",
    "FromEmail": "your-email@gmail.com",
    "FromName": "MF Banka"
  },
  "AllowedHosts": "*"
}
```

### FAQ Categories

The system recognizes these credit categories:

- Investicioni kredit za stanovništvo (Investment Loan)
- Potrošački (nenamjenski) kredit (Consumer Loan)
- Overdraft – prekoračenje po računu (Overdraft)
- Stambeni kredit MF Banke (Housing Loan)
- Kredit za poljoprivrednike (Agricultural Loan)
- Ostalo/Ne znam (Other/Don't Know)

## 🎨 Frontend Routes

- `/` - Landing page
- `/zahtjevi` - Customer question submission form
- `/faq` - Frequently Asked Questions
- `/operator-home` - Operator landing page (requires auth in production)
- `/operator-dashboard` - Real-time question dashboard
- `/answered-questions` - Answer history
- `/rate-operator` - Operator rating page

## 🔄 Question Lifecycle

```
1. Customer submits question
         ↓
2. Python API categorizes & suggests answer
         ↓
3. Question added to queue with 15-min timer
         ↓
4. Email sent (with/without AI answer based on confidence)
         ↓
5. Question appears in operator dashboard
         ↓
6. [T+10 min] Question moves to "High Alert"
         ↓
7. [T+15 min] Timer expires (visual alert only)
         ↓
8. Operator answers & marks complete
         ↓
9. Optional: Operator sends follow-up email
         ↓
10. Question moves to history
```

## 🧪 Testing

### Test the Python FAQ Service

```bash
cd python-faq-service
python faqmodel.py
```

This will:
- Load FAQ data
- Create the model
- Run test questions
- Generate `faq_matcher_model.pkl`

### Test the Backend

```bash
curl http://localhost:5235/api/questions/test
```

Expected response:
```json
{
  "message": "API is working!",
  "timestamp": "2024-01-15T10:30:00"
}
```

### Test the Python API

```bash
curl http://localhost:5001/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "FAQ Matcher API"
}
```

## 📊 FAQ Matching Algorithm

The system uses a multi-stage matching approach:

### Stage 1: Exact Match
- Normalizes text (lowercase, whitespace removal)
- Checks for identical question in database
- **Confidence: 1.0 (100%)**

### Stage 2: Keyword Pre-filtering
- Checks for category-specific keywords
- Example: "poljoprivreda" → Agricultural Loan category
- Narrows search space for better performance

### Stage 3: Similarity Matching
- Uses Levenshtein distance algorithm
- Calculates similarity ratio between questions
- **Threshold: 0.55 (55%)**
- Returns best match above threshold

### Stage 4: Basic Category Answer
- If keyword match but no similar question found
- Returns generic "Basic" answer for category
- **Confidence: 0.5 (50%)**

### Stage 5: Unknown
- No match found
- Requires operator review
- **Confidence: 0.0 (0%)**

## 🔔 Real-Time Updates

The operator dashboard polls the backend every **3 seconds** for updates, providing near real-time notifications when:
- New questions arrive
- Questions move to high alert
- Question timers update

## 🎯 Timer System

Questions have a **15-minute response window**:

- **Minutes 15-11**: Normal priority (blue border)
- **Minutes 10-6**: Warning (orange border, thicker)
- **Minutes 5-0**: High Alert (red border, thickest)
- **Minute 0**: Expired (dark red, "Isteklo!" label)



## 🔐 Security Considerations


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


---

Built with ❤️ for MF Banka Hackathon
