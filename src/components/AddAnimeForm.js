import React, { useState, useEffect } from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';

const AddAnimeForm = ({ anime, onSubmit, onCancel, maxEpisodes = null, isAiring = true }) => {
  const [formData, setFormData] = useState({
    status: '',
    epWatch: 0,
    score: '',
    start: '',
    finish: ''
  });

  const statusOptions = [
    { value: 'Watching', label: 'Watching' },
    ...(isAiring ? [{ value: 'Completed', label: 'Completed' }] : []),
    { value: 'Plan to Watch', label: 'Plan to Watch' }
  ];

  const scoreOptions = [
    { value: '10', label: '10' },
    { value: '9', label: '9' },
    { value: '8', label: '8' },
    { value: '7', label: '7' },
    { value: '6', label: '6' },
    { value: '5', label: '5' },
    { value: '4', label: '4' },
    { value: '3', label: '3' },
    { value: '2', label: '2' },
    { value: '1', label: '1' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title: anime,
      ...formData
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    if (formData.status === 'Completed' && maxEpisodes) {
      setFormData(prev => ({
        ...prev,
        epWatch: maxEpisodes
      }));
    }
  }, [formData.status, maxEpisodes]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <p className="text-gray-300 text-sm">
          Title: <span className="text-cyan-400 font-semibold">"{anime}"</span>
        </p>
      </div>

      <Select
        label="Status"
        value={formData.status}
        onChange={(e) => handleInputChange('status', e.target.value)}
        options={statusOptions}
        placeholder="Select Status"
      />

      <Input
        type="number"
        label="Episodes Watched"
        value={formData.epWatch}
        onChange={(e) => handleInputChange('epWatch', Math.max(0, parseInt(e.target.value) || 0))}
        placeholder="0"
        disabled={formData.status === 'Completed' && maxEpisodes}
      />

      <Select
        label="Score"
        value={formData.score}
        onChange={(e) => handleInputChange('score', e.target.value)}
        options={scoreOptions}
        placeholder="Select Score"
      />

      <Input
        type="date"
        label="Start Date"
        value={formData.start}
        onChange={(e) => handleInputChange('start', e.target.value)}
      />

      <Input
        type="date"
        label="Finish Date"
        value={formData.finish}
        onChange={(e) => handleInputChange('finish', e.target.value)}
      />

      <div className="flex space-x-3 pt-4">
        <Button 
          type="submit"
          fullWidth
        >
          Add Anime
        </Button>
        <Button 
          type="button"
          variant="secondary"
          onClick={onCancel}
          fullWidth
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default AddAnimeForm; 