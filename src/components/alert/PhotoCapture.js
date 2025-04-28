import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, ArrowLeft, Check, Fire } from 'lucide-react';
import { analyzeImage } from '../../services/media/imageAnalyzer';

const PhotoCapture = ({ onCapture, onSkip }) => {
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [fireDetected, setFireDetected] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup: stop camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, 
        audio: false 
      });
      
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCapturing(true);
      setCameraError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError(`Camera access error: ${err.message}`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob
    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      const photoURL = URL.createObjectURL(blob);
      
      // Add to captured photos
      setCapturedPhotos([...capturedPhotos, { 
        url: photoURL, 
        blob: blob, 
        timestamp: new Date().toISOString() 
      }]);

      // Analyze the image for fire/smoke detection
      setAnalyzing(true);
      try {
        const analysis = await analyzeImage(blob);
        if (analysis.fireDetected || analysis.smokeDetected) {
          setFireDetected(true);
        }
      } catch (error) {
        console.error("Error analyzing image:", error);
      } finally {
        setAnalyzing(false);
      }
      
      // Stop camera after capture
      stopCamera();
    } catch (err) {
      console.error("Error capturing photo:", err);
    }
  };

  const removePhoto = (index) => {
    setCapturedPhotos(capturedPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    onCapture(capturedPhotos);
  };

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={onSkip} className="flex items-center text-gray-600">
          <ArrowLeft size={20} className="mr-1" />
          Back
        </button>
        <h2 className="text-xl font-bold">Capture Photo</h2>
        <button onClick={onSkip} className="text-gray-600">
          Skip
        </button>
      </div>

      {fireDetected && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center mb-4">
          <Fire size={24} className="text-red-500 mr-2" />
          <div>
            <p className="font-bold">Fire detected in image!</p>
            <p className="text-sm">This incident will be prioritized for verification.</p>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-xl mb-4">
          <p>{cameraError}</p>
          <p className="text-sm mt-1">You can still continue without photos.</p>
        </div>
      )}

      <div className="relative">
        {isCapturing ? (
          <div className="relative">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="w-full h-64 object-cover rounded-xl bg-black"
            />
            <button 
              onClick={capturePhoto}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-4 shadow-lg"
            >
              <Camera size={24} className="text-emerald-500" />
            </button>
            <button 
              onClick={stopCamera}
              className="absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center h-64 flex flex-col items-center justify-center">
            {analyzing ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
                <p className="text-gray-600">Analyzing image...</p>
              </div>
            ) : (
              <>
                <Camera size={32} className="text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-4">Take a photo of the incident</p>
                <button 
                  onClick={startCamera}
                  className="bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Camera size={18} className="mr-2" />
                  Start Camera
                </button>
              </>
            )}
          </div>
        )}

        {/* Hidden canvas for processing captured images */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Photo Gallery */}
      {capturedPhotos.length > 0 && (
        <>
          <h3 className="font-medium mt-4">Captured Photos ({capturedPhotos.length})</h3>
          <div className="grid grid-cols-3 gap-2">
            {capturedPhotos.map((photo, index) => (
              <div key={index} className="relative">
                <img 
                  src={photo.url} 
                  alt={`Captured ${index}`} 
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button 
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Continue Button */}
      <div className="pt-4">
        <button
          onClick={handleSubmit}
          disabled={capturedPhotos.length === 0}
          className={`w-full py-3 rounded-xl flex items-center justify-center font-medium ${
            capturedPhotos.length > 0 
              ? 'bg-emerald-500 text-white' 
              : 'bg-gray-200 text-gray-500'
          }`}
        >
          <Check size={20} className="mr-2" />
          Continue with {capturedPhotos.length} photo{capturedPhotos.length !== 1 ? 's' : ''}
        </button>
      </div>
    </div>
  );
};

export default PhotoCapture;
