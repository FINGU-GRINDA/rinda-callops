'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BusinessData } from '../types';
import BusinessHours from './BusinessHours';
import FileUploadField from './FileUploadField';

interface SalonFormProps {
  businessData: BusinessData;
  setBusinessData: (data: BusinessData) => void;
}

export default function SalonForm({ 
  businessData, 
  setBusinessData
}: SalonFormProps) {
  return (
    <div className="space-y-6">
      <FileUploadField
        label="Services & Pricing"
        description="Upload your service menu files or provide service details manually"
        acceptedTypes=".pdf,.jpg,.jpeg,.png,.xlsx,.csv,.doc,.docx"
        textValue={typeof businessData.services === 'string' ? businessData.services : ''}
        onTextChange={(value) => setBusinessData({ ...businessData, services: value })}
        uploadedFiles={businessData.serviceFiles || []}
        onFilesChange={(files) => setBusinessData({ ...businessData, serviceFiles: files })}
        businessType="salon"
        fileType="services"
        placeholder="List your services with prices, duration, and descriptions."
      />

      {/* Staff Information */}
      <div className="space-y-3">
        <Label className="text-white text-base font-medium">Staff Information</Label>
        <p className="text-white/60 text-sm">Tell us about your stylists and staff</p>
        <Textarea
          placeholder="List your stylists/staff names and their specialties..."
          value={businessData.stylists || ''}
          onChange={(e) => setBusinessData({ ...businessData, stylists: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          rows={3}
        />
      </div>

      {/* Business Hours */}
      <BusinessHours businessData={businessData} setBusinessData={setBusinessData} />

      {/* Additional Information */}
      <div className="space-y-3">
        <Label className="text-white text-base font-medium">Additional Information</Label>
        <Textarea
          placeholder="Any special information about your salon (products used, special packages, etc.)"
          value={businessData.additionalInfo || ''}
          onChange={(e) => setBusinessData({ ...businessData, additionalInfo: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          rows={3}
        />
      </div>
    </div>
  );
}