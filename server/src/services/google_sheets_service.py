import logging
from typing import List, Dict, Any, Optional
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import json

logger = logging.getLogger(__name__)

class GoogleSheetsService:
    """Service for interacting with Google Sheets API"""
    
    def __init__(self, access_token: str, refresh_token: Optional[str] = None):
        """Initialize with OAuth tokens"""
        import os
        self.credentials = Credentials(
            token=access_token,
            refresh_token=refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=os.getenv('GOOGLE_CLIENT_ID'),
            client_secret=os.getenv('GOOGLE_CLIENT_SECRET'),
        )
        self.service = build('sheets', 'v4', credentials=self.credentials)
    
    async def read_sheet(self, spreadsheet_id: str, range_name: str) -> List[List[Any]]:
        """Read data from a Google Sheet"""
        try:
            result = self.service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()
            
            values = result.get('values', [])
            logger.info(f"Read {len(values)} rows from sheet {spreadsheet_id}")
            return values
            
        except HttpError as error:
            logger.error(f"Error reading sheet: {error}")
            raise
    
    async def append_to_sheet(self, spreadsheet_id: str, range_name: str, values: List[List[Any]]) -> Dict[str, Any]:
        """Append data to a Google Sheet"""
        try:
            body = {
                'values': values
            }
            
            result = self.service.spreadsheets().values().append(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption='USER_ENTERED',
                insertDataOption='INSERT_ROWS',
                body=body
            ).execute()
            
            logger.info(f"Appended {len(values)} rows to sheet {spreadsheet_id}")
            return result
            
        except HttpError as error:
            logger.error(f"Error appending to sheet: {error}")
            raise
    
    async def update_sheet(self, spreadsheet_id: str, range_name: str, values: List[List[Any]]) -> Dict[str, Any]:
        """Update data in a Google Sheet"""
        try:
            body = {
                'values': values
            }
            
            result = self.service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id,
                range=range_name,
                valueInputOption='USER_ENTERED',
                body=body
            ).execute()
            
            logger.info(f"Updated {result.get('updatedCells', 0)} cells in sheet {spreadsheet_id}")
            return result
            
        except HttpError as error:
            logger.error(f"Error updating sheet: {error}")
            raise
    
    async def find_row_by_value(self, spreadsheet_id: str, sheet_name: str, column: str, value: str) -> Optional[int]:
        """Find a row number by searching for a value in a specific column"""
        try:
            # Read the entire column
            range_name = f"{sheet_name}!{column}:{column}"
            result = self.service.spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=range_name
            ).execute()
            
            values = result.get('values', [])
            
            # Find the row with the matching value
            for i, row in enumerate(values):
                if row and str(row[0]).lower() == str(value).lower():
                    return i + 1  # Sheets are 1-indexed
            
            return None
            
        except HttpError as error:
            logger.error(f"Error finding row: {error}")
            return None


class OrderSheetManager:
    """Manager for order-specific Google Sheets operations"""
    
    def __init__(self, sheets_service: GoogleSheetsService):
        self.sheets = sheets_service
    
    async def add_order(self, spreadsheet_id: str, order_data: Dict[str, Any]) -> str:
        """Add a new order to the orders sheet"""
        from datetime import datetime
        
        # Generate order ID
        order_id = f"ORD-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        # Format order data for sheet
        values = [[
            order_id,
            datetime.now().strftime('%Y-%m-%d'),
            datetime.now().strftime('%H:%M:%S'),
            order_data.get('customer_name', ''),
            order_data.get('phone_number', ''),
            order_data.get('items', ''),  # Already a string from the AI
            order_data.get('total_amount', ''),
            'New',  # Initial status
            order_data.get('delivery_address', ''),
            order_data.get('notes', '')  # Added notes field
        ]]
        
        # Append to the next available row after headers (A2:J ensures data starts from row 2)
        await self.sheets.append_to_sheet(spreadsheet_id, 'Orders!A2:J', values)
        return order_id
    
    async def update_order_status(self, spreadsheet_id: str, order_id: str, status: str) -> bool:
        """Update the status of an existing order"""
        # Find the order row
        row_num = await self.sheets.find_row_by_value(spreadsheet_id, 'Orders', 'A', order_id)
        
        if row_num:
            # Update status column (column H)
            await self.sheets.update_sheet(
                spreadsheet_id, 
                f'Orders!H{row_num}', 
                [[status]]
            )
            return True
        
        return False
    
    async def get_recent_orders(self, spreadsheet_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent orders from the sheet"""
        values = await self.sheets.read_sheet(spreadsheet_id, f'Orders!A2:J{limit + 1}')
        
        orders = []
        for row in values:
            if len(row) >= 8:
                orders.append({
                    'order_id': row[0],
                    'date': row[1],
                    'time': row[2],
                    'customer_name': row[3],
                    'phone_number': row[4],
                    'items': json.loads(row[5]) if row[5] else [],
                    'total_amount': row[6],
                    'status': row[7],
                    'delivery_address': row[8] if len(row) > 8 else '',
                    'notes': row[9] if len(row) > 9 else ''
                })
        
        return orders


class FAQSheetManager:
    """Manager for FAQ-specific Google Sheets operations"""
    
    def __init__(self, sheets_service: GoogleSheetsService):
        self.sheets = sheets_service
    
    async def get_all_faqs(self, spreadsheet_id: str) -> List[Dict[str, str]]:
        """Get all FAQs from the sheet"""
        values = await self.sheets.read_sheet(spreadsheet_id, 'FAQ!A2:C')
        
        faqs = []
        for row in values:
            if len(row) >= 2:
                faqs.append({
                    'question': row[0],
                    'answer': row[1],
                    'category': row[2] if len(row) > 2 else 'General'
                })
        
        return faqs
    
    async def find_answer(self, spreadsheet_id: str, question: str) -> Optional[str]:
        """Find the best matching answer for a question"""
        faqs = await self.get_all_faqs(spreadsheet_id)
        
        # Simple keyword matching (can be enhanced with better NLP)
        question_lower = question.lower()
        best_match = None
        best_score = 0
        
        for faq in faqs:
            faq_question_lower = faq['question'].lower()
            
            # Calculate simple matching score
            score = 0
            question_words = set(question_lower.split())
            faq_words = set(faq_question_lower.split())
            
            # Count matching words
            matching_words = question_words.intersection(faq_words)
            if matching_words:
                score = len(matching_words) / max(len(question_words), len(faq_words))
            
            # Exact match gets highest score
            if question_lower == faq_question_lower:
                score = 1.0
            
            if score > best_score:
                best_score = score
                best_match = faq
        
        # Return answer if we have a reasonable match
        if best_match and best_score > 0.3:
            return best_match['answer']
        
        return None
    
    async def add_faq(self, spreadsheet_id: str, question: str, answer: str, category: str = 'General') -> bool:
        """Add a new FAQ to the sheet"""
        values = [[question, answer, category]]
        
        await self.sheets.append_to_sheet(spreadsheet_id, 'FAQ!A:C', values)
        return True