"""
Text processing utilities for TTS
"""
import re


def clean_text_for_tts(text: str) -> str:
    """
    Clean text before sending to TTS to avoid speaking formatting characters
    
    Args:
        text: Raw text from LLM
        
    Returns:
        Cleaned text suitable for TTS
    """
    # First, remove ALL asterisks and other symbols that TTS might pronounce
    text = text.replace('*', '')
    text = text.replace('#', '')
    text = text.replace('_', ' ')  # Replace underscores with spaces
    text = text.replace('`', '')   # Remove backticks
    
    # Remove markdown bold indicators (already handled by asterisk removal)
    # text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    # text = re.sub(r'\*(.+?)\*', r'\1', text)
    
    # Remove markdown italic indicators
    text = re.sub(r'__(.+?)__', r'\1', text)
    text = re.sub(r'_(.+?)_', r'\1', text)
    
    # Remove markdown code blocks
    text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)
    text = re.sub(r'`(.+?)`', r'\1', text)
    
    # Remove markdown headers
    text = re.sub(r'^#+\s+', '', text, flags=re.MULTILINE)
    
    # Remove markdown links but keep the text
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
    
    # Remove markdown lists and bullet points
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'•\s*', '', text)  # Remove bullet points
    
    # Remove multiple spaces
    text = re.sub(r'\s+', ' ', text)
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    return text