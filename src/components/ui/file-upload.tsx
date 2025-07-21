"use client";

import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Upload,
  X,
  ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import {
  type STORAGE_BUCKETS,
  type ASSET_TYPES,
  UPLOAD_CONSTRAINTS,
  uploadAsset,
  deleteAsset,
  validateFile,
} from "@/lib/client/storage";

interface FileUploadProps {
  /** The storage bucket to upload to */
  bucket: keyof typeof STORAGE_BUCKETS;
  /** Entity ID (league ID, school ID, etc.) */
  entityId: string;
  /** Type of asset being uploaded */
  assetType: keyof typeof ASSET_TYPES;
  /** Current image URL (if any) */
  currentImageUrl?: string | null;
  /** Label for the upload field */
  label: string;
  /** Description text */
  description?: string;
  /** Whether to show recommended size info */
  showRecommendedSize?: boolean;
  /** Custom recommended size override */
  customRecommendedSize?: {
    width: number;
    height: number;
    description: string;
  };
  /** Callback when upload succeeds */
  onUploadSuccess: (url: string) => void;
  /** Callback when upload fails */
  onUploadError: (error: string) => void;
  /** Callback when image is removed */
  onRemove?: () => void;
  /** Whether the upload is disabled */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

export function FileUpload({
  bucket,
  entityId,
  assetType,
  currentImageUrl,
  label,
  description,
  showRecommendedSize = true,
  customRecommendedSize,
  onUploadSuccess,
  onUploadError,
  onRemove,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl ?? null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get recommended size info
  const recommendedSize =
    customRecommendedSize ?? UPLOAD_CONSTRAINTS.RECOMMENDED_SIZES[assetType];

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (disabled) return;

      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        onUploadError(validation.error!);
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      // Show preview immediately
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);

      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        // Upload file
        const result = await uploadAsset(bucket, entityId, assetType, file);

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (result.success && result.url) {
          // Clean up preview URL
          URL.revokeObjectURL(fileUrl);
          setPreviewUrl(result.url);
          onUploadSuccess(result.url);
        } else {
          setPreviewUrl(currentImageUrl ?? null);
          onUploadError(result.error ?? "Upload failed");
        }
      } catch (error) {
        setPreviewUrl(currentImageUrl ?? null);
        onUploadError(error instanceof Error ? error.message : "Upload failed");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [
      bucket,
      entityId,
      assetType,
      currentImageUrl,
      disabled,
      onUploadSuccess,
      onUploadError,
    ],
  );

  const handleRemove = useCallback(async () => {
    if (!previewUrl || disabled) return;

    try {
      // Only attempt to delete from storage if it's not a preview URL
      if (!previewUrl.startsWith("blob:")) {
        await deleteAsset(bucket, previewUrl);
      }

      setPreviewUrl(null);
      onRemove?.();
    } catch (error) {
      console.error("Failed to remove image:", error);
    }
  }, [bucket, previewUrl, disabled, onRemove]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        void handleFileSelect(files[0]!);
      }
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) {
        void handleFileSelect(files[0]!);
      }
    },
    [handleFileSelect],
  );

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-gray-200">{label}</Label>

      {description && <p className="text-sm text-gray-400">{description}</p>}

      {showRecommendedSize && recommendedSize && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <AlertCircle className="h-3 w-3" />
          <span>{recommendedSize.description}</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Upload Area */}
        {!previewUrl && (
          <Card
            className={cn(
              "cursor-pointer border-2 border-dashed transition-colors",
              dragOver
                ? "border-blue-400 bg-blue-50/10"
                : "border-gray-600 hover:border-gray-500",
              disabled && "cursor-not-allowed opacity-50",
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleClick}
          >
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Upload className="mb-4 h-10 w-10 text-gray-400" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-200">
                  Drop your image here, or click to browse
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, JPEG, WebP up to{" "}
                  {UPLOAD_CONSTRAINTS.MAX_FILE_SIZE / 1024 / 1024}MB
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Area */}
        {previewUrl && (
          <Card className="border-gray-600">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-lg border border-gray-600",
                      assetType === "BANNER" ? "h-12 w-48" : "h-24 w-24",
                    )}
                  >
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                      sizes={assetType === "BANNER" ? "192px" : "96px"}
                    />
                  </div>

                  {!isUploading && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={handleRemove}
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  {isUploading ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-300">
                          Uploading...
                        </span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-300">
                        Upload complete
                      </span>
                    </div>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleClick}
                    disabled={disabled || isUploading}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Change Image
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={UPLOAD_CONSTRAINTS.ALLOWED_TYPES.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
