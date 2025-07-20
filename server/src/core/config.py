import os
from pydantic import Field
from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # LiveKit Configuration
    livekit_url: str = Field(default=os.getenv("LIVEKIT_URL", ""))
    livekit_api_key: str = Field(default=os.getenv("LIVEKIT_API_KEY", ""))
    livekit_api_secret: str = Field(default=os.getenv("LIVEKIT_API_SECRET", ""))
    
    # AI Services
    openai_api_key: str = Field(default=os.getenv("OPENAI_API_KEY", ""))
    deepgram_api_key: str = Field(default=os.getenv("DEEPGRAM_API_KEY", ""))
    cartesia_api_key: str = Field(default=os.getenv("CARTESIA_API_KEY", ""))
    
    # Twilio Configuration
    twilio_account_sid: str = Field(default=os.getenv("TWILIO_ACCOUNT_SID", ""))
    twilio_auth_token: str = Field(default=os.getenv("TWILIO_AUTH_TOKEN", ""))
    twilio_phone_number: str = Field(default=os.getenv("TWILIO_PHONE_NUMBER", ""))
    
    # Server Configuration
    api_port: int = Field(default=int(os.getenv("API_PORT", "8000")))
    api_host: str = Field(default=os.getenv("API_HOST", "0.0.0.0"))
    webhook_url: str = Field(default=os.getenv("WEBHOOK_URL", "http://localhost:8000/webhooks"))
    
    # Redis Configuration
    redis_url: Optional[str] = Field(default=os.getenv("REDIS_URL"))
    
    # Frontend URL
    frontend_url: str = Field(default=os.getenv("FRONTEND_URL", "http://localhost:3000"))
    
    # Firebase Configuration
    firebase_project_id: str = Field(default=os.getenv("FIREBASE_PROJECT_ID", ""))
    firebase_private_key_id: str = Field(default=os.getenv("FIREBASE_PRIVATE_KEY_ID", ""))
    firebase_private_key: str = Field(default=os.getenv("FIREBASE_PRIVATE_KEY", ""))
    firebase_client_email: str = Field(default=os.getenv("FIREBASE_CLIENT_EMAIL", ""))
    firebase_client_id: str = Field(default=os.getenv("FIREBASE_CLIENT_ID", ""))
    firebase_auth_uri: str = Field(default=os.getenv("FIREBASE_AUTH_URI", ""))
    firebase_token_uri: str = Field(default=os.getenv("FIREBASE_TOKEN_URI", ""))
    firebase_auth_provider_cert_url: str = Field(default=os.getenv("FIREBASE_AUTH_PROVIDER_CERT_URL", ""))
    firebase_client_cert_url: str = Field(default=os.getenv("FIREBASE_CLIENT_CERT_URL", ""))
    
    # Agent Configuration
    agent_name: str = Field(default="phone-agent")
    max_call_duration: int = Field(default=600)  # 10 minutes
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()