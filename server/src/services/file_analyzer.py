import base64
import logging
from typing import Dict, Any, List, Optional
import mimetypes
from openai import AsyncOpenAI
import json

from ..core.config import settings

logger = logging.getLogger(__name__)


class FileAnalyzerService:
    """Service for analyzing uploaded business files"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
    
    async def analyze_file(
        self,
        file_content: bytes,
        file_name: str,
        file_type: Optional[str] = None,
        business_context: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Analyze a file and extract business-relevant information"""
        
        # Determine file type
        if not file_type:
            file_type, _ = mimetypes.guess_type(file_name)
        
        # Route to appropriate analyzer
        if file_type and file_type.startswith("image/"):
            return await self._analyze_image(file_content, file_name, business_context)
        elif file_type == "application/pdf":
            return await self._analyze_pdf(file_content, file_name, business_context)
        elif file_type in ["text/plain", "text/csv"]:
            return await self._analyze_text(file_content, file_name, business_context)
        else:
            return {
                "type": "unknown",
                "error": f"Unsupported file type: {file_type}",
                "fileName": file_name
            }
    
    async def _analyze_image(
        self,
        image_content: bytes,
        file_name: str,
        business_context: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Analyze image using OpenAI Vision API"""
        
        # Convert image to base64
        base64_image = base64.b64encode(image_content).decode('utf-8')
        
        # Build prompt based on context
        prompt = """Analyze this business image and extract relevant information.
If it's a menu, list all items with prices.
If it's a service list, extract all services and prices.
If it's a schedule or hours, extract the timing information.
If it's inventory or product list, extract product names and details.

Return the data in a structured JSON format."""
        
        if business_context:
            prompt = f"{prompt}\n\nBusiness Context: {business_context}"
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                response_format={"type": "json_object"},
                max_tokens=2000,
            )
            
            content = response.choices[0].message.content
            analysis = json.loads(content)
            
            # Determine content type and structure response
            if "menu" in file_name.lower() or "items" in analysis:
                return {
                    "type": "menu",
                    "fileName": file_name,
                    "items": analysis.get("items", []),
                    "categories": analysis.get("categories", []),
                    "insights": analysis.get("insights", [])
                }
            elif "service" in file_name.lower() or "services" in analysis:
                return {
                    "type": "services",
                    "fileName": file_name,
                    "services": analysis.get("services", []),
                    "categories": analysis.get("categories", []),
                    "insights": analysis.get("insights", [])
                }
            elif "hour" in file_name.lower() or "schedule" in file_name.lower():
                return {
                    "type": "hours",
                    "fileName": file_name,
                    "hours": analysis.get("hours", {}),
                    "special_hours": analysis.get("special_hours", [])
                }
            else:
                return {
                    "type": "general",
                    "fileName": file_name,
                    "data": analysis,
                    "insights": analysis.get("insights", [])
                }
                
        except Exception as e:
            logger.error(f"Error analyzing image: {str(e)}")
            return {
                "type": "error",
                "fileName": file_name,
                "error": str(e)
            }
    
    async def _analyze_pdf(
        self,
        pdf_content: bytes,
        file_name: str,
        business_context: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Analyze PDF document"""
        
        # For now, we'll need to extract text from PDF first
        # This would require a PDF processing library like PyPDF2
        # For MVP, we'll return a placeholder
        
        return {
            "type": "pdf",
            "fileName": file_name,
            "error": "PDF analysis not yet implemented. Please upload images or text files for now."
        }
    
    async def _analyze_text(
        self,
        text_content: bytes,
        file_name: str,
        business_context: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Analyze text or CSV file"""
        
        try:
            text = text_content.decode('utf-8')
            
            prompt = f"""Analyze this business text file and extract relevant information.
Identify if it contains menu items, services, inventory, or other business data.
Structure the output appropriately.

Text content:
{text[:3000]}  # Limit to first 3000 chars

Return the analysis in JSON format."""
            
            if business_context:
                prompt = f"{prompt}\n\nBusiness Context: {business_context}"
            
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system",
                        "content": "You are analyzing business documents to extract structured data."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.3,
            )
            
            content = response.choices[0].message.content
            analysis = json.loads(content)
            
            return {
                "type": "text",
                "fileName": file_name,
                "data": analysis,
                "insights": analysis.get("insights", [])
            }
            
        except Exception as e:
            logger.error(f"Error analyzing text: {str(e)}")
            return {
                "type": "error",
                "fileName": file_name,
                "error": str(e)
            }
    
    async def analyze_multiple_files(
        self,
        files: List[Dict[str, Any]],
        business_context: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Analyze multiple files and return combined results"""
        
        results = []
        
        for file_data in files:
            result = await self.analyze_file(
                file_content=file_data["content"],
                file_name=file_data["name"],
                file_type=file_data.get("type"),
                business_context=business_context,
            )
            results.append(result)
        
        return results


# Singleton instance
file_analyzer_service = FileAnalyzerService()