import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import UserProfileService from "../services/userProfile/userProfile.services";
import CountryCodeSelect from "../components/CountryCodeSelect";
import Loader from "../components/Loader";

// Image Crop Modal Component
const ImageCropModal = ({ imageSrc, onCrop, onClose }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0, displayWidth: 0, displayHeight: 0, offsetX: 0, offsetY: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (imageSrc && imageRef.current && containerRef.current) {
      const img = new Image();
      img.onload = () => {
        const container = containerRef.current;
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const containerAspect = containerWidth / containerHeight;
        
        let displayWidth, displayHeight, offsetX = 0, offsetY = 0;
        if (imgAspect > containerAspect) {
          displayHeight = containerHeight;
          displayWidth = displayHeight * imgAspect;
          offsetX = (containerWidth - displayWidth) / 2;
        } else {
          displayWidth = containerWidth;
          displayHeight = displayWidth / imgAspect;
          offsetY = (containerHeight - displayHeight) / 2;
        }
        
        setImageSize({
          width: img.naturalWidth,
          height: img.naturalHeight,
          displayWidth,
          displayHeight,
          offsetX,
          offsetY,
        });

        // Initialize crop area to 80% of display size, centered
        const cropWidth = displayWidth * 0.8;
        const cropHeight = displayHeight * 0.8;
        setCropArea({
          x: offsetX + (displayWidth - cropWidth) / 2,
          y: offsetY + (displayHeight - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight,
        });
        setScale(1);
      };
      img.src = imageSrc;
    }
  }, [imageSrc]);

  const handleMouseDown = (e) => {
    if (e.target === containerRef.current || e.target.closest('.crop-overlay')) {
      setIsDragging(true);
      const rect = containerRef.current.getBoundingClientRect();
      setDragStart({
        x: e.clientX - cropArea.x - rect.left,
        y: e.clientY - cropArea.y - rect.top,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - dragStart.x - rect.left;
      const newY = e.clientY - dragStart.y - rect.top;
      
      // Calculate scaled image bounds
      const scaledDisplayWidth = imageSize.displayWidth * scale;
      const scaledDisplayHeight = imageSize.displayHeight * scale;
      const scaledOffsetX = imageSize.offsetX - (imageSize.displayWidth * (scale - 1)) / 2;
      const scaledOffsetY = imageSize.offsetY - (imageSize.displayHeight * (scale - 1)) / 2;
      
      // Constrain to scaled image bounds
      const maxX = scaledOffsetX + scaledDisplayWidth - cropArea.width;
      const maxY = scaledOffsetY + scaledDisplayHeight - cropArea.height;
      
      setCropArea(prev => ({
        ...prev,
        x: Math.max(scaledOffsetX, Math.min(newX, maxX)),
        y: Math.max(scaledOffsetY, Math.min(newY, maxY)),
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResizeStart = (e, corner) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startCrop = { ...cropArea };
    
    // Calculate scaled image bounds
    const scaledDisplayWidth = imageSize.displayWidth * scale;
    const scaledDisplayHeight = imageSize.displayHeight * scale;
    const scaledOffsetX = imageSize.offsetX - (imageSize.displayWidth * (scale - 1)) / 2;
    const scaledOffsetY = imageSize.offsetY - (imageSize.displayHeight * (scale - 1)) / 2;
    
    const handleResizeMove = (moveE) => {
      const deltaX = moveE.clientX - startX;
      const deltaY = moveE.clientY - startY;
      
      let newCrop = { ...startCrop };
      
      if (corner.includes('n')) {
        const newHeight = startCrop.height - deltaY;
        const newY = startCrop.y + deltaY;
        if (newHeight > 50 && newY >= scaledOffsetY) {
          newCrop.height = newHeight;
          newCrop.y = newY;
        }
      }
      if (corner.includes('s')) {
        const newHeight = startCrop.height + deltaY;
        if (newHeight > 50 && startCrop.y + newHeight <= scaledOffsetY + scaledDisplayHeight) {
          newCrop.height = newHeight;
        }
      }
      if (corner.includes('w')) {
        const newWidth = startCrop.width - deltaX;
        const newX = startCrop.x + deltaX;
        if (newWidth > 50 && newX >= scaledOffsetX) {
          newCrop.width = newWidth;
          newCrop.x = newX;
        }
      }
      if (corner.includes('e')) {
        const newWidth = startCrop.width + deltaX;
        if (newWidth > 50 && startCrop.x + newWidth <= scaledOffsetX + scaledDisplayWidth) {
          newCrop.width = newWidth;
        }
      }
      
      // Constrain to scaled image bounds
      newCrop.x = Math.max(scaledOffsetX, Math.min(newCrop.x, scaledOffsetX + scaledDisplayWidth - newCrop.width));
      newCrop.y = Math.max(scaledOffsetY, Math.min(newCrop.y, scaledOffsetY + scaledDisplayHeight - newCrop.height));
      newCrop.width = Math.min(newCrop.width, scaledOffsetX + scaledDisplayWidth - newCrop.x);
      newCrop.height = Math.min(newCrop.height, scaledOffsetY + scaledDisplayHeight - newCrop.y);
      
      setCropArea(newCrop);
    };
    
    const handleResizeUp = () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeUp);
    };
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeUp);
  };

  const getCroppedImage = () => {
    if (!imageRef.current || !canvasRef.current || !imageSize.width) return null;

    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Calculate the actual displayed image position accounting for scale
    const scaledDisplayWidth = imageSize.displayWidth * scale;
    const scaledDisplayHeight = imageSize.displayHeight * scale;
    const scaledOffsetX = imageSize.offsetX - (imageSize.displayWidth * (scale - 1)) / 2;
    const scaledOffsetY = imageSize.offsetY - (imageSize.displayHeight * (scale - 1)) / 2;

    // Calculate crop coordinates in image pixel space
    const scaleX = imageSize.width / scaledDisplayWidth;
    const scaleY = imageSize.height / scaledDisplayHeight;
    
    const cropX = Math.max(0, (cropArea.x - scaledOffsetX) * scaleX);
    const cropY = Math.max(0, (cropArea.y - scaledOffsetY) * scaleY);
    const cropWidth = Math.min(imageSize.width - cropX, cropArea.width * scaleX);
    const cropHeight = Math.min(imageSize.height - cropY, cropArea.height * scaleY);

    // Set canvas size to match crop area
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Draw cropped portion, scaling to fit canvas
    ctx.drawImage(
      img,
      cropX, cropY, cropWidth, cropHeight,
      0, 0, cropArea.width, cropArea.height
    );

    return canvas.toDataURL('image/jpeg', 0.92);
  };

  const handleCrop = () => {
    const croppedImage = getCroppedImage();
    if (croppedImage) {
      onCrop(croppedImage);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Crop Your Image</h3>
            <p className="text-sm text-slate-600">Drag to move, resize corners to adjust crop area</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Crop Area */}
        <div className="p-6">
          <div
            ref={containerRef}
            className="relative mx-auto overflow-hidden rounded-xl bg-slate-900"
            style={{ width: "100%", height: "500px", maxHeight: "70vh" }}
          >
            {imageSrc && (
              <>
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  className="absolute"
                  style={{
                    width: `${imageSize.displayWidth * scale}px`,
                    height: `${imageSize.displayHeight * scale}px`,
                    left: `${imageSize.offsetX - (imageSize.displayWidth * (scale - 1)) / 2}px`,
                    top: `${imageSize.offsetY - (imageSize.displayHeight * (scale - 1)) / 2}px`,
                  }}
                />
                {/* Crop Overlay */}
                <div
                  className="crop-overlay absolute border-2 border-white shadow-lg"
                  style={{
                    left: `${cropArea.x}px`,
                    top: `${cropArea.y}px`,
                    width: `${cropArea.width}px`,
                    height: `${cropArea.height}px`,
                    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
                    cursor: isDragging ? "grabbing" : "move",
                  }}
                >
                  {/* Corner handles */}
                  {[
                    { x: 0, y: 0, cursor: "nwse-resize", corner: "nw" },
                    { x: 100, y: 0, cursor: "nesw-resize", corner: "ne" },
                    { x: 0, y: 100, cursor: "nesw-resize", corner: "sw" },
                    { x: 100, y: 100, cursor: "nwse-resize", corner: "se" },
                  ].map((handle, idx) => (
                    <div
                      key={idx}
                      className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border-2 border-indigo-500 shadow-lg"
                      style={{
                        left: `${handle.x}%`,
                        top: `${handle.y}%`,
                        cursor: handle.cursor,
                      }}
                      onMouseDown={(e) => handleResizeStart(e, handle.corner)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-slate-700">Zoom</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-slate-600 w-12">{Math.round(scale * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCrop}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

// Camera Modal Component
const CameraModal = ({ fieldName, onCapture, onClose, stream }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!stream) {
      console.warn('CameraModal: No stream provided');
      setIsReady(false);
      return;
    }

    let video = null;
    let handleCanPlay = null;
    let handleLoadedMetadata = null;
    let handlePlaying = null;
    let handleError = null;

    // Small delay to ensure video element is mounted in DOM
    const timer = setTimeout(() => {
      video = videoRef.current;
      const currentStream = stream;

      if (!video) {
        console.error('CameraModal: Video element not found in DOM');
        setIsReady(false);
        return;
      }

      console.log('Initializing camera video element', {
        hasVideo: !!video,
        hasStream: !!currentStream,
        streamActive: currentStream.active,
        tracks: currentStream.getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState }))
      });

      setIsReady(false);
      
      // Clear any existing stream first
      if (video.srcObject) {
        const oldStream = video.srcObject;
        oldStream.getTracks().forEach(track => {
          track.stop();
          console.log('Stopped old track:', track.kind);
        });
        video.srcObject = null;
      }

      // Set the new stream
      try {
        video.srcObject = currentStream;
        console.log('Stream set to video element successfully');
      } catch (err) {
        console.error('Error setting stream to video:', err);
        setIsReady(false);
        return;
      }
    
      // Ensure video is ready
      handleCanPlay = () => {
        console.log('Video can play event fired');
        if (video) {
          video.play()
            .then(() => {
              console.log('Video playing successfully');
              setIsReady(true);
            })
            .catch(err => {
              console.error('Error playing video in canplay handler:', err);
            });
        }
      };

      handleLoadedMetadata = () => {
        console.log('Video metadata loaded:', {
          width: video?.videoWidth,
          height: video?.videoHeight,
          readyState: video?.readyState,
        });
        // Try to play after metadata is loaded
        if (video && video.paused) {
          video.play()
            .then(() => {
              console.log('Video playing after metadata load');
              setIsReady(true);
            })
            .catch(err => console.error('Play error after metadata:', err));
        }
      };

      handlePlaying = () => {
        console.log('Video is now playing');
        setIsReady(true);
      };

      handleError = (e) => {
        console.error('Video error:', e, video?.error);
      };

      // Add event listeners
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('playing', handlePlaying);
      video.addEventListener('error', handleError);

      // Try to play immediately
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Video playing successfully (immediate)');
            setIsReady(true);
          })
          .catch(err => {
            console.error('Error playing video (immediate):', err);
            // Video will play when canplay event fires
          });
      } else {
        // For older browsers
        setTimeout(() => {
          if (video && video.paused) {
            video.play().catch(err => console.error('Delayed play error:', err));
          }
        }, 100);
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => {
      clearTimeout(timer);
      // Clean up event listeners
      if (video && handleCanPlay && handleLoadedMetadata && handlePlaying && handleError) {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('playing', handlePlaying);
        video.removeEventListener('error', handleError);
      }
      // Don't stop stream here - let parent handle it
      setIsReady(false);
    };
  }, [stream]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const currentStream = stream;

    if (!video) {
      console.error('Video element not found');
      Swal.fire({
        icon: "error",
        title: "Capture Error",
        text: "Video element not available. Please try again.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }

    if (!canvas) {
      console.error('Canvas element not found');
      Swal.fire({
        icon: "error",
        title: "Capture Error",
        text: "Canvas element not available. Please try again.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }

    if (!currentStream) {
      console.error('Stream not available');
      Swal.fire({
        icon: "error",
        title: "Capture Error",
        text: "Camera stream not available. Please try again.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }

    // Check if video has valid dimensions and is playing
    if (!video.videoWidth || !video.videoHeight || video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('Video dimensions not available yet', {
        width: video.videoWidth,
        height: video.videoHeight,
        readyState: video.readyState,
        paused: video.paused,
      });
      Swal.fire({
        icon: "error",
        title: "Camera Not Ready",
        text: "Please wait for the camera to initialize.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }

    // Check if video is actually playing
    if (video.paused || video.ended) {
      console.warn('Video is not playing', { paused: video.paused, ended: video.ended });
      // Try to play it
      video.play()
        .then(() => {
          // Retry capture after a short delay
          setTimeout(() => handleCapture(), 200);
        })
        .catch(() => {
          Swal.fire({
            icon: "error",
            title: "Camera Not Ready",
            text: "Please wait for the camera to start.",
            confirmButtonColor: "#0f172a",
          });
        });
      return;
    }

    try {
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      const imageData = canvas.toDataURL('image/jpeg', 0.92);
      
      if (!imageData || imageData === 'data:,') {
        throw new Error('Failed to capture image data');
      }
      
      // Stop the stream
      currentStream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track:', track.kind);
      });
      
      // Call onCapture with the image
      onCapture(imageData);
    } catch (error) {
      console.error('Capture error:', error);
      Swal.fire({
        icon: "error",
        title: "Capture Failed",
        text: error.message || "Unable to capture image. Please try again.",
        confirmButtonColor: "#0f172a",
      });
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped track on close:', track.kind);
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Capture Photo</h3>
            <p className="text-sm text-slate-600">Position your passport in the frame</p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Camera Preview */}
        <div className="p-6">
          <div className="relative mx-auto overflow-hidden rounded-xl bg-slate-900" style={{ width: "100%", height: "500px", maxHeight: "70vh" }}>
            {stream ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-contain"
                  style={{ minHeight: '100%', minWidth: '100%' }}
                />
                {!isReady && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/90">
                    <div className="text-center">
                      <Loader size="lg" className="mx-auto" />
                      <p className="mt-4 text-sm text-white">Initializing camera...</p>
                      <p className="mt-2 text-xs text-white/70">Please wait...</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Loader size="lg" className="mx-auto" />
                  <p className="mt-4 text-sm text-white">Waiting for camera stream...</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCapture}
              disabled={!isReady}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {isReady ? 'Capture Photo' : 'Initializing...'}
            </button>
          </div>
        </div>

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

// Image Preview Modal Component
const ImagePreviewModal = ({ imageSrc, onCrop, onUploadNew, onClose, source }) => {
  // source can be 'gallery', 'camera', or null
  const isFromGallery = source === 'gallery';
  const isFromCamera = source === 'camera';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">Image Preview</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image Preview */}
        <div className="p-6">
          <div className="relative mx-auto overflow-hidden rounded-xl bg-slate-100" style={{ maxHeight: "60vh" }}>
            <img
              src={imageSrc}
              alt="Preview"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={onCrop}
              className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Crop Image
            </button>
            <button
              onClick={onUploadNew}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              {isFromGallery ? (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Upload New Image
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Upload New Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Image Upload Component
const ImageUpload = ({ 
  value, 
  onChange, 
  label, 
  placeholder = "https://via.placeholder.com/400x300?text=No+Image",
  className = "",
  aspectRatio = "auto"
}) => {
  const fileInputRef = useRef(null);
  const [showOptions, setShowOptions] = useState(false);
  const [preview, setPreview] = useState(value || placeholder);

  useEffect(() => {
    setPreview(value || placeholder);
  }, [value, placeholder]);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Please select an image file.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: "Image size should be less than 5MB.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setPreview(base64String);
      onChange(base64String);
    };
    reader.onerror = () => {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to read the image file.",
        confirmButtonColor: "#0f172a",
      });
    };
    reader.readAsDataURL(file);
    setShowOptions(false);
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
    setShowOptions(false);
  };

  const handleCameraClick = () => {
    // Create a file input with camera capture
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera on mobile
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
    };
    input.click();
    setShowOptions(false);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(placeholder);
    onChange("");
  };

  const hasImage = value && value !== placeholder && !value.includes('placeholder');

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className={`relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-indigo-400 cursor-pointer ${
            aspectRatio === "square" ? "aspect-square" : aspectRatio === "portrait" ? "aspect-[3/4]" : ""
          }`}
          onClick={() => setShowOptions(!showOptions)}
        >
          {preview && (
            <img
              src={preview}
              alt={label || "Preview"}
              className={`h-full w-full object-cover ${hasImage ? "" : "opacity-50"}`}
              onError={(e) => {
                e.target.src = placeholder;
              }}
            />
          )}
          {hasImage && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 rounded-full bg-rose-500 p-1.5 text-white shadow-lg transition hover:bg-rose-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition hover:bg-black/10">
            <div className="text-center">
              <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="mt-2 text-xs font-medium text-slate-600">
                {hasImage ? "Click to change" : "Click to upload"}
              </p>
            </div>
          </div>
        </div>

        {/* Options Dropdown */}
        {showOptions && (
          <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={handleGalleryClick}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50 first:rounded-t-2xl"
            >
              <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Choose from Gallery</span>
            </button>
            <button
              type="button"
              onClick={handleCameraClick}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50 last:rounded-b-2xl"
            >
              <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Take Photo</span>
            </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
      </div>
    </div>
  );
};

const UserDetails = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const navigate = useNavigate();

  // Form states
  const [basicInfo, setBasicInfo] = useState({
    fullName: "",
    email: "",
    countryCode: "+1",
    mobile_number: "",
    date_of_birth: "",
    gender: "",
    city: "",
    company_name: "",
    profilePic: "",
  });

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });

  const [passportInfo, setPassportInfo] = useState({
    passportNumber: "",
    nationality: "",
    issueDate: "",
    expiryDate: "",
    placeOfIssue: "",
    passportFrontImage: "",
    passportBackImage: "",
    passportFullCopy: "",
  });

  const [errors, setErrors] = useState({});
  const [activeUploadMenu, setActiveUploadMenu] = useState(null);
  const [cropModal, setCropModal] = useState({ show: false, imageSrc: null, fieldName: null });
  const [cameraModal, setCameraModal] = useState({ show: false, fieldName: null, stream: null });
  const [imagePreview, setImagePreview] = useState({ show: false, imageSrc: null, fieldName: null, source: null });
  // Track image source (gallery or camera) for each field
  const [imageSources, setImageSources] = useState({
    passportFrontImage: null, // 'gallery' or 'camera'
    passportBackImage: null,
    passportFullCopy: null,
  });

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeUploadMenu && !e.target.closest('.upload-menu-container')) {
        setActiveUploadMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeUploadMenu]);

  // Helper function to handle image upload
  const handleImageUpload = (fieldName, useCamera = false) => {
    if (useCamera) {
      // Check if we're on HTTPS or localhost (required for camera access)
      const isSecureContext = window.isSecureContext || 
                              location.protocol === 'https:' || 
                              location.hostname === 'localhost' || 
                              location.hostname === '127.0.0.1';
      
      if (!isSecureContext) {
        console.error('Camera requires HTTPS or localhost');
        Swal.fire({
          icon: "error",
          title: "Camera Requires Secure Connection",
          text: "Camera access requires HTTPS. Please use a secure connection or upload from gallery.",
          confirmButtonColor: "#0f172a",
        });
        return;
      }

      // Check if MediaDevices API is available
      if (!navigator.mediaDevices) {
        console.error('MediaDevices API not available');
        Swal.fire({
          icon: "error",
          title: "Camera Not Supported",
          text: "Your browser does not support camera access. Please use a modern browser or upload from gallery.",
          confirmButtonColor: "#0f172a",
        });
        return;
      }

      if (!navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia not available');
        // Fallback to file input with capture attribute
        openFileInputWithCamera(fieldName);
        setActiveUploadMenu(null);
        return;
      }

      // Show loading state
      Swal.fire({
        title: 'Accessing Camera',
        html: 'Please allow camera access when prompted...',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Request camera access
      console.log('Requesting camera access...');
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Prefer back camera for documents
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      })
      .then((stream) => {
        console.log('Camera stream obtained:', stream);
        console.log('Stream active:', stream.active);
        console.log('Stream id:', stream.id);
        
        // Verify stream has active tracks
        const videoTracks = stream.getVideoTracks();
        console.log('Video tracks count:', videoTracks.length);
        
        if (videoTracks.length === 0) {
          stream.getTracks().forEach(track => track.stop());
          throw new Error('No video tracks in stream');
        }

        console.log('Video tracks:', videoTracks.map(t => ({ 
          id: t.id, 
          label: t.label, 
          readyState: t.readyState,
          enabled: t.enabled,
          muted: t.muted
        })));
        
        // Close loading alert first
        Swal.close();
        
        // Show camera modal immediately
        console.log('Opening camera modal with stream');
        setCameraModal({
          show: true,
          fieldName: fieldName,
          stream: stream,
        });
      })
      .catch((error) => {
        console.error('Camera access error:', error);
        Swal.close();
        
        let errorMessage = "Please allow camera access to take photos.";
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = "Camera access was denied. Please allow camera permissions in your browser settings and try again.";
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          errorMessage = "No camera found. Please connect a camera or use gallery upload.";
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          errorMessage = "Camera is already in use by another application. Please close other apps using the camera.";
        } else if (error.name === 'OverconstrainedError') {
          // Try with simpler constraints
          console.log('Trying fallback with simpler constraints...');
          navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
              Swal.close();
              console.log('Fallback camera stream obtained:', stream);
              setCameraModal({
                show: true,
                fieldName: fieldName,
                stream: stream,
              });
            })
            .catch((fallbackError) => {
              console.error('Fallback camera error:', fallbackError);
              Swal.close();
              Swal.fire({
                icon: "error",
                title: "Camera Access Failed",
                text: "Unable to access camera. Please try uploading from gallery instead.",
                confirmButtonColor: "#0f172a",
              });
              // Fallback to file input with capture attribute
              openFileInputWithCamera(fieldName);
            });
          return;
        }
        
        Swal.fire({
          icon: "error",
          title: "Camera Access Error",
          text: errorMessage,
          confirmButtonColor: "#0f172a",
        });
        
        // Fallback to file input with capture attribute
        openFileInputWithCamera(fieldName);
      });
    } else {
      // Gallery selection - no camera needed
      openFileInputForGallery(fieldName);
    }
    setActiveUploadMenu(null);
  };

  // Handle camera capture
  const handleCameraCapture = (imageData) => {
    // Store fieldName before closing modal
    const fieldName = cameraModal.fieldName;
    
    // Track that this image came from camera
    if (fieldName) {
      setImageSources(prev => ({ ...prev, [fieldName]: 'camera' }));
    }
    
    // Close camera modal and stop stream
    if (cameraModal.stream) {
      cameraModal.stream.getTracks().forEach(track => track.stop());
    }
    setCameraModal({ show: false, fieldName: null, stream: null });
    
    // Immediately show crop modal
    if (fieldName && imageData) {
      setCropModal({
        show: true,
        imageSrc: imageData,
        fieldName: fieldName,
      });
    }
  };

  // Handle image click to show preview
  const handleImageClick = (imageSrc, fieldName) => {
    if (imageSrc && !imageSrc.includes('placeholder')) {
      // Get the source for this image field
      const source = imageSources[fieldName] || null;
      setImagePreview({
        show: true,
        imageSrc: imageSrc,
        fieldName: fieldName,
        source: source, // 'gallery' or 'camera' or null
      });
    }
  };

  // Handle crop from preview
  const handleCropFromPreview = () => {
    setImagePreview(prev => ({
      ...prev,
      show: false,
    }));
    setCropModal({
      show: true,
      imageSrc: imagePreview.imageSrc,
      fieldName: imagePreview.fieldName,
    });
  };

  // Handle upload new from preview
  const handleUploadNewFromPreview = () => {
    const fieldName = imagePreview.fieldName;
    const source = imagePreview.source; // 'gallery' or 'camera'
    setImagePreview({ show: false, imageSrc: null, fieldName: null, source: null });
    
    // Use the same source as the original upload
    // If source is 'gallery', open gallery; if 'camera', open camera; if null, default to gallery
    const useCamera = source === 'camera';
    handleImageUpload(fieldName, useCamera);
  };

  // Fallback: Open file input with camera capture attribute
  const openFileInputWithCamera = (fieldName) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    // Set capture attribute to force camera
    input.setAttribute('capture', 'environment'); // Back camera
    
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        // Track source as camera
        setImageSources(prev => ({ ...prev, [fieldName]: 'camera' }));
        handleFileSelected(file, fieldName, true);
      }
      // Clean up
      if (input.parentNode) {
        document.body.removeChild(input);
      }
    };
    
    // Append to DOM and click
    input.style.position = 'fixed';
    input.style.top = '-1000px';
    input.style.left = '-1000px';
    document.body.appendChild(input);
    
    // Use setTimeout to ensure input is in DOM
    setTimeout(() => {
      try {
        input.click();
        // Clean up after a delay
        setTimeout(() => {
          if (input.parentNode) {
            document.body.removeChild(input);
          }
        }, 2000);
      } catch (err) {
        console.error('Error clicking file input:', err);
        if (input.parentNode) {
          document.body.removeChild(input);
        }
      }
    }, 100);
  };

  // Open file input for gallery selection
  const openFileInputForGallery = (fieldName) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleFileSelected(e.target.files?.[0], fieldName, false);
    
    input.style.display = 'none';
    document.body.appendChild(input);
    requestAnimationFrame(() => {
      input.click();
      setTimeout(() => {
        if (input.parentNode) {
          document.body.removeChild(input);
        }
      }, 1000);
    });
  };

  // Handle the selected file
  const handleFileSelected = (file, fieldName, isCamera) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Please select an image file.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: "Image size should be less than 5MB.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      // Track the source
      const source = isCamera ? 'camera' : 'gallery';
      setImageSources(prev => ({ ...prev, [fieldName]: source }));
      
      if (isCamera) {
        // Show crop modal for camera captures (from file input fallback)
        setCropModal({
          show: true,
          imageSrc: reader.result,
          fieldName: fieldName,
        });
      } else {
        // Direct upload for gallery
        setPassportInfo({ ...passportInfo, [fieldName]: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle crop completion
  const handleCropComplete = (croppedImage) => {
    if (cropModal.fieldName) {
      setPassportInfo({ ...passportInfo, [cropModal.fieldName]: croppedImage });
      // Preserve the image source after cropping
      // The source is already set when the image was first uploaded
    }
    setCropModal({ show: false, imageSrc: null, fieldName: null });
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await UserProfileService.getProfile();
      if (response?.data) {
        const userData = response.data;
        setProfile(userData);
        
        // Populate form fields
        setBasicInfo({
          fullName: userData.fullName || "",
          email: userData.email || "",
          countryCode: userData.countryCode || "+1",
          mobile_number: userData.mobile_number || "",
          date_of_birth: userData.date_of_birth 
            ? new Date(userData.date_of_birth).toISOString().split('T')[0]
            : "",
          gender: userData.gender || "",
          city: userData.city || "",
          company_name: userData.company_name || "",
          profilePic: userData.profilePic || "",
        });

        setAddress({
          street: userData.address?.street || "",
          city: userData.address?.city || "",
          state: userData.address?.state || "",
          country: userData.address?.country || "",
          zipCode: userData.address?.zipCode || "",
        });

        setPassportInfo({
          passportNumber: userData.passportInfo?.passportNumber || "",
          nationality: userData.passportInfo?.nationality || "",
          issueDate: userData.passportInfo?.issueDate
            ? new Date(userData.passportInfo.issueDate).toISOString().split('T')[0]
            : "",
          expiryDate: userData.passportInfo?.expiryDate
            ? new Date(userData.passportInfo.expiryDate).toISOString().split('T')[0]
            : "",
          placeOfIssue: userData.passportInfo?.placeOfIssue || "",
          passportFrontImage: userData.passportInfo?.passportFrontImage || "",
          passportBackImage: userData.passportInfo?.passportBackImage || "",
          passportFullCopy: userData.passportInfo?.passportFullCopy || "",
        });
        
        // Reset image sources when fetching profile (existing images don't have source info)
        setImageSources({
          passportFrontImage: null,
          passportBackImage: null,
          passportFullCopy: null,
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateBasicInfo = () => {
    const newErrors = {};
    
    if (!basicInfo.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!basicInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(basicInfo.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!basicInfo.mobile_number.trim()) {
      newErrors.mobile_number = "Mobile number is required";
    } else if (!/^\d{7,15}$/.test(basicInfo.mobile_number.replace(/\s|-/g, ""))) {
      newErrors.mobile_number = "Phone number should be 7-15 digits";
    }
    if (basicInfo.date_of_birth) {
      const birthDate = new Date(basicInfo.date_of_birth);
      const today = new Date();
      if (birthDate > today) {
        newErrors.date_of_birth = "Date of birth cannot be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassportInfo = () => {
    const newErrors = {};
    
    if (passportInfo.passportNumber && !/^[A-Z0-9]{6,12}$/i.test(passportInfo.passportNumber)) {
      newErrors.passportNumber = "Invalid passport number format";
    }
    if (passportInfo.issueDate && passportInfo.expiryDate) {
      const issueDate = new Date(passportInfo.issueDate);
      const expiryDate = new Date(passportInfo.expiryDate);
      if (expiryDate <= issueDate) {
        newErrors.expiryDate = "Expiry date must be after issue date";
      }
      if (expiryDate < new Date()) {
        newErrors.expiryDate = "Passport has expired";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateBasicInfo()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fix the highlighted fields.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }

    setSaving(true);
    try {
      const cleanedPhone = basicInfo.mobile_number.replace(/\s|-/g, "");
      const updateData = {
        fullName: basicInfo.fullName,
        email: basicInfo.email,
        countryCode: basicInfo.countryCode.replace("+", ""),
        mobile_number: cleanedPhone,
        date_of_birth: basicInfo.date_of_birth || undefined,
        gender: basicInfo.gender || undefined,
        city: basicInfo.city || undefined,
        company_name: basicInfo.company_name || undefined,
        profilePic: basicInfo.profilePic || undefined,
        address: {
          street: address.street || undefined,
          city: address.city || undefined,
          state: address.state || undefined,
          country: address.country || undefined,
          zipCode: address.zipCode || undefined,
        },
      };

      const response = await UserProfileService.updateProfile(updateData);
      if (response?.success) {
        await Swal.fire({
          icon: "success",
          title: "Profile Updated!",
          text: "Your profile has been updated successfully.",
          confirmButtonColor: "#0f172a",
        });
        setIsEditing(false);
        await fetchProfile();
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassport = async () => {
    if (!validatePassportInfo()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fix the highlighted fields.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        passportNumber: passportInfo.passportNumber || undefined,
        nationality: passportInfo.nationality || undefined,
        issueDate: passportInfo.issueDate || undefined,
        expiryDate: passportInfo.expiryDate || undefined,
        placeOfIssue: passportInfo.placeOfIssue || undefined,
        passportFrontImage: passportInfo.passportFrontImage || undefined,
        passportBackImage: passportInfo.passportBackImage || undefined,
        passportFullCopy: passportInfo.passportFullCopy || undefined,
      };

      const response = await UserProfileService.updatePassport(updateData);
      if (response?.success) {
        await Swal.fire({
          icon: "success",
          title: "Passport Updated!",
          text: "Your passport information has been updated successfully.",
          confirmButtonColor: "#0f172a",
        });
        setIsEditing(false);
        await fetchProfile();
      }
    } catch (error) {
      console.error("Failed to update passport:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setBasicInfo({
        fullName: profile.fullName || "",
        email: profile.email || "",
        countryCode: profile.countryCode || "+1",
        mobile_number: profile.mobile_number || "",
        date_of_birth: profile.date_of_birth
          ? new Date(profile.date_of_birth).toISOString().split('T')[0]
          : "",
        gender: profile.gender || "",
        city: profile.city || "",
        company_name: profile.company_name || "",
        profilePic: profile.profilePic || "",
      });
      setAddress({
        street: profile.address?.street || "",
        city: profile.address?.city || "",
        state: profile.address?.state || "",
        country: profile.address?.country || "",
        zipCode: profile.address?.zipCode || "",
      });
      setPassportInfo({
        passportNumber: profile.passportInfo?.passportNumber || "",
        nationality: profile.passportInfo?.nationality || "",
        issueDate: profile.passportInfo?.issueDate
          ? new Date(profile.passportInfo.issueDate).toISOString().split('T')[0]
          : "",
        expiryDate: profile.passportInfo?.expiryDate
          ? new Date(profile.passportInfo.expiryDate).toISOString().split('T')[0]
          : "",
        placeOfIssue: profile.passportInfo?.placeOfIssue || "",
        passportFrontImage: profile.passportInfo?.passportFrontImage || "",
        passportBackImage: profile.passportInfo?.passportBackImage || "",
        passportFullCopy: profile.passportInfo?.passportFullCopy || "",
      });
      
      // Reset image sources
      setImageSources({
        passportFrontImage: null,
        passportBackImage: null,
        passportFullCopy: null,
      });
    }
    setErrors({});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader size="lg" className="mx-auto" />
          <p className="mt-4 text-sm text-slate-600">Loading your profile...</p>
        </div>
      </section>
    );
  }

  if (!profile) {
  return (
    <section className="flex min-h-screen items-center bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              No profile found
            </h2>
          <p className="mt-2 text-sm text-slate-500">
              We couldn't find your profile. Please log in to view your details.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/login"
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const profilePlaceholder = "https://via.placeholder.com/200x200?text=Profile+Photo";
  const passportPlaceholder = "https://via.placeholder.com/400x300?text=Passport+Image";

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">User Profile</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              My Profile
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage your personal information and passport details
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center gap-4 border-b border-slate-200 pb-6 sm:flex-row">
            <div className="relative">
              {isEditing ? (
                <ImageUpload
                  value={basicInfo.profilePic}
                  onChange={(value) => setBasicInfo({ ...basicInfo, profilePic: value })}
                  placeholder={profilePlaceholder}
                  aspectRatio="square"
                  className="w-24"
                />
              ) : (
                <div className="h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-indigo-400 to-purple-500">
                  {basicInfo.profilePic ? (
                    <img
                      src={basicInfo.profilePic}
                      alt={profile.fullName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = profilePlaceholder;
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white">
                      {profile.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-900">{profile.fullName}</h2>
              <p className="mt-1 text-sm text-slate-600">{profile.email}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {profile.isVerified ? "Verified" : "Unverified"}
                </span>
                {profile.isSubscribed && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                    Subscribed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-slate-200">
            <nav className="-mb-px flex space-x-4">
              {["basic", "address", "passport"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${
                    activeTab === tab
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  {tab === "basic" && "Basic Information"}
                  {tab === "address" && "Address"}
                  {tab === "passport" && "Passport Details"}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {/* Basic Information Tab */}
            {activeTab === "basic" && (
          <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={basicInfo.fullName}
                          onChange={(e) => {
                            setBasicInfo({ ...basicInfo, fullName: e.target.value });
                            if (errors.fullName) setErrors({ ...errors, fullName: "" });
                          }}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                          placeholder="Enter your full name"
                        />
                        {errors.fullName && (
                          <span className="mt-1 block text-xs text-rose-600">{errors.fullName}</span>
                        )}
                      </>
                    ) : (
                      <p className="mt-2 text-base text-slate-900">{profile.fullName || "—"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Email <span className="text-rose-500">*</span>
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="email"
                          value={basicInfo.email}
                          onChange={(e) => {
                            setBasicInfo({ ...basicInfo, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: "" });
                          }}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                          placeholder="you@example.com"
                        />
                        {errors.email && (
                          <span className="mt-1 block text-xs text-rose-600">{errors.email}</span>
                        )}
                      </>
                    ) : (
                      <p className="mt-2 text-base text-slate-900">{profile.email || "—"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    {isEditing ? (
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <CountryCodeSelect
                          value={basicInfo.countryCode}
                          onChange={(value) => setBasicInfo({ ...basicInfo, countryCode: value })}
                        />
                        <input
                          type="tel"
                          value={basicInfo.mobile_number}
                          onChange={(e) => {
                            setBasicInfo({ ...basicInfo, mobile_number: e.target.value });
                            if (errors.mobile_number) setErrors({ ...errors, mobile_number: "" });
                          }}
                          className="col-span-2 rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                          placeholder="1234567890"
                        />
                      </div>
                    ) : (
                      <p className="mt-2 text-base text-slate-900">
                        {profile.countryCode} {profile.mobile_number || "—"}
                      </p>
                    )}
                    {errors.mobile_number && (
                      <span className="mt-1 block text-xs text-rose-600">{errors.mobile_number}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
                    {isEditing ? (
                      <>
                        <input
                          type="date"
                          value={basicInfo.date_of_birth}
                          onChange={(e) => {
                            setBasicInfo({ ...basicInfo, date_of_birth: e.target.value });
                            if (errors.date_of_birth) setErrors({ ...errors, date_of_birth: "" });
                          }}
                          max={new Date().toISOString().split('T')[0]}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                        />
                        {errors.date_of_birth && (
                          <span className="mt-1 block text-xs text-rose-600">{errors.date_of_birth}</span>
                        )}
                      </>
                    ) : (
                      <p className="mt-2 text-base text-slate-900">
                        {profile.date_of_birth
                          ? new Date(profile.date_of_birth).toLocaleDateString()
                          : "—"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Gender</label>
                    {isEditing ? (
                      <select
                        value={basicInfo.gender}
                        onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="mt-2 text-base text-slate-900 capitalize">
                        {profile.gender || "—"}
                      </p>
                    )}
                </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={basicInfo.city}
                        onChange={(e) => setBasicInfo({ ...basicInfo, city: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                        placeholder="Enter your city"
                      />
                    ) : (
                      <p className="mt-2 text-base text-slate-900">{profile.city || "—"}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Company Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={basicInfo.company_name}
                        onChange={(e) => setBasicInfo({ ...basicInfo, company_name: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                        placeholder="Enter your company name"
                      />
                    ) : (
                      <p className="mt-2 text-base text-slate-900">{profile.company_name || "—"}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Address Tab */}
            {activeTab === "address" && (
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Street Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                        placeholder="Enter street address"
                      />
                    ) : (
                      <p className="mt-2 text-base text-slate-900">{profile.address?.street || "—"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">City</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                        placeholder="Enter city"
                      />
                    ) : (
                      <p className="mt-2 text-base text-slate-900">{profile.address?.city || "—"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">State/Province</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                        placeholder="Enter state or province"
                      />
                    ) : (
                      <p className="mt-2 text-base text-slate-900">{profile.address?.state || "—"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Country</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                        placeholder="Enter country"
                      />
                    ) : (
                      <p className="mt-2 text-base text-slate-900">{profile.address?.country || "—"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Zip/Postal Code</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={address.zipCode}
                        onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                        placeholder="Enter zip code"
                      />
                    ) : (
                      <p className="mt-2 text-base text-slate-900">{profile.address?.zipCode || "—"}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Passport Tab */}
            {activeTab === "passport" && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4">
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-800">Passport Information</p>
                      <p className="mt-1 text-xs text-amber-700">
                        This information is used to auto-fill visa application forms. Keep it up to date for faster processing.
                    </p>
                  </div>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Passport Number</label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={passportInfo.passportNumber}
                          onChange={(e) => {
                            setPassportInfo({ ...passportInfo, passportNumber: e.target.value.toUpperCase() });
                            if (errors.passportNumber) setErrors({ ...errors, passportNumber: "" });
                          }}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none uppercase"
                          placeholder="A12345678"
                        />
                        {errors.passportNumber && (
                          <span className="mt-1 block text-xs text-rose-600">{errors.passportNumber}</span>
                        )}
                      </>
                    ) : (
                      <p className="mt-2 text-base text-slate-900 font-mono">
                        {profile.passportInfo?.passportNumber || "—"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Nationality</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={passportInfo.nationality}
                        onChange={(e) => setPassportInfo({ ...passportInfo, nationality: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                        placeholder="Enter nationality"
                      />
                    ) : (
                      <p className="mt-2 text-base text-slate-900">{profile.passportInfo?.nationality || "—"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Issue Date</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={passportInfo.issueDate}
                        onChange={(e) => {
                          setPassportInfo({ ...passportInfo, issueDate: e.target.value });
                          if (errors.issueDate) setErrors({ ...errors, issueDate: "" });
                        }}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                      />
                    ) : (
                      <p className="mt-2 text-base text-slate-900">
                        {profile.passportInfo?.issueDate
                          ? new Date(profile.passportInfo.issueDate).toLocaleDateString()
                          : "—"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700">Expiry Date</label>
                    {isEditing ? (
                      <>
                        <input
                          type="date"
                          value={passportInfo.expiryDate}
                          onChange={(e) => {
                            setPassportInfo({ ...passportInfo, expiryDate: e.target.value });
                            if (errors.expiryDate) setErrors({ ...errors, expiryDate: "" });
                          }}
                          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                        />
                        {errors.expiryDate && (
                          <span className="mt-1 block text-xs text-rose-600">{errors.expiryDate}</span>
                        )}
                      </>
                    ) : (
                      <p className="mt-2 text-base text-slate-900">
                        {profile.passportInfo?.expiryDate
                          ? new Date(profile.passportInfo.expiryDate).toLocaleDateString()
                          : "—"}
                      </p>
                    )}
                </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Place of Issue</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={passportInfo.placeOfIssue}
                        onChange={(e) => setPassportInfo({ ...passportInfo, placeOfIssue: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
                        placeholder="Enter place of issue"
                      />
                    ) : (
                      <p className="mt-2 text-base text-slate-900">{profile.passportInfo?.placeOfIssue || "—"}</p>
                    )}
              </div>
                </div>

                {/* Passport Images */}
                <div className="mt-8">
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Passport Document Images</h3>
                    <p className="text-sm text-slate-600">
                      Upload clear images of your passport. These will be used to auto-fill visa application forms.
                    </p>
                </div>

                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
                    {isEditing ? (
                      <>
                        {/* Passport Front */}
                        <div className="group">
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                              <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-slate-900">Front Page</label>
                              <p className="text-xs text-slate-500">Photo & details page</p>
                            </div>
                          </div>
                          <div className="relative upload-menu-container">
                            <div
                              className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                                passportInfo.passportFrontImage && !passportInfo.passportFrontImage.includes('placeholder')
                                  ? "border-slate-300 bg-white hover:border-indigo-400"
                                  : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/30"
                              }`}
                              style={{ height: "200px" }}
                              onClick={() => {
                                if (passportInfo.passportFrontImage && !passportInfo.passportFrontImage.includes('placeholder')) {
                                  handleImageClick(passportInfo.passportFrontImage, 'passportFrontImage');
                                } else {
                                  setActiveUploadMenu(activeUploadMenu === 'front' ? null : 'front');
                                }
                              }}
                            >
                              {passportInfo.passportFrontImage && !passportInfo.passportFrontImage.includes('placeholder') ? (
                                <>
                                  <img
                                    src={passportInfo.passportFrontImage}
                                    alt="Passport Front"
                                    className="h-full w-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPassportInfo({ ...passportInfo, passportFrontImage: "" });
                                      setImageSources(prev => ({ ...prev, passportFrontImage: null }));
                                    }}
                                    className="absolute top-2 right-2 rounded-full bg-rose-500 p-1.5 text-white shadow-lg transition hover:bg-rose-600"
                                  >
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                </button>
                                </>
                              ) : (
                                <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                                  <svg className="h-10 w-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <p className="text-xs font-medium text-slate-600 mt-1">Click to upload</p>
                                  <p className="text-xs text-slate-400 mt-0.5">Gallery or camera</p>
              </div>
                              )}
            </div>
                            {activeUploadMenu === 'front' && (
                              <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageUpload('passportFrontImage', false);
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50 first:rounded-t-xl"
                                >
                                  <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>Choose from Gallery</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageUpload('passportFrontImage', true);
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50 last:rounded-b-xl"
                                >
                                  <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>Take Photo</span>
                                </button>
                </div>
                            )}
            </div>
          </div>

                        {/* Passport Back */}
                        <div className="group">
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                              <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-slate-900">Back Page</label>
                              <p className="text-xs text-slate-500">Visa pages & stamps</p>
                            </div>
                          </div>
                          <div className="relative upload-menu-container">
                            <div
                              className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                                passportInfo.passportBackImage && !passportInfo.passportBackImage.includes('placeholder')
                                  ? "border-slate-300 bg-white hover:border-indigo-400"
                                  : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/30"
                              }`}
                              style={{ height: "200px" }}
                              onClick={() => {
                                if (passportInfo.passportBackImage && !passportInfo.passportBackImage.includes('placeholder')) {
                                  handleImageClick(passportInfo.passportBackImage, 'passportBackImage');
                                } else {
                                  setActiveUploadMenu(activeUploadMenu === 'back' ? null : 'back');
                                }
                              }}
                            >
                              {passportInfo.passportBackImage && !passportInfo.passportBackImage.includes('placeholder') ? (
                                <>
                                  <img
                                    src={passportInfo.passportBackImage}
                                    alt="Passport Back"
                                    className="h-full w-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPassportInfo({ ...passportInfo, passportBackImage: "" });
                                      setImageSources(prev => ({ ...prev, passportBackImage: null }));
                                    }}
                                    className="absolute top-2 right-2 rounded-full bg-rose-500 p-1.5 text-white shadow-lg transition hover:bg-rose-600"
                                  >
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </>
                              ) : (
                                <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                                  <svg className="h-10 w-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <p className="text-xs font-medium text-slate-600 mt-1">Click to upload</p>
                                  <p className="text-xs text-slate-400 mt-0.5">Gallery or camera</p>
                                </div>
                              )}
                            </div>
                            {activeUploadMenu === 'back' && (
                              <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageUpload('passportBackImage', false);
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50 first:rounded-t-xl"
                                >
                                  <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>Choose from Gallery</span>
                                </button>
              <button
                type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageUpload('passportBackImage', true);
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50 last:rounded-b-xl"
                                >
                                  <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>Take Photo</span>
              </button>
            </div>
                            )}
                          </div>
                        </div>

                        {/* Passport Full Copy */}
                        <div className="group">
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                              <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-slate-900">Full Document</label>
                              <p className="text-xs text-slate-500">Complete passport scan</p>
                            </div>
                          </div>
                          <div className="relative upload-menu-container">
                            <div
                              className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                                passportInfo.passportFullCopy && !passportInfo.passportFullCopy.includes('placeholder')
                                  ? "border-slate-300 bg-white hover:border-indigo-400"
                                  : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/30"
                              }`}
                              style={{ height: "200px" }}
                              onClick={() => {
                                if (passportInfo.passportFullCopy && !passportInfo.passportFullCopy.includes('placeholder')) {
                                  handleImageClick(passportInfo.passportFullCopy, 'passportFullCopy');
                                } else {
                                  setActiveUploadMenu(activeUploadMenu === 'full' ? null : 'full');
                                }
                              }}
                            >
                              {passportInfo.passportFullCopy && !passportInfo.passportFullCopy.includes('placeholder') ? (
                                <>
                                  <img
                                    src={passportInfo.passportFullCopy}
                                    alt="Passport Full Copy"
                                    className="h-full w-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPassportInfo({ ...passportInfo, passportFullCopy: "" });
                                      setImageSources(prev => ({ ...prev, passportFullCopy: null }));
                                    }}
                                    className="absolute top-2 right-2 rounded-full bg-rose-500 p-1.5 text-white shadow-lg transition hover:bg-rose-600"
                                  >
                                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </>
                              ) : (
                                <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                                  <svg className="h-10 w-10 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <p className="text-xs font-medium text-slate-600 mt-1">Click to upload</p>
                                  <p className="text-xs text-slate-400 mt-0.5">Gallery or camera</p>
          </div>
        )}
      </div>
                            {activeUploadMenu === 'full' && (
                              <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageUpload('passportFullCopy', false);
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50 first:rounded-t-xl"
                                >
                                  <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span>Choose from Gallery</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleImageUpload('passportFullCopy', true);
                                  }}
                                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50 last:rounded-b-xl"
                                >
                                  <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>Take Photo</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* View Mode */}
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                              <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-slate-900">Front Page</label>
                              <p className="text-xs text-slate-500">Photo & details page</p>
                            </div>
                          </div>
                          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50" style={{ height: "200px" }}>
                            {profile.passportInfo?.passportFrontImage ? (
                              <img
                                src={profile.passportInfo.passportFrontImage}
                                alt="Passport Front"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.src = passportPlaceholder;
                                }}
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <p className="text-xs text-slate-400">No image uploaded</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                              <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-slate-900">Back Page</label>
                              <p className="text-xs text-slate-500">Visa pages & stamps</p>
                            </div>
                          </div>
                          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50" style={{ height: "200px" }}>
                            {profile.passportInfo?.passportBackImage ? (
                              <img
                                src={profile.passportInfo.passportBackImage}
                                alt="Passport Back"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.src = passportPlaceholder;
                                }}
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <p className="text-xs text-slate-400">No image uploaded</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="mb-2 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                              <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-slate-900">Full Document</label>
                              <p className="text-xs text-slate-500">Complete passport scan</p>
                            </div>
                          </div>
                          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50" style={{ height: "200px" }}>
                            {profile.passportInfo?.passportFullCopy ? (
                              <img
                                src={profile.passportInfo.passportFullCopy}
                                alt="Passport Full Copy"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.src = passportPlaceholder;
                                }}
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <p className="text-xs text-slate-400">No image uploaded</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {isEditing && (
                    <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-3">
                      <div className="flex items-start gap-2">
                        <svg className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-blue-800">
                          <span className="font-semibold">Tip:</span> Ensure images are clear, well-lit, and show all passport details. You can upload from your gallery or take a photo directly.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (activeTab === "passport") {
                      handleUpdatePassport();
                    } else {
                      handleUpdateProfile();
                    }
                  }}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader size="sm" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {cameraModal.show && (
        <CameraModal
          fieldName={cameraModal.fieldName}
          stream={cameraModal.stream}
          onCapture={handleCameraCapture}
          onClose={() => {
            if (cameraModal.stream) {
              cameraModal.stream.getTracks().forEach(track => track.stop());
            }
            setCameraModal({ show: false, fieldName: null, stream: null });
          }}
        />
      )}

      {/* Image Crop Modal */}
      {cropModal.show && (
        <ImageCropModal
          imageSrc={cropModal.imageSrc}
          onCrop={handleCropComplete}
          onClose={() => setCropModal({ show: false, imageSrc: null, fieldName: null })}
        />
      )}

      {/* Image Preview Modal */}
      {imagePreview.show && (
        <ImagePreviewModal
          imageSrc={imagePreview.imageSrc}
          onCrop={handleCropFromPreview}
          onUploadNew={handleUploadNewFromPreview}
          onClose={() => setImagePreview({ show: false, imageSrc: null, fieldName: null, source: null })}
          source={imagePreview.source}
        />
      )}
    </section>
  );
};

export default UserDetails;
