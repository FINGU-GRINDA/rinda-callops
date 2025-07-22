'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BusinessData } from '../types';
import BusinessHours from './BusinessHours';

interface MedicalFormProps {
  businessData: BusinessData;
  setBusinessData: (data: BusinessData) => void;
}

export default function MedicalForm({ 
  businessData, 
  setBusinessData
}: MedicalFormProps) {
  return (
    <div className="space-y-6">
      {/* Doctors Information */}
      <div className="space-y-3">
        <Label className="text-white text-base font-medium">Doctors & Staff</Label>
        <p className="text-white/60 text-sm">Tell us about your medical staff</p>
        <Textarea
          placeholder="List your doctors and their specialties..."
          value={businessData.doctors || ''}
          onChange={(e) => setBusinessData({ ...businessData, doctors: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          rows={3}
        />
      </div>

      {/* Insurance Information */}
      <div className="space-y-3">
        <Label className="text-white text-base font-medium">Insurance Accepted</Label>
        <p className="text-white/60 text-sm">What insurance plans do you accept?</p>
        <Textarea
          placeholder="List insurance plans you accept..."
          value={businessData.insuranceAccepted || ''}
          onChange={(e) => setBusinessData({ ...businessData, insuranceAccepted: e.target.value })}
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
          placeholder="Any special information about your practice (emergency procedures, patient policies, etc.)"
          value={businessData.additionalInfo || ''}
          onChange={(e) => setBusinessData({ ...businessData, additionalInfo: e.target.value })}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          rows={3}
        />
      </div>
    </div>
  );
}