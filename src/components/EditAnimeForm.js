import React, { useState, useEffect } from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';

const EditAnimeForm = ({ anime, onSubmit, onCancel, onDelete, maxEpisodes = null }) => {
  const [formData, setFormData] = useState({
    status: '',
    epWatch: 0,
    start: '',
    finish: ''
  });

  useEffect(() => {
    if (anime) {
      setFormData({
        status: anime.status || '',
        epWatch: anime.epWatch || 0,
        start: anime.start || '',
        finish: anime.finish || ''
      });
    }
  }, [anime]);

  useEffect(() => {
    if (formData.status === 'Completed' && maxEpisodes) {
      setFormData(prev => ({
        ...prev,
        epWatch: maxEpisodes
      }));
    }
  }, [formData.status, maxEpisodes]);

  const statusOptions = [
    { value: 'Watching', label: 'Watching' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Plan to Watch', label: 'Plan to Watch' }
  ];

  // Removed score options

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!anime) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto bg-[#161b22] rounded-2xl border-2 border-green-500 p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-green-400 text-center mb-2">Edit Anime</h2>
      <p className="text-green-300 text-center mb-4">{anime.title}</p>
      <Select
        label="Status"
        value={formData.status}
        onChange={(e) => handleInputChange('status', e.target.value)}
        options={statusOptions}
        placeholder="Select Status"
        className="border-green-500 text-green-300 bg-transparent"
      />
      <Input
        type="number"
        label="Episodes Watched"
        value={formData.epWatch}
        onChange={(e) => handleInputChange('epWatch', Math.max(0, parseInt(e.target.value) || 0))}
        placeholder="0"
        className="border-green-500 text-green-300 bg-transparent"
      />
      <Input
        type="date"
        label="Start Date"
        value={formData.start}
        onChange={(e) => handleInputChange('start', e.target.value)}
        className="border-green-500 text-green-300 bg-transparent"
      />
      <Input
        type="date"
        label="Finish Date"
        value={formData.finish}
        onChange={(e) => handleInputChange('finish', e.target.value)}
        className="border-green-500 text-green-300 bg-transparent"
      />
      <div className="flex space-x-3 pt-2">
        <Button 
          type="submit"
          fullWidth
          className="bg-green-700 hover:bg-green-600 text-white font-bold border-2 border-green-400"
        >
          Save Changes
        </Button>
        <Button 
          type="button"
          variant="secondary"
          onClick={onCancel}
          fullWidth
          className="bg-gray-800 hover:bg-gray-700 text-green-300 font-bold border-2 border-green-400"
        >
          Cancel
        </Button>
      </div>
      <div className="pt-2">
        <Button 
          type="button"
          variant="danger"
          onClick={() => onDelete && onDelete(anime.id)}
          fullWidth
          className="bg-red-700 hover:bg-red-600 text-white font-bold border-2 border-red-400"
        >
          Delete Anime
        </Button>
      </div>
    </form>
  );
};

export default EditAnimeForm; 