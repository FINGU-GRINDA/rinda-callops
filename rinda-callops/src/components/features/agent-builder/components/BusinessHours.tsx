'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BusinessData } from '../types';

interface BusinessHoursProps {
  businessData: BusinessData;
  setBusinessData: (data: BusinessData) => void;
}

// Korean business hours defaults
const koreanDefaultHours = {
  monday: '9:00 AM - 9:00 PM',
  tuesday: '9:00 AM - 9:00 PM', 
  wednesday: '9:00 AM - 9:00 PM',
  thursday: '9:00 AM - 9:00 PM',
  friday: '9:00 AM - 9:00 PM',
  saturday: '9:00 AM - 8:00 PM',
  sunday: '10:00 AM - 7:00 PM'
};

export default function BusinessHours({ businessData, setBusinessData }: BusinessHoursProps) {
  const setDefaultHours = () => {
    setBusinessData({
      ...businessData,
      hours: koreanDefaultHours
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-white text-base font-medium">Business Hours</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={setDefaultHours}
          className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10"
        >
          Use Korean Defaults
        </Button>
      </div>
      <p className="text-white/60 text-sm">When are you open?</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
          <div key={day}>
            <Label className="text-white/80 text-sm capitalize">{day}</Label>
            <Input
              placeholder="e.g., 9:00 AM - 9:00 PM or Closed"
              value={businessData.hours?.[day as keyof typeof businessData.hours] || ''}
              onChange={(e) => setBusinessData({
                ...businessData,
                hours: { ...businessData.hours, [day]: e.target.value }
              })}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
        ))}
      </div>
    </div>
  );
}