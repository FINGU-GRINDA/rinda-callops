# RINDA CallOps - Backend Server

The backend server for RINDA CallOps, providing AI-powered phone agent capabilities with real-time voice processing, tool execution, and business automation.

## Features

### Core Capabilities
- **AI Phone Agents**: Autonomous agents that handle inbound/outbound calls
- **Real-time Voice Processing**: Natural, human-like conversations
- **Multi-language Support**: 10+ languages for global businesses
- **Tool Execution System**: Execute actions during conversations
- **Business Automation**: Complete tasks like booking, ordering, and scheduling

### Technical Features
- **Dual Voice Pipeline**: OpenAI Realtime API and STT-LLM-TTS pipeline
- **LiveKit Integration**: WebRTC infrastructure for high-quality calls
- **Google Sheets Integration**: Real-time data management
- **Webhook Support**: External API integrations
- **File Analysis**: AI-powered document processing
- **Scalable Architecture**: Handle thousands of concurrent calls

## Tech Stack

- **Language**: Python 3.11+
- **Framework**: FastAPI
- **Voice Infrastructure**: LiveKit
- **AI/LLM**: OpenAI GPT-4, OpenAI Realtime API
- **Speech-to-Text**: Deepgram
- **Text-to-Speech**: Cartesia
- **Database**: Firebase/Firestore
- **Caching**: Redis (optional)
- **Phone Service**: Twilio
- **Authentication**: Firebase Auth

## Prerequisites

- Python 3.11 or higher
- pip or poetry
- Firebase project with service account
- LiveKit server (cloud or self-hosted)
- OpenAI API key
- Twilio account (for phone calls)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd phone-ag/server
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
```

5. Configure your environment variables in `.env`:

### Required Environment Variables

```env
# Server Configuration
API_PORT=8000
FRONTEND_URL=http://localhost:3000
ENVIRONMENT=development

# LiveKit Configuration
LIVEKIT_URL=wss://your-livekit-server.com
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# AI Services
OPENAI_API_KEY=your-openai-api-key
DEEPGRAM_API_KEY=your-deepgram-api-key
CARTESIA_API_KEY=your-cartesia-api-key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url

# Google OAuth (for Sheets integration)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379

# Optional: Additional configurations
LOG_LEVEL=INFO
WEBHOOK_TIMEOUT=30
MAX_TOOL_EXECUTIONS=10
```

## Firebase Setup

1. **Create Service Account**:
   - Go to Firebase Console > Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file securely
   - Extract values for environment variables

2. **Configure Firestore**:
   - Ensure Firestore is enabled in your Firebase project
   - The backend will create necessary collections automatically

3. **Authentication Setup**:
   - Enable Firebase Authentication
   - The backend validates JWT tokens from the frontend

## LiveKit Setup

### Option 1: LiveKit Cloud (Recommended)
1. Sign up at [LiveKit Cloud](https://cloud.livekit.io)
2. Create a project
3. Copy API key and secret
4. Use the provided WebSocket URL

### Option 2: Self-Hosted LiveKit
1. Deploy LiveKit server:
```bash
docker run -d \
  -p 7880:7880 \
  -p 7881:7881 \
  -p 7882:7882/udp \
  -e LIVEKIT_KEYS="your-api-key: your-api-secret" \
  livekit/livekit-server
```

2. Configure SIP trunk for phone calls (see LiveKit documentation)

## Running the Server

### Development Mode

1. Start the FastAPI server:
```bash
python main.py
```

2. Start the LiveKit agent worker:
```bash
python agent_worker.py
```

3. Access the API documentation:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Production Mode

Use a process manager like supervisor or systemd:

```bash
# With Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# With Uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Project Structure

```
server/
   main.py                     # FastAPI application entry point
   agent_worker.py             # LiveKit agent worker
   phone_agent.py              # Main phone agent logic
   tool_executor.py            # Tool execution engine
   models.py                   # Pydantic models
   database.py                 # Firebase/Firestore operations
   auth.py                     # Authentication middleware
   routers/                    # API route handlers
      agents.py               # Agent CRUD operations
      tools.py                # Tool management
      calls.py                # Call history and analytics
      files.py                # File upload and analysis
      webhooks.py             # Webhook handlers
   services/                   # Business logic services
      google_sheets_service.py # Google Sheets integration
      file_analyzer.py        # Document analysis
      tool_generator.py       # AI tool generation
   utils/                      # Utility functions
   requirements.txt            # Python dependencies
```

## API Endpoints

### Agents
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create new agent
- `GET /api/agents/{id}` - Get agent details
- `PUT /api/agents/{id}` - Update agent
- `DELETE /api/agents/{id}` - Delete agent

### Tools
- `GET /api/tools` - List all tools
- `POST /api/tools/generate` - Generate tools from data
- `POST /api/tools/test` - Test tool execution

### Calls
- `GET /api/calls` - Get call history
- `GET /api/calls/{id}` - Get call details
- `POST /api/calls/test` - Initiate test call

### Files
- `POST /api/files/upload` - Upload business documents
- `POST /api/files/analyze` - Analyze uploaded files

### Webhooks
- `POST /api/webhooks/tool-handler` - Execute webhook tools
- `POST /api/webhooks/twilio` - Handle Twilio callbacks

## Tool System

The backend supports multiple tool types:

### 1. AI-Generated Tools
- Automatically created from business data
- Examples: menu queries, FAQ responses, order processing

### 2. Reference Tools
- Google Sheets integration
- Read/write operations
- Dynamic data management

### 3. Webhook Tools
- External API integrations
- Custom business logic
- Third-party services

### 4. Built-in Tools
- SMS messaging
- Email notifications
- Calendar integration
- Data storage

## Voice Processing

### OpenAI Realtime API (Preferred)
- Ultra-low latency (< 300ms)
- Natural conversation flow
- Direct speech-to-speech

### STT-LLM-TTS Pipeline (Fallback)
- Deepgram for speech recognition
- GPT-4 for conversation logic
- Cartesia for text-to-speech
- Higher latency but more control

## Testing

### Unit Tests
```bash
pytest tests/
```

### Integration Tests
```bash
pytest tests/integration/
```

### Test Phone Calls
1. Use the frontend test interface
2. Or use the API directly:
```bash
curl -X POST http://localhost:8000/api/calls/test \
  -H "Content-Type: application/json" \
  -d '{"agent_id": "your-agent-id", "test_scenario": "booking"}'
```

## Monitoring and Logging

- Logs are written to `logs/` directory
- Use `LOG_LEVEL` environment variable to control verbosity
- Structured logging with request IDs for tracing

## Performance Optimization

1. **Caching**: Enable Redis for improved performance
2. **Connection Pooling**: Database connections are pooled
3. **Async Operations**: All I/O operations are asynchronous
4. **Load Balancing**: Deploy multiple instances behind a load balancer

## Security Considerations

1. **Authentication**: All API endpoints require Firebase JWT tokens
2. **Rate Limiting**: Implement rate limiting in production
3. **Input Validation**: All inputs are validated with Pydantic
4. **Secrets Management**: Never commit credentials to version control
5. **CORS**: Configure allowed origins for production

## Deployment

### Docker Deployment
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud Deployment Options
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- Heroku
- Railway

## Troubleshooting

### Common Issues

1. **LiveKit Connection Failed**:
   - Verify LiveKit server is running
   - Check API key and secret
   - Ensure WebSocket port is open

2. **Firebase Authentication Errors**:
   - Verify service account credentials
   - Check Firebase project ID
   - Ensure proper IAM permissions

3. **Voice Quality Issues**:
   - Enable noise cancellation in LiveKit
   - Check network bandwidth
   - Adjust audio encoding settings

4. **Tool Execution Failures**:
   - Check webhook URLs are accessible
   - Verify Google Sheets permissions
   - Review tool configuration

## Contributing

Please read the main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to this project.

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## Support

For issues and feature requests, please use the GitHub issue tracker.
For urgent support, contact the development team.