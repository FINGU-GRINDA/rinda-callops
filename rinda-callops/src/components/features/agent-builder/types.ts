export interface AgentData {
  name: string;
  business_name: string;
  business_type: string;
  business_description: string;
  custom_requirements: string;
  instructions: string;
  first_message: string;
  voice: string;
  language: string;
}

export interface Tool {
  name: string;
  display_name?: string;
  description: string;
  type: 'function' | 'api_call' | 'database_query' | 'custom';
  enabled: boolean;
  configuration?: Record<string, any>;
  json_schema?: Record<string, any>;
}

export interface FileUploadResult {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface BusinessData {
  // Restaurant specific
  menu?: File | string;
  menuFiles?: FileUploadResult[];
  
  // Salon specific
  services?: File | string;
  serviceFiles?: FileUploadResult[];
  stylists?: string;
  
  // Medical specific
  doctors?: string;
  insuranceAccepted?: string;
  
  // Retail specific
  inventory?: File | string;
  inventoryFiles?: FileUploadResult[];
  products?: string;
  
  // Real Estate specific
  listings?: File | string;
  listingFiles?: FileUploadResult[];
  agents?: string;
  serviceAreas?: string;
  
  // Common for all
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  additionalInfo?: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  accent: string;
}