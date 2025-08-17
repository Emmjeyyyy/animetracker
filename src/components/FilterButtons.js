import React from 'react';
import Button from './Button';

const FilterButtons = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { id: '', label: 'All' },
    { id: 'watching', label: 'Watching' },
    { id: 'completed', label: 'Completed' },
    { id: 'plan to watch', label: 'Plan to Watch' }
  ];

  return (
    <div className="flex flex-wrap justify-start gap-3 mb-8">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onCategoryChange(category.id)}
          className="min-w-[100px]"
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
};

export default FilterButtons; 