'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BusinessData, FileUploadResult } from '../types';
import BusinessHours from './BusinessHours';
import FileUploadField from './FileUploadField';

interface RestaurantFormProps {
  businessData: BusinessData;
  setBusinessData: (data: BusinessData) => void;
}

export default function RestaurantForm({ 
  businessData, 
  setBusinessData
}: RestaurantFormProps) {
  return (
    <div className="space-y-6">
      <FileUploadField
        label="Menu Information"
        description="Upload your menu files or provide menu details manually"
        acceptedTypes=".pdf,.jpg,.jpeg,.png,.xlsx,.csv,.doc,.docx"
        textValue={typeof businessData.menu === 'string' ? businessData.menu : ''}
        onTextChange={(value) => setBusinessData({ ...businessData, menu: value })}
        uploadedFiles={businessData.menuFiles || []}
        onFilesChange={(files) => setBusinessData({ ...businessData, menuFiles: files })}
        businessType="restaurant"
        fileType="menu"
        placeholder="List your menu items with prices, categories, dietary options, etc."
      />

      {/* Business Hours */}
      <BusinessHours businessData={businessData} setBusinessData={setBusinessData} />

      {/* Additional Information */}
      <div className="space-y-3">
        <Label className="text-white text-base font-medium">Additional Information</Label>
        <Textarea
          placeholder="Any special information about your restaurant (delivery areas, special services, dietary options, etc.)"
          value={businessData.additionalInfo || ''}
          onChange={(e) => setBusinessData({ ...businessData, additionalInfo: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          rows={3}
        />
      </div>
    </div>
  );
}