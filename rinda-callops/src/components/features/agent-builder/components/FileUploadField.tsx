'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { uploadFileToStorage, FileUploadResult } from '../utils/fileUpload';
import { Upload, X, Check, Loader2 } from 'lucide-react';

interface FileUploadFieldProps {
  label: string;
  description: string;
  acceptedTypes: string;
  textValue: string;
  onTextChange: (value: string) => void;
  uploadedFiles: FileUploadResult[];
  onFilesChange: (files: FileUploadResult[]) => void;
  businessType: string;
  fileType: 'menu' | 'services' | 'inventory' | 'listings' | 'other';
  placeholder: string;
}

export default function FileUploadField({
  label,
  description,
  acceptedTypes,
  textValue,
  onTextChange,
  uploadedFiles,
  onFilesChange,
  businessType,
  fileType,
  placeholder
}: FileUploadFieldProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploadPromises = Array.from(files).map(file =>
        uploadFileToStorage(file, businessType, user.uid, fileType)
      );

      const uploadResults = await Promise.all(uploadPromises);
      onFilesChange([...uploadedFiles, ...uploadResults]);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload files');
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="space-y-3">
      <Label className="text-white text-base font-medium">{label}</Label>
      <p className="text-white/60 text-sm">{description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File Upload Section */}
        <div className="space-y-2">
          <Label className="text-white/80 text-sm">Upload Files</Label>
          <div className="relative">
            <input
              type="file"
              accept={acceptedTypes}
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="mt-1 block w-full text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 disabled:opacity-50"
            />
            {uploading && (
              <div className="absolute inset-0 bg-white/5 flex items-center justify-center rounded">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              </div>
            )}
          </div>
          
          {uploadError && (
            <p className="text-red-400 text-sm">{uploadError}</p>
          )}
          
          {/* Show uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              <Label className="text-white/80 text-sm">Uploaded Files:</Label>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-white/70 text-sm truncate">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-white/50 hover:text-white h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Text Input Section */}
        <div>
          <Label className="text-white/80 text-sm">Or Enter Details Manually</Label>
          <Textarea
            placeholder={placeholder}
            value={textValue}
            onChange={(e) => onTextChange(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}