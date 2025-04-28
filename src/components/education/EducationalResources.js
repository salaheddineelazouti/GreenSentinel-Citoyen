import React, { useState, useEffect } from 'react';

/**
 * EducationalResources component
 * 
 * Displays educational content about environmental protection,
 * forest preservation, and sustainable practices.
 */
const EducationalResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for educational resources
  // In a real app, this would come from an API
  const mockResources = [
    {
      id: 1,
      title: 'Understanding Forest Ecosystems',
      description: 'Learn about the complex relationships between plants, animals, and microorganisms in forest ecosystems.',
      category: 'ecology',
      type: 'article',
      thumbnail: 'https://via.placeholder.com/150/00933B/FFFFFF?text=Forest',
      readTime: '8 min read',
      difficulty: 'beginner'
    },
    {
      id: 2,
      title: 'Fire Prevention Techniques',
      description: 'Essential knowledge for preventing forest fires and managing fire risks in your area.',
      category: 'safety',
      type: 'video',
      thumbnail: 'https://via.placeholder.com/150/F44336/FFFFFF?text=Fire',
      duration: '12 minutes',
      difficulty: 'beginner'
    },
    {
      id: 3,
      title: 'Identifying Invasive Species',
      description: 'How to recognize and report invasive species that threaten local biodiversity.',
      category: 'conservation',
      type: 'guide',
      thumbnail: 'https://via.placeholder.com/150/9C27B0/FFFFFF?text=Species',
      pages: 15,
      difficulty: 'intermediate'
    },
    {
      id: 4,
      title: 'The Impact of Climate Change on Forests',
      description: 'Understanding how climate change affects forest health and biodiversity.',
      category: 'ecology',
      type: 'article',
      thumbnail: 'https://via.placeholder.com/150/3F51B5/FFFFFF?text=Climate',
      readTime: '15 min read',
      difficulty: 'advanced'
    },
    {
      id: 5,
      title: 'Sustainable Forestry Practices',
      description: 'An overview of sustainable timber harvesting and forest management techniques.',
      category: 'conservation',
      type: 'video',
      thumbnail: 'https://via.placeholder.com/150/795548/FFFFFF?text=Forestry',
      duration: '20 minutes',
      difficulty: 'intermediate'
    },
    {
      id: 6,
      title: 'Water Conservation in Forest Areas',
      description: 'Protecting water resources and understanding the role of forests in water cycles.',
      category: 'conservation',
      type: 'guide',
      thumbnail: 'https://via.placeholder.com/150/03A9F4/FFFFFF?text=Water',
      pages: 10,
      difficulty: 'beginner'
    },
    {
      id: 7,
      title: 'Wilderness First Aid',
      description: 'Essential first aid skills for outdoor emergencies when exploring forests.',
      category: 'safety',
      type: 'course',
      thumbnail: 'https://via.placeholder.com/150/F44336/FFFFFF?text=FirstAid',
      duration: '1 hour course',
      difficulty: 'intermediate'
    },
    {
      id: 8,
      title: 'Local Wildlife Identification',
      description: 'Learn to identify common animal species in your local forests and their ecological importance.',
      category: 'ecology',
      type: 'guide',
      thumbnail: 'https://via.placeholder.com/150/FFC107/FFFFFF?text=Wildlife',
      pages: 25,
      difficulty: 'intermediate'
    }
  ];

  // Categories for filter tabs
  const categories = [
    { id: 'all', name: 'All Resources' },
    { id: 'ecology', name: 'Ecology' },
    { id: 'conservation', name: 'Conservation' },
    { id: 'safety', name: 'Safety' }
  ];

  // Load resources on component mount
  useEffect(() => {
    // Simulate API call with timeout
    const loadResources = () => {
      setLoading(true);
      setTimeout(() => {
        setResources(mockResources);
        setLoading(false);
      }, 1000);
    };

    loadResources();
  }, []);

  // Filter resources based on active category and search query
  const filteredResources = resources.filter(resource => {
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Get icon for resource type
  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'article':
        return '📄';
      case 'video':
        return '📹';
      case 'guide':
        return '📚';
      case 'course':
        return '🎓';
      default:
        return '📄';
    }
  };

  // Get color class based on difficulty
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="educational-resources-container">
      <h2 className="text-2xl font-bold text-green-700 mb-4">Educational Resources</h2>
      
      {/* Search bar */}
      <div className="search-bar mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute right-3 top-2 text-gray-400">
            🔍
          </span>
        </div>
      </div>
      
      {/* Category tabs */}
      <div className="category-tabs mb-6">
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${
                activeCategory === category.id 
                  ? 'bg-green-600 text-white' 
                  : 'bg-transparent text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}
      
      {/* Resources list */}
      {!loading && filteredResources.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No resources found matching your criteria.</p>
        </div>
      )}
      
      {!loading && filteredResources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(resource => (
            <div key={resource.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:transform hover:scale-102">
              {/* Resource thumbnail */}
              <div className="h-40 bg-gray-300 relative">
                <img 
                  src={resource.thumbnail} 
                  alt={resource.title} 
                  className="w-full h-full object-cover"
                />
                
                {/* Resource type badge */}
                <div className="absolute top-2 right-2 bg-white bg-opacity-90 text-gray-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                  <span className="mr-1">{getResourceTypeIcon(resource.type)}</span>
                  <span className="capitalize">{resource.type}</span>
                </div>
              </div>
              
              {/* Resource details */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{resource.title}</h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {resource.description}
                </p>
                
                <div className="flex flex-wrap items-center mt-3 space-x-2">
                  {/* Difficulty badge */}
                  <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(resource.difficulty)} capitalize`}>
                    {resource.difficulty}
                  </span>
                  
                  {/* Duration or length */}
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                    {resource.readTime || resource.duration || `${resource.pages} pages`}
                  </span>
                </div>
                
                <button 
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium text-sm"
                >
                  View Resource
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Resource preview modal would go here in a full implementation */}
    </div>
  );
};

export default EducationalResources;
