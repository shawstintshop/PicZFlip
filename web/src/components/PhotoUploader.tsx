import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { analyzePhoto } from '../services/api';
import toast from 'react-hot-toast';

interface PhotoUploaderProps {
  onAnalysisStart: (analysisId: string) => void;
  className?: string;
}

export function PhotoUploader({ onAnalysisStart, className = '' }: PhotoUploaderProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeImage = () => {
    setSelectedImage(null);
    setPreview(null);
  };

  const startAnalysis = async () => {
    if (!selectedImage) return;

    try {
      setIsUploading(true);
      
      // Convert image to base64
      const base64 = await fileToBase64(selectedImage);
      
      // Start analysis
      const result = await analyzePhoto(base64);
      
      if (result.analysisId) {
        toast.success('Analysis started successfully!');
        onAnalysisStart(result.analysisId);
      } else {
        throw new Error('No analysis ID received');
      }
    } catch (error: any) {
      console.error('Analysis failed:', error);
      toast.error(error.message || 'Failed to start analysis');
    } finally {
      setIsUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {!selectedImage ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              {isDragActive ? (
                <Upload className="w-8 h-8 text-blue-600" />
              ) : (
                <Camera className="w-8 h-8 text-gray-400" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop your image here' : 'Upload an image'}
              </h3>
              <p className="text-gray-600">
                {isDragActive
                  ? 'Release to upload'
                  : 'Drag & drop an image, or click to select'}
              </p>
            </div>
            
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                fileInput?.click();
              }}
            >
              Select Image
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Image Preview */}
          <div className="relative">
            <img
              src={preview!}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg shadow-lg"
            />
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          {/* Image Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <ImageIcon className="w-5 h-5 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedImage.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={removeImage}
              className="btn btn-secondary flex-1"
              disabled={isUploading}
            >
              Choose Different Image
            </button>
            <button
              onClick={startAnalysis}
              className="btn btn-primary flex-1"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Starting Analysis...
                </>
              ) : (
                'Start Analysis'
              )}
            </button>
          </div>
          
          {/* Tips */}
          <div className="text-sm text-gray-500 text-center">
            <p>💡 Tip: Ensure good lighting and clear focus for best results</p>
            <p>📱 Works great with photos from your phone or camera</p>
          </div>
        </div>
      )}
    </div>
  );
}
