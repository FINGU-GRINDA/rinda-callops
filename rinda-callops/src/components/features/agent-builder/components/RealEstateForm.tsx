'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BusinessData } from '../types';
import BusinessHours from './BusinessHours';
import FileUploadField from './FileUploadField';

interface RealEstateFormProps {
  businessData: BusinessData;
  setBusinessData: (data: BusinessData) => void;
}

export default function RealEstateForm({ 
  businessData, 
  setBusinessData
}: RealEstateFormProps) {
  return (
    <div className="space-y-6">
      <FileUploadField
        label="Property Listings"
        description="Upload your current property listings or provide listing details manually"
        acceptedTypes=".pdf,.jpg,.jpeg,.png,.xlsx,.csv,.doc,.docx"
        textValue={typeof businessData.listings === 'string' ? businessData.listings : ''}
        onTextChange={(value) => setBusinessData({ ...businessData, listings: value })}
        uploadedFiles={businessData.listingFiles || []}
        onFilesChange={(files) => setBusinessData({ ...businessData, listingFiles: files })}
        businessType="real-estate"
        fileType="listings"
        placeholder="Describe your current property listings with prices, locations, and features."
      />

      {/* Agents Information */}
      <div className="space-y-3">
        <Label className="text-white text-base font-medium">Real Estate Agents</Label>
        <p className="text-white/60 text-sm">Tell us about your agents and their specialties</p>
        <Textarea
          placeholder="List your agents and their specialties (commercial, residential, etc.)..."
          value={businessData.agents || ''}
          onChange={(e) => setBusinessData({ ...businessData, agents: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          rows={3}
        />
      </div>

      {/* Service Areas */}
      <div className="space-y-3">
        <Label className="text-white text-base font-medium">Service Areas</Label>
        <p className="text-white/60 text-sm">What areas do you serve?</p>
        <Textarea
          placeholder="List the cities, neighborhoods, or regions you serve..."
          value={businessData.serviceAreas || ''}
          onChange={(e) => setBusinessData({ ...businessData, serviceAreas: e.target.value })}
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
          placeholder="Any special information about your real estate services (financing help, market insights, etc.)"
          value={businessData.additionalInfo || ''}
          onChange={(e) => setBusinessData({ ...businessData, additionalInfo: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          rows={3}
        />
      </div>
    </div>
  );
}