'use client';

import { storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface FileUploadResult {
  url: string;
  name: string;
  type: string;
  size: number;
}

export async function uploadFileToStorage(
  file: File, 
  businessType: string, 
  userId: string,
  fileType: 'menu' | 'services' | 'inventory' | 'listings' | 'other' = 'other'
): Promise<FileUploadResult> {
  try {
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${fileType}_${timestamp}.${fileExtension}`;
    
    // Create storage reference
    const storageRef = ref(storage, `business-data/${userId}/${businessType}/${filename}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      name: file.name,
      type: file.type,
      size: file.size
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file. Please try again.');
  }
}

export async function uploadMultipleFiles(
  files: File[],
  businessType: string,
  userId: string,
  fileType: 'menu' | 'services' | 'inventory' | 'listings' | 'other' = 'other'
): Promise<FileUploadResult[]> {
  const uploadPromises = files.map(file => 
    uploadFileToStorage(file, businessType, userId, fileType)
  );
  
  return Promise.all(uploadPromises);
}