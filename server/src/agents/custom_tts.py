"""
Custom TTS wrapper that preprocesses text
"""
from typing import AsyncIterator
from livekit.plugins import cartesia
from livekit.agents.tts import TTS, ChunkedStream, TTSCapabilities
from ..utils.text_processor import clean_text_for_tts
import logging

logger = logging.getLogger(__name__)


class PreprocessedTTS:
    """TTS wrapper that cleans text before synthesis"""
    
    def __init__(self, base_tts: TTS):
        self._base_tts = base_tts
        # Delegate all attributes from base TTS
        for attr in dir(base_tts):
            if not attr.startswith('__') and not hasattr(self, attr):
                setattr(self, attr, getattr(base_tts, attr))
    
    def synthesize(self, text: str, **kwargs) -> ChunkedStream:
        """Synthesize speech with preprocessed text"""
        # Clean the text
        original_text = text
        cleaned_text = clean_text_for_tts(text)
        
        # Always log to debug TTS issues
        logger.info(f"TTS text preprocessing: Original: '{original_text}'")
        logger.info(f"TTS text preprocessing: Cleaned: '{cleaned_text}'")
        
        # Use the base TTS with cleaned text
        return self._base_tts.synthesize(cleaned_text, **kwargs)
    
    def stream(self, **kwargs):
        """Delegate stream method to base TTS"""
        return self._base_tts.stream(**kwargs)
    
    async def aclose(self):
        """Delegate aclose to base TTS"""
        if hasattr(self._base_tts, 'aclose'):
            await self._base_tts.aclose()
    
    @property
    def capabilities(self) -> TTSCapabilities:
        return self._base_tts.capabilities
    
    @property
    def sample_rate(self) -> int:
        return self._base_tts.sample_rate
    
    @property
    def num_channels(self) -> int:
        return self._base_tts.num_channels