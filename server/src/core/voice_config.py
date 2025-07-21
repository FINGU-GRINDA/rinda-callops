"""
Voice configuration for different languages and TTS providers
"""

# Cartesia voice IDs for different languages
# You can find more voices at https://play.cartesia.ai/voices
CARTESIA_VOICES = {
    "en": {
        "default": "f786b574-daa5-4673-aa0c-cbe3e8534c02",  # Sonic default
        "male": "794f9389-aac1-45b6-b726-9d9369183238",
        "female": "a0e99841-438c-4a64-b679-ae501e7d6091",
        "professional": "c79f1d8a-f472-4816-8a3b-a1f245f50733",
    },
    "ko": {
        # Korean voices - these are example IDs, you should replace with actual Korean voice IDs from Cartesia
        "default": "95856005-0332-41b0-935f-352e296aa0df",  # Korean male voice
        "male": "95856005-0332-41b0-935f-352e296aa0df",
        "female": "cd17ff2d-5ea4-4695-be8f-42193949b946",  # Korean female voice
        "professional": "156fb8d2-335b-4950-9cb3-a2d33befec77",  # Korean professional voice
    },
    "ja": {
        "default": "846d6cb0-2301-48b5-a444-e1e5262fe723",
        "male": "846d6cb0-2301-48b5-a444-e1e5262fe723",
        "female": "daf747c6-6bc2-4083-bd59-aa94dce23f5d",
    },
    "zh": {
        "default": "5345cf08-6f37-424d-a5d9-8ae1101b9377",
        "male": "5345cf08-6f37-424d-a5d9-8ae1101b9377",
        "female": "042d5fe5-0afc-4c28-8ed6-ce61a8e33430",
    },
    "es": {
        "default": "5619d38c-cf51-4d8e-9575-48f61a280413",
        "male": "5619d38c-cf51-4d8e-9575-48f61a280413",
        "female": "9c7d5142-3965-4930-a47b-ee44dff40934",
    },
    "fr": {
        "default": "ab7c61f5-3daa-47dd-a23b-4ac0aac5f5c3",
        "male": "ab7c61f5-3daa-47dd-a23b-4ac0aac5f5c3",
        "female": "44c42de2-4f74-4cdc-be86-3a943f734fb7",
    },
}

# Language code mappings
LANGUAGE_MAPPINGS = {
    # Full locale to language code
    "en-US": "en",
    "en-GB": "en",
    "es-ES": "es",
    "es-MX": "es",
    "fr-FR": "fr",
    "de-DE": "de",
    "it-IT": "it",
    "pt-BR": "pt",
    "pt-PT": "pt",
    "ja-JP": "ja",
    "ko-KR": "ko",
    "zh-CN": "zh",
    "zh-TW": "zh",
    "nl-NL": "nl",
    "pl-PL": "pl",
    "ru-RU": "ru",
    "sv-SE": "sv",
    "tr-TR": "tr",
    "hi-IN": "hi",
}

# Cartesia language codes (ISO 639-1)
CARTESIA_LANGUAGE_CODES = {
    "en-US": "en",
    "es-ES": "es",
    "fr-FR": "fr",
    "de-DE": "de",
    "it-IT": "it",
    "pt-BR": "pt",
    "ja-JP": "ja",
    "ko-KR": "ko",
    "zh-CN": "zh",
    "nl-NL": "nl",
    "pl-PL": "pl",
    "ru-RU": "ru",
    "sv-SE": "sv",
    "tr-TR": "tr",
    "hi-IN": "hi",
}

# OpenAI to Cartesia voice mapping (only new voices from 2024)
OPENAI_TO_CARTESIA_MAPPING = {
    # New OpenAI voices (2024) - mapping to appropriate Cartesia voices
    "ash": "male",        # Ash has a deeper, masculine tone
    "ballad": "professional",  # Ballad has a British accent, professional sound
    "coral": "female",    # Coral has a warm, feminine voice
    "sage": "professional",    # Sage has a wise, professional tone
    "verse": "female"     # Verse has a melodic, feminine quality
}

def get_cartesia_voice(language: str, voice_type: str = "default") -> str:
    """
    Get Cartesia voice ID for a given language and voice type
    
    Args:
        language: Language code (e.g., "ko-KR", "en-US", "ko", "en")
        voice_type: Type of voice ("default", "male", "female", "professional")
    
    Returns:
        Cartesia voice ID
    """
    # Convert full locale to language code if needed
    lang_code = LANGUAGE_MAPPINGS.get(language, language)
    
    # Get voices for language
    lang_voices = CARTESIA_VOICES.get(lang_code, CARTESIA_VOICES["en"])
    
    # Get specific voice type or fall back to default
    return lang_voices.get(voice_type, lang_voices["default"])

def get_cartesia_language_code(language: str) -> str:
    """
    Get Cartesia language code for a given language
    
    Args:
        language: Language code (e.g., "ko-KR", "en-US")
    
    Returns:
        ISO 639-1 language code for Cartesia
    """
    return CARTESIA_LANGUAGE_CODES.get(language, "en")