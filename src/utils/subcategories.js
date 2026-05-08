// Subcategory mapping for all categories
export const subcategories = {
  electricity: {
    name: 'Electricity',
    icon: '⚡',
    subcategories: [
      'Street light not working',
      'No street light in area',
      'Power outage',
      'Loose wiring',
      'Electric pole damage'
    ]
  },
  road: {
    name: 'Road',
    icon: '🛣️',
    subcategories: [
      'Potholes',
      'Road damage',
      'Waterlogging',
      'Blocked road',
      'Uneven pavement'
    ]
  },
  garbage: {
    name: 'Garbage',
    icon: '🗑️',
    subcategories: [
      'Garbage not collected',
      'Overflowing bins',
      'Illegal dumping',
      'Litter on streets',
      'Damaged dustbin'
    ]
  },
  water: {
    name: 'Water & Drainage',
    icon: '💧',
    subcategories: [
      'No water supply',
      'Low water pressure',
      'Drainage clogged',
      'Water leakage',
      'Sewage overflow'
    ]
  },
  sidewalk: {
    name: 'Sidewalk',
    icon: '⚠️',
    subcategories: [
      'Broken sidewalk',
      'Uneven surface',
      'Missing curb',
      'Pothole on sidewalk',
      'Overgrown vegetation'
    ]
  },
  tree: {
    name: 'Trees & Parks',
    icon: '🌳',
    subcategories: [
      'Tree trimming needed',
      'Dead tree',
      'Fallen branches',
      'Park maintenance',
      'Broken bench'
    ]
  },
  traffic: {
    name: 'Traffic',
    icon: '🚦',
    subcategories: [
      'Traffic light broken',
      'Missing traffic sign',
      'Poor road marking',
      'Illegal parking',
      'Traffic congestion'
    ]
  },
  other: {
    name: 'Other',
    icon: '📢',
    subcategories: [
      'Public facility damage',
      'Noise pollution',
      'Animal issues',
      'General complaint'
    ]
  }
};

// Get all categories
export const getCategories = () => {
  return Object.entries(subcategories).map(([key, value]) => ({
    id: key,
    name: value.name,
    icon: value.icon
  }));
};

// Get subcategories for a specific category
export const getSubcategoriesForCategory = (categoryId) => {
  return subcategories[categoryId]?.subcategories || [];
};

// Get category and subcategory details
export const getCategoryDetails = (categoryId) => {
  return subcategories[categoryId] || null;
};
