'use client';

import { BusinessData } from '../types';
import RestaurantForm from './RestaurantForm';
import SalonForm from './SalonForm';
import MedicalForm from './MedicalForm';
import RetailForm from './RetailForm';
import RealEstateForm from './RealEstateForm';

interface BusinessDataFormProps {
  businessType: string;
  businessData: BusinessData;
  setBusinessData: (data: BusinessData) => void;
}

export default function BusinessDataForm({
  businessType,
  businessData,
  setBusinessData
}: BusinessDataFormProps) {
  const formProps = {
    businessData,
    setBusinessData
  };

  switch (businessType) {
    case 'restaurant':
      return <RestaurantForm {...formProps} />;
    case 'salon':
      return <SalonForm {...formProps} />;
    case 'medical':
      return <MedicalForm {...formProps} />;
    case 'retail':
      return <RetailForm {...formProps} />;
    case 'real-estate':
      return <RealEstateForm {...formProps} />;
    default:
      return (
        <div className="text-center text-white/70 py-8">
          Please select a business type to continue
        </div>
      );
  }
}