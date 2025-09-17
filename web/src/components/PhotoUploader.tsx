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
    <div className={`w-full max-w-2xl mx-auto space-y-6 ${className}`}>
      {!selectedImage ? (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-3xl border border-dashed border-slate-300/80 bg-slate-50/80 p-10 text-center transition ${
            isDragActive
              ? 'border-slate-400 bg-slate-100'
              : 'hover:border-slate-400 hover:bg-slate-100'
          }`}
        >
          <input {...getInputProps()} />

          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow">
              {isDragActive ? (
                <Upload className="h-7 w-7 text-slate-500" />
              ) : (
                <Camera className="h-7 w-7 text-slate-400" />
              )}
            </div>

            <div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">
                {isDragActive ? 'Drop your image here' : 'Upload an image'}
              </h3>
              <p className="text-sm text-slate-500">
                {isDragActive
                  ? 'Release to upload'
                  : 'Drag & drop an image, or click to select'}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:translate-y-0.5 hover:bg-slate-800"
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
        <div className="space-y-5">
          {/* Image Preview */}
          <div className="relative">
            <img
              src={preview!}
              alt="Preview"
              className="h-64 w-full rounded-3xl object-cover shadow-lg"
            />
            <button
              onClick={removeImage}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-md transition hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Image Info */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-slate-400" />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {selectedImage.name}
                </p>
                <p className="text-sm text-slate-500">
                  {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={removeImage}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200/80 bg-white px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
              disabled={isUploading}
            >
              Choose Different Image
            </button>
            <button
              onClick={startAnalysis}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:translate-y-0.5 hover:bg-slate-800 disabled:opacity-60"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Starting Analysis...
                </>
              ) : (
                'Start Analysis'
              )}
            </button>
          </div>

          {/* Tips */}
          <div className="text-center text-xs text-slate-500">
            <p>💡 Crisp lighting and a clean background helps our AI lock on instantly.</p>
            <p>📱 Works perfectly with mobile uploads up to 10MB.</p>
          </div>
        </div>
      )}
    </div>
  );
}
