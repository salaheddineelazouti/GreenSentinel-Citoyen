import React, { useState, useEffect } from 'react';
import { CheckCircle, Shield, Home } from 'lucide-react';

const SuccessAnimation = ({ onClose, reportType }) => {
  const [showAnimation, setShowAnimation] = useState(true);
  const [points, setPoints] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Determine points based on report type
    let earnedPoints = 30; // Default
    switch (reportType) {
      case 'fire':
        earnedPoints = 50;
        setMessage('Your fire alert will be verified within 2 hours.');
        break;
      case 'logging':
        earnedPoints = 40;
        setMessage('Your illegal logging report will be verified within 4 hours.');
        break;
      case 'disease':
        earnedPoints = 30;
        setMessage('Your tree disease report will be verified within 3 hours.');
        break;
      case 'pollution':
        earnedPoints = 45;
        setMessage('Your pollution report will be verified within 3 hours.');
        break;
      case 'hunting':
        earnedPoints = 40;
        setMessage('Your illegal hunting report will be verified within 4 hours.');
        break;
      case 'waste':
        earnedPoints = 35;
        setMessage('Your waste dumping report will be verified within 2 hours.');
        break;
      default:
        setMessage('Your report will be verified soon.');
    }
    setPoints(earnedPoints);

    // Auto close after 3 seconds
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [reportType]);

  if (!showAnimation) {
    return (
      <div className="p-4 space-y-6 max-w-md mx-auto h-full flex flex-col items-center justify-center">
        <div className="bg-white w-full rounded-xl shadow-lg p-6 text-center">
          <div className="mb-4 flex justify-center">
            <Shield size={56} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You Guardian!</h2>
          <p className="text-gray-600 mb-4">
            Your report has been submitted successfully.
          </p>
          <p className="text-emerald-600 font-medium mb-6">
            {message}
          </p>
          
          <div className="bg-emerald-50 p-4 rounded-xl mb-6">
            <h3 className="font-medium text-emerald-800 mb-1">Reward Pending</h3>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-emerald-600">+{points}</span>
              <span className="text-gray-500">points after verification</span>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-emerald-500 text-white py-3 rounded-xl font-medium flex items-center justify-center"
          >
            <Home size={20} className="mr-2" />
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Initial animation
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={64} className="text-emerald-500 animate-pulse" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Report Submitted!
        </h2>
        <p className="text-gray-600">
          Thank you for contributing to forest protection
        </p>
      </div>
    </div>
  );
};

export default SuccessAnimation;
