# Hire.AI Backend - LangChain with Gemini

A Node.js backend service that integrates LangChain with Google's Gemini AI for intelligent chat, content generation, and interview question generation capabilities.

## 🚀 Features

- **LangChain Integration**: Full LangChain support with Gemini AI
- **Interview Question Generator**: Generate customized interview questions based on role, skills, and PDF context
- **File Upload Support**: Handle PDF uploads for question generation
- **RESTful API**: Express.js server with comprehensive endpoints
- **Streaming Support**: Real-time chat streaming capabilities
- **Security**: Helmet.js for security headers and CORS protection
- **Logging**: Structured logging with configurable levels
- **Environment Configuration**: Flexible environment-based configuration

## 📁 Project Structure

```
be/
├── src/
│   ├── config/
│   │   └── gemini.js          # Gemini AI configuration
│   ├── routes/
│   │   ├── langchain.js       # API routes for LangChain
│   │   └── interviewQuestions.js # Interview questions routes
│   ├── services/
│   │   ├── langchainService.js # Core LangChain service
│   │   └── interviewQuestionService.js # Interview questions service
│   ├── utils/
│   │   └── logger.js          # Logging utility
│   └── index.js               # Main application entry point
├── uploads/                   # File upload directory
├── package.json
├── env.example                # Environment variables template
└── README.md
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp env.example .env
```

Edit `.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file

### 4. Run the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
- **GET** `/health` - Server health status
- **GET** `/api/langchain/health` - LangChain service health
- **GET** `/api/interview-questions/health` - Interview questions service health

### Chat Endpoints
- **POST** `/api/langchain/chat` - Basic chat functionality
- **POST** `/api/langchain/chat/stream` - Streaming chat responses
- **POST** `/api/langchain/generate` - Content generation

### Interview Questions Endpoints
- **POST** `/api/interview-questions/generate` - Generate interview questions

## 🔧 API Usage Examples

### Basic Chat
```bash
curl -X POST http://localhost:3000/api/langchain/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how are you?",
    "systemPrompt": "You are a helpful assistant."
  }'
```

### Streaming Chat
```bash
curl -X POST http://localhost:3000/api/langchain/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me a story",
    "systemPrompt": "You are a creative storyteller."
  }'
```

### Content Generation
```bash
curl -X POST http://localhost:3000/api/langchain/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a professional email",
    "options": {
      "temperature": 0.5,
      "maxOutputTokens": 1000
    }
  }'
```

### Interview Questions Generation
```bash
curl -X POST http://localhost:3000/api/interview-questions/generate \
  -F "role=Software Engineer" \
  -F "skills=[\"JavaScript\", \"React\", \"Node.js\"]" \
  -F "questionComplexity=75" \
  -F "numberOfQuestions=5" \
  -F "pdf=@/path/to/job-description.pdf"
```

**Request Parameters:**
- `role` (string, required): The position being interviewed for
- `skills` (JSON array, required): Array of required skills
- `questionComplexity` (number 1-100, required): Difficulty level
- `numberOfQuestions` (number, required): Number of questions to generate
- `pdf` (file, required): PDF file with job description or context

**Response Format:**
```json
{
  "success": true,
  "data": {
    "role": "Software Engineer",
    "skills": ["JavaScript", "React", "Node.js"],
    "questionComplexity": 75,
    "numberOfQuestions": 5,
    "questions": [
      {
        "question": "Explain the difference between var, let, and const in JavaScript",
        "type": "technical",
        "complexity": "intermediate",
        "expectedAnswer": "var is function-scoped, let/const are block-scoped...",
        "skills": ["JavaScript"]
      }
    ]
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🔍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `GEMINI_API_KEY` | Gemini AI API key | Required |
| `LOG_LEVEL` | Logging level | `info` |
| `CORS_ORIGIN` | CORS origin | `http://localhost:3001` |

## 🧪 Testing

Test the API endpoints using curl or any API client:

1. **Health Check:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **LangChain Health:**
   ```bash
   curl http://localhost:3000/api/langchain/health
   ```

## 📝 Logging

The application uses structured logging with configurable levels:

- `debug` - Detailed debug information
- `info` - General information (default)
- `warn` - Warning messages
- `error` - Error messages

Set `LOG_LEVEL` in your `.env` file to control logging verbosity.

## 🔒 Security

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Input Validation**: Request validation on all endpoints
- **Error Handling**: Comprehensive error handling and logging

## 🚀 Deployment

1. Set `NODE_ENV=production` in your environment
2. Ensure all environment variables are configured
3. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   
   pm2 start src/index.js --name "hire-ai-backend"
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License. 