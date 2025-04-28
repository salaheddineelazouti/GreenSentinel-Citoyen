import React, { useState } from 'react';
import { ArrowLeft, Check, AlertTriangle, Axe, Bug, ThermometerSun, Shield, Leaf } from 'lucide-react';

// Map of report types to their icons and colors
const reportTypeIcons = {
  fire: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100' },
  logging: { icon: Axe, color: 'text-orange-500', bg: 'bg-orange-100' },
  disease: { icon: Bug, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  pollution: { icon: ThermometerSun, color: 'text-purple-500', bg: 'bg-purple-100' },
  hunting: { icon: Shield, color: 'text-blue-500', bg: 'bg-blue-100' },
  waste: { icon: Leaf, color: 'text-emerald-500', bg: 'bg-emerald-100' }
};

// Map of report types to their suggested descriptions
const reportTypeSuggestions = {
  fire: [
    "Visible flames in forested area",
    "Heavy smoke rising from trees",
    "Small brush fire spreading quickly",
    "Lightning strike caused ignition"
  ],
  logging: [
    "Heavy machinery operating in protected area",
    "Trees being cut without visible permits",
    "Trucks carrying freshly cut timber",
    "Large clearing with fresh stumps"
  ],
  disease: [
    "Trees with yellowing/browning leaves",
    "Visible fungi on multiple trees",
    "Tree bark showing unusual patterns/cracks",
    "Dead trees in clusters"
  ],
  pollution: [
    "Chemical dumping near water source",
    "Industrial waste affecting vegetation",
    "Strong chemical smell in natural area",
    "Discolored water in stream/river"
  ],
  hunting: [
    "Traps found in protected area",
    "Hunting activity during off-season",
    "Evidence of poaching (specific animal)",
    "Armed individuals in wildlife sanctuary"
  ],
  waste: [
    "Illegal trash dumping site",
    "Construction debris in natural area",
    "Plastic waste affecting wildlife",
    "Electronic waste in forest/natural area"
  ]
};

const IncidentDetails = ({ initialValues, onSubmit, onBack, reportType }) => {
  const [details, setDetails] = useState({
    description: initialValues?.description || '',
    severity: initialValues?.severity || 'medium',
    area: initialValues?.area || 'small',
    additionalNotes: initialValues?.additionalNotes || ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(details);
  };
  
  const addSuggestion = (suggestion) => {
    setDetails(prev => ({ 
      ...prev, 
      description: prev.description ? `${prev.description}. ${suggestion}` : suggestion 
    }));
  };
  
  // Get icon and color for the current report type
  const reportTypeInfo = reportTypeIcons[reportType] || { 
    icon: AlertTriangle, 
    color: 'text-gray-500',
    bg: 'bg-gray-100'
  };
  const IconComponent = reportTypeInfo.icon;
  
  // Get suggestions for the current report type
  const suggestions = reportTypeSuggestions[reportType] || [];

  return (
    <div className="p-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-gray-600">
          <ArrowLeft size={20} className="mr-1" />
          Back
        </button>
        <h2 className="text-xl font-bold">Incident Details</h2>
        <div className="w-6"></div> {/* Empty div for flex alignment */}
      </div>
      
      {/* Report Type Header */}
      <div className={`${reportTypeInfo.bg} p-4 rounded-xl flex items-center`}>
        <IconComponent size={24} className={`${reportTypeInfo.color} mr-3`} />
        <div>
          <h3 className="font-bold capitalize">{reportType || 'Incident'} Report</h3>
          <p className="text-sm text-gray-600">Please provide detailed information</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={details.description}
            onChange={handleChange}
            required
            className="w-full p-3 border border-gray-300 rounded-xl h-32 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Describe what you observe..."
          />
          
          {/* Suggested descriptions */}
          {suggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-2">Suggested descriptions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => addSuggestion(suggestion)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded-full"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Severity and Area */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity *
            </label>
            <select
              name="severity"
              value={details.severity}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Affected Area *
            </label>
            <select
              name="area"
              value={details.area}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="small">Small (< 100m²)</option>
              <option value="medium">Medium (100-1000m²)</option>
              <option value="large">Large (> 1000m²)</option>
            </select>
          </div>
        </div>
        
        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes (Optional)
          </label>
          <textarea
            name="additionalNotes"
            value={details.additionalNotes}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-xl h-24 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Any other details that might be helpful..."
          />
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-emerald-500 text-white py-4 rounded-xl font-medium flex items-center justify-center"
        >
          <Check size={20} className="mr-2" />
          Submit Report
        </button>
      </form>
    </div>
  );
};

export default IncidentDetails;
