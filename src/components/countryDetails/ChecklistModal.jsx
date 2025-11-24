import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import UploadDocumentService from "../../services/uploadDocument/uploadDocument.services";

// Image Crop Modal Component
const ImageCropModal = ({ imageSrc, onCrop, onClose }) => {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [imageSize, setImageSize] = useState({
    width: 0,
    height: 0,
    displayWidth: 0,
    displayHeight: 0,
    offsetX: 0,
    offsetY: 0,
  });
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

        let displayWidth,
          displayHeight,
          offsetX = 0,
          offsetY = 0;
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
    if (
      e.target === containerRef.current ||
      e.target.closest(".crop-overlay")
    ) {
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
      const scaledOffsetX =
        imageSize.offsetX - (imageSize.displayWidth * (scale - 1)) / 2;
      const scaledOffsetY =
        imageSize.offsetY - (imageSize.displayHeight * (scale - 1)) / 2;

      // Constrain to scaled image bounds
      const maxX = scaledOffsetX + scaledDisplayWidth - cropArea.width;
      const maxY = scaledOffsetY + scaledDisplayHeight - cropArea.height;

      setCropArea((prev) => ({
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
    const scaledOffsetX =
      imageSize.offsetX - (imageSize.displayWidth * (scale - 1)) / 2;
    const scaledOffsetY =
      imageSize.offsetY - (imageSize.displayHeight * (scale - 1)) / 2;

    const handleResizeMove = (moveE) => {
      const deltaX = moveE.clientX - startX;
      const deltaY = moveE.clientY - startY;

      let newCrop = { ...startCrop };

      if (corner.includes("n")) {
        const newHeight = startCrop.height - deltaY;
        const newY = startCrop.y + deltaY;
        if (newHeight > 50 && newY >= scaledOffsetY) {
          newCrop.height = newHeight;
          newCrop.y = newY;
        }
      }
      if (corner.includes("s")) {
        const newHeight = startCrop.height + deltaY;
        if (
          newHeight > 50 &&
          startCrop.y + newHeight <= scaledOffsetY + scaledDisplayHeight
        ) {
          newCrop.height = newHeight;
        }
      }
      if (corner.includes("w")) {
        const newWidth = startCrop.width - deltaX;
        const newX = startCrop.x + deltaX;
        if (newWidth > 50 && newX >= scaledOffsetX) {
          newCrop.width = newWidth;
          newCrop.x = newX;
        }
      }
      if (corner.includes("e")) {
        const newWidth = startCrop.width + deltaX;
        if (
          newWidth > 50 &&
          startCrop.x + newWidth <= scaledOffsetX + scaledDisplayWidth
        ) {
          newCrop.width = newWidth;
        }
      }

      // Constrain to scaled image bounds
      newCrop.x = Math.max(
        scaledOffsetX,
        Math.min(newCrop.x, scaledOffsetX + scaledDisplayWidth - newCrop.width)
      );
      newCrop.y = Math.max(
        scaledOffsetY,
        Math.min(
          newCrop.y,
          scaledOffsetY + scaledDisplayHeight - newCrop.height
        )
      );
      newCrop.width = Math.min(
        newCrop.width,
        scaledOffsetX + scaledDisplayWidth - newCrop.x
      );
      newCrop.height = Math.min(
        newCrop.height,
        scaledOffsetY + scaledDisplayHeight - newCrop.y
      );

      setCropArea(newCrop);
    };

    const handleResizeUp = () => {
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeUp);
    };

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeUp);
  };

  const getCroppedImage = () => {
    if (!imageRef.current || !canvasRef.current || !imageSize.width)
      return null;

    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Calculate the actual displayed image position accounting for scale
    const scaledDisplayWidth = imageSize.displayWidth * scale;
    const scaledDisplayHeight = imageSize.displayHeight * scale;
    const scaledOffsetX =
      imageSize.offsetX - (imageSize.displayWidth * (scale - 1)) / 2;
    const scaledOffsetY =
      imageSize.offsetY - (imageSize.displayHeight * (scale - 1)) / 2;

    // Calculate crop coordinates in image pixel space
    const scaleX = imageSize.width / scaledDisplayWidth;
    const scaleY = imageSize.height / scaledDisplayHeight;

    const cropX = Math.max(0, (cropArea.x - scaledOffsetX) * scaleX);
    const cropY = Math.max(0, (cropArea.y - scaledOffsetY) * scaleY);
    const cropWidth = Math.min(
      imageSize.width - cropX,
      cropArea.width * scaleX
    );
    const cropHeight = Math.min(
      imageSize.height - cropY,
      cropArea.height * scaleY
    );

    // Set canvas size to match crop area
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;

    // Draw cropped portion, scaling to fit canvas
    ctx.drawImage(
      img,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropArea.width,
      cropArea.height
    );

    return canvas.toDataURL("image/jpeg", 0.92);
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Crop Your Image
            </h3>
            <p className="text-sm text-slate-600">
              Drag to move, resize corners to adjust crop area
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
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
                    left: `${
                      imageSize.offsetX -
                      (imageSize.displayWidth * (scale - 1)) / 2
                    }px`,
                    top: `${
                      imageSize.offsetY -
                      (imageSize.displayHeight * (scale - 1)) / 2
                    }px`,
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
              <span className="text-sm text-slate-600 w-12">
                {Math.round(scale * 100)}%
              </span>
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
      console.warn("CameraModal: No stream provided");
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
        console.error("CameraModal: Video element not found in DOM");
        setIsReady(false);
        return;
      }

      setIsReady(false);

      // Clear any existing stream first
      if (video.srcObject) {
        const oldStream = video.srcObject;
        oldStream.getTracks().forEach((track) => {
          track.stop();
        });
        video.srcObject = null;
      }

      // Set the new stream
      try {
        video.srcObject = currentStream;
      } catch (err) {
        console.error("Error setting stream to video:", err);
        setIsReady(false);
        return;
      }

      // Ensure video is ready
      handleCanPlay = () => {
        if (video) {
          video
            .play()
            .then(() => {
              setIsReady(true);
            })
            .catch((err) => {
              console.error("Error playing video in canplay handler:", err);
            });
        }
      };

      handleLoadedMetadata = () => {
        if (video && video.paused) {
          video
            .play()
            .then(() => {
              setIsReady(true);
            })
            .catch((err) => console.error("Play error after metadata:", err));
        }
      };

      handlePlaying = () => {
        setIsReady(true);
      };

      handleError = (e) => {
        console.error("Video error:", e, video?.error);
      };

      // Add event listeners
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("playing", handlePlaying);
      video.addEventListener("error", handleError);

      // Try to play immediately
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsReady(true);
          })
          .catch((err) => {
            console.error("Error playing video (immediate):", err);
          });
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      // Clean up event listeners
      if (
        video &&
        handleCanPlay &&
        handleLoadedMetadata &&
        handlePlaying &&
        handleError
      ) {
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("playing", handlePlaying);
        video.removeEventListener("error", handleError);
      }
      setIsReady(false);
    };
  }, [stream]);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const currentStream = stream;

    if (!video || !canvas || !currentStream) {
      Swal.fire({
        icon: "error",
        title: "Capture Error",
        text: "Camera not ready. Please try again.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }

    if (
      !video.videoWidth ||
      !video.videoHeight ||
      video.videoWidth === 0 ||
      video.videoHeight === 0 ||
      video.paused ||
      video.ended
    ) {
      Swal.fire({
        icon: "error",
        title: "Camera Not Ready",
        text: "Please wait for the camera to initialize.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }

    try {
      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/jpeg", 0.92);

      if (!imageData || imageData === "data:,") {
        throw new Error("Failed to capture image data");
      }

      currentStream.getTracks().forEach((track) => {
        track.stop();
      });

      onCapture(imageData);
    } catch (error) {
      console.error("Capture error:", error);
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
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Capture Photo
            </h3>
            <p className="text-sm text-slate-600">
              Position your document in the frame
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Camera Preview */}
        <div className="p-6">
          <div
            className="relative mx-auto overflow-hidden rounded-xl bg-slate-900"
            style={{ width: "100%", height: "500px", maxHeight: "70vh" }}
          >
            {stream ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-contain"
                  style={{ minHeight: "100%", minWidth: "100%" }}
                />
                {!isReady && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/90">
                    <div className="text-center">
                      <span className="inline-flex h-12 w-12 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
                      <p className="mt-4 text-sm text-white">
                        Initializing camera...
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <span className="inline-flex h-12 w-12 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
                  <p className="mt-4 text-sm text-white">
                    Waiting for camera stream...
                  </p>
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
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {isReady ? "Capture Photo" : "Initializing..."}
            </button>
          </div>
        </div>

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

const ChecklistModal = ({
  open,
  loading,
  error,
  checklist,
  onClose,
  onOpenApplicationForm,
  countryId,
  countryCode,
  tripPurposeId,
  tripPurposeCode,
}) => {
  // const DOCUMENT_BASE_URL = "https://9zqwrzw6-2030.inc1.devtunnels.ms/";
  const DOCUMENT_BASE_URL = "visa-phase2.itfuturz.in";

  const buildDocumentUrl = (filePath) => {
    if (!filePath || typeof filePath !== "string") return filePath;
    if (
      filePath.startsWith("data:") ||
      filePath.startsWith("blob:") ||
      /^https?:\/\//i.test(filePath)
    ) {
      return filePath;
    }
    const cleanedPath = filePath.startsWith("/")
      ? filePath.substring(1)
      : filePath;
    return `${DOCUMENT_BASE_URL}${cleanedPath}`;
  };

  const ACCEPTED_FILE_TYPES = [
    ".jpg",
    ".jpeg",
    ".png",
    ".pdf",
    "image/jpeg",
    "image/png",
    "application/pdf",
  ];
  const ACCEPTED_FORMATS = ["jpg", "jpeg", "png", "pdf"];

  const sanitizeExtension = (extension) => {
    if (!extension) return "";
    const normalized = extension.replace(/^\./, "").toLowerCase();
    if (normalized === "jpeg") {
      return "jpg";
    }
    return normalized;
  };

  const [activeUploadMenu, setActiveUploadMenu] = useState(null);
  const [cropModal, setCropModal] = useState({
    show: false,
    imageSrc: null,
    itemId: null,
  });
  const [cameraModal, setCameraModal] = useState({
    show: false,
    itemId: null,
    stream: null,
  });
  
  // Structure: { itemId: [{ id, name, url, status, documentId, file }] }
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [previewModal, setPreviewModal] = useState({
    show: false,
    file: null,
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeUploadMenu && !e.target.closest(".upload-menu-container")) {
        setActiveUploadMenu(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activeUploadMenu]);

  // Extract uploaded documents from checklist items when modal opens or checklist changes
  useEffect(() => {
    if (!open || !checklist?.items || checklist.items.length === 0) {
      return;
    }

    // Process uploadedDocuments from each checklist item
    // Always prioritize backend data as the source of truth
    setUploadedFiles((prevFiles) => {
      const filesByItem = {};
      
      // Get current checklist item IDs to preserve uploading files only for current items
      const currentItemIds = new Set(checklist.items.map(item => item._id));
      
      checklist.items.forEach((item) => {
        const itemId = item._id;
        const existingFiles = prevFiles[itemId] || [];
        
        // Keep files that are currently uploading (only for current checklist items)
        // These are files that haven't been uploaded to backend yet
        const filesToKeep = existingFiles.filter(
          f => f.status === "uploading" && currentItemIds.has(itemId)
        );
        
        // Always load documents from API - backend is the source of truth
        // This ensures documents persist when switching trip purposes or reopening modal
        if (item.uploadedDocuments && Array.isArray(item.uploadedDocuments) && item.uploadedDocuments.length > 0) {
          const documentsFromAPI = item.uploadedDocuments.map((doc) => {
            // Extract file name from URL or use documentType or title
            const fileName = doc.fileUrl
              ? doc.fileUrl.split("/").pop() || doc.documentType || doc.title || "document"
              : doc.documentType || doc.title || "document";

            return {
              id: doc._id,
              name: fileName,
              url: buildDocumentUrl(doc.fileUrl),
              status: "success",
              documentId: doc._id,
              file: null, // No file object for documents from API
            };
          });

          // Merge: backend documents first (source of truth), then any uploading files
          // Backend documents always take precedence
          const backendDocIds = new Set(documentsFromAPI.map(d => d.documentId));
          const uploadingFiles = filesToKeep.filter(f => {
            // Only keep uploading files that don't have a documentId yet
            // or that aren't already in the backend response
            return !f.documentId || !backendDocIds.has(f.documentId);
          });
          
          filesByItem[itemId] = [...documentsFromAPI, ...uploadingFiles];
        } else {
          // No documents from API for this item, but keep any files that are uploading
          filesByItem[itemId] = filesToKeep;
        }
      });

      // Clear files for items that no longer exist in the current checklist
      // This prevents stale data from previous trip purposes
      return filesByItem;
    });
  }, [open, checklist]);

  // Cleanup object URLs on unmount - use ref to access latest state
  const uploadedFilesRef = useRef(uploadedFiles);
  useEffect(() => {
    uploadedFilesRef.current = uploadedFiles;
  }, [uploadedFiles]);

  useEffect(() => {
    return () => {
      // Cleanup blob URLs on unmount
      Object.values(uploadedFilesRef.current).forEach((files) => {
        files.forEach((file) => {
          if (file.url && file.url.startsWith("blob:")) {
            URL.revokeObjectURL(file.url);
          }
        });
      });
    };
  }, []);

  // Helper function to validate file
  const validateFile = (file, item) => {
    if (!file) {
      return {
        valid: false,
        message: "File is required",
      };
    }

    // Validate file format
    const allowedFormats = item.fileFormat
      ? item.fileFormat
          .split(",")
          .map((format) => sanitizeExtension(format.trim().toLowerCase()))
          .filter(Boolean)
      : [...ACCEPTED_FORMATS];

    const fileName = file.name || "";
    const fileExtension = sanitizeExtension(
      fileName.split(".").pop()?.toLowerCase() || ""
    );

    if (
      fileExtension &&
      !allowedFormats.includes(fileExtension) &&
      !ACCEPTED_FORMATS.includes(fileExtension)
    ) {
      const formatsToShow = allowedFormats.length
        ? allowedFormats
        : ACCEPTED_FORMATS;
      return {
        valid: false,
        message: `Invalid file format. Allowed formats: ${formatsToShow
          .map((fmt) => (fmt === "jpg" ? "JPG/JPEG" : fmt.toUpperCase()))
          .join(", ")}`,
      };
    }

    // Validate file size (only if file has size property)
    if (file.size !== undefined) {
      const maxFileSizeInBytes = (item.maxFileSize || 5) * 1024 * 1024;
      if (file.size > maxFileSizeInBytes) {
        return {
          valid: false,
          message: `File size exceeds the limit of ${item.maxFileSize || 5}MB`,
        };
      }
    }

    return { valid: true };
  };

  // Get file preview URL
  const getFilePreviewUrl = (file) => {
    if (typeof file === "string" && file.startsWith("data:")) {
      return file;
    }
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return file?.url || file;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  // Convert base64 to File
  const base64ToFile = (base64String, filename, mimeType) => {
    const byteCharacters = atob(base64String.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const baseName = filename?.replace(/\.[^/.]+$/, "") || "document";
    const extensionFromName = sanitizeExtension(
      filename?.split(".").pop() || ""
    );
    const extensionFromMime = sanitizeExtension(mimeType?.split("/")?.[1]);
    const finalExtension =
      extensionFromName || extensionFromMime || "jpg";
    const finalName = `${baseName}.${finalExtension}`;
    return new File([byteArray], finalName, {
      type: mimeType || `image/${finalExtension === "pdf" ? "pdf" : finalExtension}`,
    });
  };

  // Handle file upload
  const handleUpload = async (file, itemId) => {
    const item = checklist?.items?.find((i) => i._id === itemId);
    if (!item) return;

    // Get file object for validation
    let fileObj = file;
    if (typeof file === "string" && file.startsWith("data:")) {
      const mimeType = file.match(/data:([^;]+);/)?.[1] || "image/jpeg";
      const extension = sanitizeExtension(mimeType.split("/")[1] || "jpg");
      fileObj = base64ToFile(
        file,
        `${item.title || "document"}.${extension}`,
        mimeType
      );
    }

    // Validate file
    const validation = validateFile(fileObj, item);
    if (!validation.valid) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: validation.message,
        confirmButtonColor: "#0f172a",
      });
      return;
    }

    // Create a unique ID for this upload
    const uploadId = `${itemId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileName = fileObj.name || `${item.title || "document"}.${fileObj.type?.split("/")[1] || "jpg"}`;
    const previewUrl = getFilePreviewUrl(file);

    // Add file to state with "uploading" status
    setUploadedFiles((prev) => ({
      ...prev,
      [itemId]: [
        ...(prev[itemId] || []),
        {
          id: uploadId,
          name: fileName,
          url: previewUrl,
          status: "uploading",
          documentId: null,
          file: fileObj,
        },
      ],
    }));

    try {
      // Convert to File if it's a base64 string
      let fileToUpload = fileObj;
      if (typeof file === "string" && file.startsWith("data:")) {
      const mimeType = file.match(/data:([^;]+);/)?.[1] || "image/jpeg";
      const extension = sanitizeExtension(mimeType.split("/")[1] || "jpg");
        fileToUpload = base64ToFile(
          file,
        `${item.title || "document"}.${extension}`,
          mimeType
        );
      }

      const response = await UploadDocumentService.uploadDocument({
        checklistItemId: itemId,
        countryId: countryId,
        countryCode: countryCode,
        tripPurposeId: tripPurposeId,
        tripPurposeCode: tripPurposeCode,
        file: fileToUpload,
      });

      // Update file status to "success" and store document ID
      setUploadedFiles((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] || []).map((f) =>
          f.id === uploadId
            ? {
                ...f,
                status: "success",
                documentId: response?.data?._id || null,
                url: response?.data?.fileUrl || f.url,
              }
            : f
        ),
      }));
    } catch (error) {
      console.error("Upload error:", error);
      // Update file status to "error"
      setUploadedFiles((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] || []).map((f) =>
          f.id === uploadId
            ? {
                ...f,
                status: "error",
              }
            : f
        ),
      }));
    }
  };

  // Handle file removal
  const handleRemoveFile = (itemId, fileId) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || []).filter((f) => {
        if (f.id === fileId) {
          // Clean up object URL if it exists
          if (f.url && f.url.startsWith("blob:")) {
            URL.revokeObjectURL(f.url);
          }
          return false;
        }
        return true;
      }),
    }));
  };

  // Handle image upload (gallery or camera)
  const handleImageUpload = (itemId, useCamera = false) => {
    if (useCamera) {
      // Check if we're on HTTPS or localhost
      const isSecureContext =
        window.isSecureContext ||
        location.protocol === "https:" ||
        location.hostname === "localhost" ||
        location.hostname === "127.0.0.1";

      if (!isSecureContext) {
        Swal.fire({
          icon: "error",
          title: "Camera Access Required",
          text: "Camera access requires HTTPS. Please use a secure connection or upload from gallery.",
          confirmButtonColor: "#0f172a",
        });
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        Swal.fire({
          icon: "error",
          title: "Camera Not Supported",
          text: "Your browser does not support camera access. Please use a modern browser or upload from gallery.",
          confirmButtonColor: "#0f172a",
        });
        return;
      }

      // Request camera access
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        })
        .then((stream) => {
          setCameraModal({
            show: true,
            itemId: itemId,
            stream: stream,
          });
        })
        .catch((error) => {
          console.error("Camera error:", error);
          let errorMessage = "Please allow camera access to take photos.";
          if (error.name === "NotAllowedError") {
            errorMessage = "Camera access was denied. Please allow camera access in your browser settings.";
          } else if (error.name === "NotFoundError") {
            errorMessage =
              "No camera found. Please connect a camera or use gallery upload.";
          } else if (error.name === "NotReadableError") {
            errorMessage =
              "Camera is already in use by another application.";
          }

          Swal.fire({
            icon: "error",
            title: "Camera Access Failed",
            text: errorMessage,
            confirmButtonColor: "#0f172a",
          });

          // Fallback to file input with capture attribute
          openFileInputWithCamera(itemId);
        });
    } else {
      // Gallery selection
      openFileInputForGallery(itemId);
    }
    setActiveUploadMenu(null);
  };

  // Handle camera capture
  const handleCameraCapture = (imageData) => {
    const itemId = cameraModal.itemId;

    // Close camera modal and stop stream
    if (cameraModal.stream) {
      cameraModal.stream.getTracks().forEach((track) => track.stop());
    }
    setCameraModal({ show: false, itemId: null, stream: null });

    // Show crop modal
    if (itemId && imageData) {
      setCropModal({
        show: true,
        imageSrc: imageData,
        itemId: itemId,
      });
    }
  };

  // Handle crop completion
  const handleCropComplete = (croppedImage) => {
    if (cropModal.itemId) {
      handleUpload(croppedImage, cropModal.itemId);
    }
    setCropModal({ show: false, imageSrc: null, itemId: null });
  };

  // Open file input for gallery selection
  const openFileInputForGallery = (itemId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPTED_FILE_TYPES.join(",");
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          handleUpload(reader.result, itemId);
        };
        reader.readAsDataURL(file);
      }
      if (input.parentNode) {
        document.body.removeChild(input);
      }
    };

    input.style.display = "none";
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

  // Fallback: Open file input with camera capture attribute
  const openFileInputWithCamera = (itemId) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPTED_FILE_TYPES.join(",");
    input.setAttribute("capture", "environment");

    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCropModal({
            show: true,
            imageSrc: reader.result,
            itemId: itemId,
          });
        };
        reader.readAsDataURL(file);
      }
      if (input.parentNode) {
        document.body.removeChild(input);
      }
    };

    input.style.position = "fixed";
    input.style.top = "-1000px";
    input.style.left = "-1000px";
    document.body.appendChild(input);

    setTimeout(() => {
      try {
        input.click();
        setTimeout(() => {
          if (input.parentNode) {
            document.body.removeChild(input);
          }
        }, 2000);
      } catch (err) {
        console.error("Error clicking file input:", err);
        if (input.parentNode) {
          document.body.removeChild(input);
        }
      }
    }, 100);
  };

  // Handle file upload (non-image files)
  const handleFileUpload = (itemId) => {
    const item = checklist?.items?.find((i) => i._id === itemId);
    if (!item) return;

    const input = document.createElement("input");
    input.type = "file";
    
    // Set accepted file types based on item requirements
    if (item.fileFormat) {
      const formats = item.fileFormat.split(",").map((f) => `.${f.trim()}`);
      input.accept = formats.join(",");
    } else {
      input.accept = ACCEPTED_FILE_TYPES.join(",");
    }

    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleUpload(file, itemId);
      }
      if (input.parentNode) {
        document.body.removeChild(input);
      }
    };

    input.style.display = "none";
    document.body.appendChild(input);
    requestAnimationFrame(() => {
      input.click();
      setTimeout(() => {
        if (input.parentNode) {
          document.body.removeChild(input);
        }
      }, 1000);
    });
    setActiveUploadMenu(null);
  };

  // Check if all required documents are uploaded
  const checkAllRequiredUploaded = () => {
    if (!checklist?.items || checklist.items.length === 0) return false;
    
    const requiredItems = checklist.items.filter(
      (item) => item.isRequired || item.defaultIsMandatory
    );
    
    if (requiredItems.length === 0) return true; // No required items
    
    return requiredItems.every((item) => {
      const itemFiles = uploadedFiles[item._id] || [];
      return itemFiles.some((f) => f.status === "success");
    });
  };

  // Get upload progress for required documents
  const getUploadProgress = () => {
    if (!checklist?.items || checklist.items.length === 0) return { uploaded: 0, total: 0 };
    
    const requiredItems = checklist.items.filter(
      (item) => item.isRequired || item.defaultIsMandatory
    );
    
    if (requiredItems.length === 0) return { uploaded: 0, total: 0 };
    
    const uploaded = requiredItems.filter((item) => {
      const itemFiles = uploadedFiles[item._id] || [];
      return itemFiles.some((f) => f.status === "success");
    }).length;
    
    return { uploaded, total: requiredItems.length };
  };

  const allRequiredUploaded = checkAllRequiredUploaded();
  const progress = getUploadProgress();

  // Handle document preview
  const handlePreviewDocument = (file) => {
    if (!file) return;
    const normalizedUrl = buildDocumentUrl(file.url);
    if (normalizedUrl) {
      setPreviewModal({
        show: true,
        file: {
          ...file,
          url: normalizedUrl,
        },
      });
    }
  };

  // Handle Next button click
  const handleNext = () => {
    if (allRequiredUploaded && onOpenApplicationForm) {
      // Call parent callback to open application form modal
      // This will also close the checklist modal
      onOpenApplicationForm();
    }
  };

  if (!open) return null;

  const tripPurposeName = checklist?.tripPurpose?.name || "Selected purpose";
  const tripPurposeIcon = checklist?.tripPurpose?.icon;
  const items = checklist?.items || [];
  const requiredCount = items.filter(
    (item) => item.isRequired || item.defaultIsMandatory
  ).length;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-10 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="w-full max-w-4xl overflow-hidden rounded-[36px] border border-white/10 bg-white shadow-[0_40px_140px_rgba(3,9,32,0.45)]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="relative bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-8 text-white">
            <div className="flex flex-wrap items-start justify-between gap-6 pr-16">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-200">
                  {tripPurposeIcon ? (
                    <img
                      src={tripPurposeIcon}
                      alt="purpose icon"
                      className="h-10 w-10 rounded-xl object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <svg
                      className="h-8 w-8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M12 6.75v10.5m-3-10.5v10.5m6-10.5v10.5M3.75 17.25h16.5"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                    Visa checklist
                  </p>
                  <h3 className="mt-2 text-3xl font-semibold tracking-tight">
                    {tripPurposeName}
                  </h3>
                  <p className="text-sm text-white/70">
                    Review and prepare the documents before you submit.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-center">
                <div className="rounded-2xl border border-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                    Total
                  </p>
                  <p className="text-2xl font-semibold text-white">
                    {items.length || "—"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                    Required
                  </p>
                  <p className="text-2xl font-semibold text-rose-200">
                    {requiredCount || "—"}
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 h-10 w-10 rounded-full border border-white/30 bg-slate-900/80 text-lg text-white/80 shadow-lg transition hover:text-white"
              aria-label="Close checklist modal"
            >
              ✕
            </button>
          </div>

          <div className="max-h-[70vh] overflow-y-auto bg-white px-8 py-6">
            {loading ? (
              <div className="flex flex-col items-center gap-4 py-16">
                <span className="inline-flex h-12 w-12 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
                <p className="text-sm text-slate-500">Preparing your checklist...</p>
              </div>
            ) : error ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            ) : items.length === 0 ? (
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
                No checklist items were returned for this purpose.
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => {
                  const isRequired = item.isRequired || item.defaultIsMandatory;
                  const itemFiles = uploadedFiles[item._id] || [];
                  const hasUploadedFiles = itemFiles.length > 0;
                  const hasSuccessfulUploads = itemFiles.some((f) => f.status === "success");
                  const isUploading = itemFiles.some((f) => f.status === "uploading");

                  return (
                    <div
                      key={item._id}
                      className="rounded-3xl border border-slate-100 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-500">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <p className="text-lg font-semibold text-slate-900">
                              {item.title}
                            </p>
                            {item.description && (
                              <p className="text-sm text-slate-500">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-4 py-1 text-xs font-semibold ${
                              isRequired
                                ? "bg-rose-100 text-rose-600"
                                : "bg-emerald-100 text-emerald-600"
                            }`}
                          >
                            {isRequired ? "Required" : "Optional"}
                          </span>
                          {hasSuccessfulUploads && (
                            <span className="rounded-full bg-green-100 px-4 py-1 text-xs font-semibold text-green-600">
                              Uploaded
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                        {item.documentType && (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                            {item.documentType}
                          </span>
                        )}
                        {item.fileFormat && (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                            Format: {item.fileFormat}
                          </span>
                        )}
                        {item.maxFileSize && (
                          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                            Max {item.maxFileSize} MB
                          </span>
                        )}
                      </div>
                      {item.customInstructions && (
                        <p className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
                          {item.customInstructions}
                        </p>
                      )}
                      
                      {/* Uploaded Files List */}
                      {itemFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {itemFiles.map((file) => (
                            <div
                              key={file.id}
                              className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                                file.status === "success"
                                  ? "border-green-200 bg-green-50 hover:border-green-300 hover:shadow-sm cursor-pointer"
                                  : file.status === "error"
                                  ? "border-rose-200 bg-rose-50"
                                  : "border-blue-200 bg-blue-50"
                              }`}
                              onClick={() => file.status === "success" && handlePreviewDocument(file)}
                            >
                              {/* File Preview/Icon */}
                              <div 
                                className="shrink-0"
                                title={file.status === "success" ? "Click to preview" : ""}
                              >
                                {file.url && 
                                 (file.url.startsWith("data:image") || 
                                  file.url.startsWith("blob:") ||
                                  file.url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) ||
                                  file.name?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) ? (
                                  <img
                                    src={file.url}
                                    alt={file.name}
                                    className="h-12 w-12 rounded-lg object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-200">
                                    <svg
                                      className="h-6 w-6 text-slate-500"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              {/* File Info */}
                              <div className="flex-1 min-w-0">
                                <p className={`truncate text-sm font-medium ${
                                  file.status === "success" 
                                    ? "text-slate-900" 
                                    : "text-slate-900"
                                }`}>
                                  {file.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {file.status === "uploading" && (
                                    <>
                                      <span className="inline-flex h-3 w-3 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400" />
                                      <span className="text-xs text-blue-600">Uploading...</span>
                                    </>
                                  )}
                                  {file.status === "success" && (
                                    <>
                                      <svg
                                        className="h-3 w-3 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                      <span className="text-xs text-green-600">Uploaded</span>
                                    </>
                                  )}
                                  {file.status === "error" && (
                                    <>
                                      <svg
                                        className="h-3 w-3 text-rose-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M6 18L18 6M6 6l12 12"
                                        />
                                      </svg>
                                      <span className="text-xs text-rose-600">Upload failed</span>
                                      {file.file && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            // Remove failed file and retry upload
                                            handleRemoveFile(item._id, file.id);
                                            setTimeout(() => {
                                              handleUpload(file.file, item._id);
                                            }, 100);
                                          }}
                                          className="ml-2 text-xs text-indigo-600 hover:text-indigo-700 underline"
                                        >
                                          Retry
                                        </button>
                                      )}
                                    </>
                                  )}
                                  {file.file?.size && (
                                    <span className="text-xs text-slate-500">
                                      • {formatFileSize(file.file.size)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Remove Button - Only show for files that are not successfully uploaded */}
                              {file.status !== "success" && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(item._id, file.id)}
                                  className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-rose-600"
                                  title="Remove file"
                                >
                                  <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-3">
                        <div className="relative upload-menu-container">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveUploadMenu(
                                activeUploadMenu === item._id ? null : item._id
                              )
                            }
                            disabled={isUploading}
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUploading ? (
                              <>
                                <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Uploading...
                              </>
                            ) : hasSuccessfulUploads ? (
                              <>
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                  />
                                </svg>
                                Upload New
                              </>
                            ) : (
                              <>
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                  />
                                </svg>
                                Upload
                              </>
                            )}
                          </button>
                          {activeUploadMenu === item._id && (
                            <div className="absolute top-full left-0 z-50 mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-lg">
                              <button
                                type="button"
                                onClick={() => handleImageUpload(item._id, false)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50 first:rounded-t-2xl"
                              >
                                <svg
                                  className="h-5 w-5 text-slate-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span>Choose Gallery</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleImageUpload(item._id, true)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50"
                              >
                                <svg
                                  className="h-5 w-5 text-slate-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span>Take Photo</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFileUpload(item._id)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-900 transition hover:bg-slate-50 last:rounded-b-2xl"
                              >
                                <svg
                                  className="h-5 w-5 text-slate-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                  />
                                </svg>
                                <span>File Upload</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Next Button */}
          <div className="border-t border-slate-200 bg-white px-8 py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                {!allRequiredUploaded && progress.total > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                      Upload Progress: {progress.uploaded} of {progress.total} required documents
                    </p>
                    <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${(progress.uploaded / progress.total) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      Please upload all required documents to continue.
                    </p>
                  </div>
                ) : allRequiredUploaded ? (
                  <p className="text-sm font-medium text-green-600">
                    ✓ All required documents uploaded
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleNext}
                disabled={!allRequiredUploaded}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-indigo-600"
              >
                <span>Next</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {cameraModal.show && (
        <CameraModal
          fieldName={cameraModal.itemId}
          stream={cameraModal.stream}
          onCapture={handleCameraCapture}
          onClose={() => {
            if (cameraModal.stream) {
              cameraModal.stream.getTracks().forEach((track) => {
                track.stop();
              });
            }
            setCameraModal({ show: false, itemId: null, stream: null });
          }}
        />
      )}

      {/* Crop Modal */}
      {cropModal.show && (
        <ImageCropModal
          imageSrc={cropModal.imageSrc}
          onCrop={handleCropComplete}
          onClose={() =>
            setCropModal({ show: false, imageSrc: null, itemId: null })
          }
        />
      )}

      {/* Document Preview Modal */}
      {previewModal.show && previewModal.file && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewModal({ show: false, file: null })}
        >
          <div
            className="relative w-full max-w-6xl rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Document Preview
                </h3>
                <p className="text-sm text-slate-600 truncate max-w-md">
                  {previewModal.file.name}
                </p>
              </div>
              <button
                onClick={() => setPreviewModal({ show: false, file: null })}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Preview Content */}
            <div className="p-6">
              <div className="relative mx-auto max-h-[70vh] overflow-auto rounded-xl bg-slate-900">
                {previewModal.file.url &&
                (previewModal.file.url.startsWith("data:image") ||
                  previewModal.file.url.startsWith("blob:") ||
                  previewModal.file.url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) ||
                  previewModal.file.name?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)) ? (
                  <img
                    src={previewModal.file.url}
                    alt={previewModal.file.name}
                    className="mx-auto max-h-[70vh] w-auto object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "flex";
                    }}
                  />
                ) : previewModal.file.url?.match(/\.(pdf)$/i) ||
                  previewModal.file.name?.match(/\.(pdf)$/i) ? (
                  <iframe
                    src={previewModal.file.url}
                    className="h-[70vh] w-full"
                    title={previewModal.file.name}
                  />
                ) : (
                  <div className="flex h-[70vh] flex-col items-center justify-center p-8 text-center">
                    <svg
                      className="h-16 w-16 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="mt-4 text-sm font-medium text-slate-600">
                      Preview not available for this file type
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {previewModal.file.name}
                    </p>
                    {previewModal.file.url && (
                      <a
                        href={previewModal.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        Open in new tab
                      </a>
                    )}
                  </div>
                )}
                {/* Fallback for image errors */}
                <div
                  className="hidden h-[70vh] flex-col items-center justify-center p-8 text-center"
                  style={{ display: "none" }}
                >
                  <svg
                    className="h-16 w-16 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <p className="mt-4 text-sm font-medium text-slate-600">
                    Unable to load preview
                  </p>
                  {previewModal.file.url && (
                    <a
                      href={previewModal.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                    >
                      Open in new tab
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default ChecklistModal;
