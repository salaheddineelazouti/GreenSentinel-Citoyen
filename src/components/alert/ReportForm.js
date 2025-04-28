import React, { useState } from 'react';
import { AlertTriangle, Axe, Bug, ThermometerSun, Shield, Leaf, Camera, MapPin } from 'lucide-react';
import PhotoCapture from './PhotoCapture';
import LocationPicker from './LocationPicker';
import IncidentDetails from './IncidentDetails';
import SuccessAnimation from './SuccessAnimation';

const reportTypes = [
  { id: 'fire', icon: AlertTriangle, label: 'Fire', color: 'bg-red-500', points: 50, verificationTime: 2 },
  { id: 'logging', icon: Axe, label: 'Illegal Logging', color: 'bg-orange-500', points: 40, verificationTime: 4 },
  { id: 'disease', icon: Bug, label: 'Tree Disease', color: 'bg-yellow-500', points: 30, verificationTime: 3 },
  { id: 'pollution', icon: ThermometerSun, label: 'Pollution', color: 'bg-purple-500', points: 45, verificationTime: 3 },
  { id: 'hunting', icon: Shield, label: 'Illegal Hunting', color: 'bg-blue-500', points: 40, verificationTime: 4 },
  { id: 'waste', icon: Leaf, label: 'Waste Dumping', color: 'bg-emerald-500', points: 35, verificationTime: 2 }
];

const ReportForm = ({ onSubmit, currentLocation }) => {
  const [step, setStep] = useState(1);
  const [reportType, setReportType] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState(currentLocation || null);
  const [incidentDetails, setIncidentDetails] = useState({
    description: '',
    severity: 'medium',
    area: 'small'
  });
  const [submitted, setSubmitted] = useState(false);

  const handlePhotoCapture = (newPhotos) => {
    setPhotos([...photos, ...newPhotos]);
    setStep(3); // Move to location selection after photo
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
    setStep(4); // Move to details after location
  };

  const handleDetailsSubmit = (details) => {
    setIncidentDetails(details);
    
    // Prepare the complete report data
    const reportData = {
      type: reportType,
      photos: photos,
      location: location,
      ...details,
      timestamp: new Date().toISOString()
    };
    
    // Submit the report
    onSubmit(reportData);
    setSubmitted(true);
    setStep(5); // Move to success screen
  };

  const resetForm = () => {
    setStep(1);
    setReportType(null);
    setPhotos([]);
    setLocation(currentLocation || null);
    setIncidentDetails({
      description: '',
      severity: 'medium',
      area: 'small'
    });
    setSubmitted(false);
  };

  // Type selection screen
  if (step === 1) {
    return (
      <div className="p-4 space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold">Report Issue</h2>
        
        <div className="grid grid-cols-3 gap-3">
          {reportTypes.map(type => (
            <button
              key={type.id}
              onClick={() => {
                setReportType(type.id);
                setStep(2); // Move to photo capture
              }}
              className={`${type.color} text-white p-4 rounded-xl flex flex-col items-center`}
            >
              <type.icon size={24} />
              <span className="text-xs mt-2">{type.label}</span>
              <span className="text-xs mt-1">+{type.points}pts</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Photo capture screen
  if (step === 2) {
    return <PhotoCapture onCapture={handlePhotoCapture} onSkip={() => setStep(3)} />;
  }

  // Location selection screen
  if (step === 3) {
    return <LocationPicker 
      currentLocation={currentLocation} 
      onLocationSelect={handleLocationSelect} 
      onBack={() => setStep(2)} 
    />;
  }

  // Incident details screen
  if (step === 4) {
    return <IncidentDetails 
      initialValues={incidentDetails} 
      onSubmit={handleDetailsSubmit} 
      onBack={() => setStep(3)} 
      reportType={reportType} 
    />;
  }

  // Success screen
  if (step === 5) {
    return <SuccessAnimation onClose={resetForm} reportType={reportType} />;
  }

  // Default fallback
  return null;
};

export default ReportForm;
