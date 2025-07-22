'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BusinessData } from '../types';
import BusinessHours from './BusinessHours';
import FileUploadField from './FileUploadField';

interface RetailFormProps {
  businessData: BusinessData;
  setBusinessData: (data: BusinessData) => void;
}

export default function RetailForm({ 
  businessData, 
  setBusinessData
}: RetailFormProps) {
  return (
    <div className="space-y-6">
      <FileUploadField
        label="Products & Inventory"
        description="Upload your product catalog files or provide product details manually"
        acceptedTypes=".pdf,.jpg,.jpeg,.png,.xlsx,.csv,.doc,.docx"
        textValue={businessData.products || ''}
        onTextChange={(value) => setBusinessData({ ...businessData, products: value })}
        uploadedFiles={businessData.inventoryFiles || []}
        onFilesChange={(files) => setBusinessData({ ...businessData, inventoryFiles: files })}
        businessType="retail"
        fileType="inventory"
        placeholder="List your products with prices, availability, and descriptions."
      />

      {/* Business Hours */}
      <BusinessHours businessData={businessData} setBusinessData={setBusinessData} />

      {/* Additional Information */}
      <div className="space-y-3">
        <Label className="text-white text-base font-medium">Additional Information</Label>
        <Textarea
          placeholder="Any special information about your store (return policies, warranty info, delivery options, etc.)"
          value={businessData.additionalInfo || ''}
          onChange={(e) => setBusinessData({ ...businessData, additionalInfo: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          rows={3}
        />
      </div>
    </div>
  );
}