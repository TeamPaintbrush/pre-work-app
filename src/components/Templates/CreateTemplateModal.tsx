'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChecklistTemplate, TemplateCategory, TemplateSectionDefinition, TemplateItemDefinition } from '../../types';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: ChecklistTemplate) => void;
  categories: TemplateCategory[];
  editingTemplate?: ChecklistTemplate | null;
}

const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingTemplate = null
}) => {
  const [formData, setFormData] = useState({
    name: editingTemplate?.name || '',
    description: editingTemplate?.description || '',
    categoryId: editingTemplate?.category.id || categories[0]?.id || '',
    difficulty: editingTemplate?.difficulty || 'medium' as 'easy' | 'medium' | 'hard',
    estimatedDuration: editingTemplate?.estimatedDuration || 60,
    tags: editingTemplate?.tags?.join(', ') || '',
    requiredSkills: editingTemplate?.requiredSkills?.join(', ') || ''
  });

  const [sections, setSections] = useState<TemplateSectionDefinition[]>(
    editingTemplate?.sections || []
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Template description is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (formData.estimatedDuration < 1) {
      newErrors.estimatedDuration = 'Duration must be at least 1 minute';
    }

    if (sections.length === 0) {
      newErrors.sections = 'At least one section is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const selectedCategory = categories.find(cat => cat.id === formData.categoryId);
    if (!selectedCategory) return;

    const template: ChecklistTemplate = {
      id: editingTemplate?.id || `custom-template-${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: selectedCategory,
      version: editingTemplate?.version || '1.0',
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      isBuiltIn: false,
      createdBy: 'current-user', // Replace with actual user ID
      createdAt: editingTemplate?.createdAt || new Date(),
      lastModified: new Date(),
      sections,
      estimatedDuration: formData.estimatedDuration,
      difficulty: formData.difficulty,
      requiredSkills: formData.requiredSkills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
    };

    onSave(template);
  };

  const addSection = () => {
    const newSection: TemplateSectionDefinition = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: '',
      isOptional: false,
      order: sections.length + 1,
      items: [],
      preConditions: []
    };

    setSections([...sections, newSection]);
  };

  const updateSection = (sectionId: string, updates: Partial<TemplateSectionDefinition>) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const addItemToSection = (sectionId: string) => {
    const newItem: TemplateItemDefinition = {
      id: `item-${Date.now()}`,
      title: 'New Item',
      description: '',
      isRequired: true,
      isOptional: false,
      order: 1,
      estimatedTime: 15,
      requiresPhoto: false,
      requiresNotes: false,
      tags: [],
      preConditions: []
    };

    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: [...section.items, { ...newItem, order: section.items.length + 1 }]
        };
      }
      return section;
    }));
  };

  const updateItem = (sectionId: string, itemId: string, updates: Partial<TemplateItemDefinition>) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map(item => 
            item.id === itemId ? { ...item, ...updates } : item
          )
        };
      }
      return section;
    }));
  };

  const removeItem = (sectionId: string, itemId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.filter(item => item.id !== itemId)
        };
      }
      return section;
    }));
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingTemplate ? 'Edit Template' : 'Create New Template'}
      className="max-w-4xl"
    >
      <div className="p-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter template name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimated Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({...formData, estimatedDuration: parseInt(e.target.value) || 60})}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white ${
                  errors.estimatedDuration ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.estimatedDuration && <p className="text-red-500 text-sm mt-1">{errors.estimatedDuration}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white ${
                errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              placeholder="Describe what this template is for"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="e.g., cleaning, maintenance, safety"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Required Skills (comma-separated)
              </label>
              <input
                type="text"
                value={formData.requiredSkills}
                onChange={(e) => setFormData({...formData, requiredSkills: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                placeholder="e.g., Basic photography, Safety awareness"
              />
            </div>
          </div>

          {/* Sections */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sections ({sections.length})
              </h3>
              <Button onClick={addSection} size="sm">
                + Add Section
              </Button>
            </div>

            {errors.sections && <p className="text-red-500 text-sm mb-4">{errors.sections}</p>}

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sections.map((section, sectionIndex) => (
                <div key={section.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      className="text-lg font-semibold bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white"
                      placeholder="Section title"
                    />
                    <Button
                      onClick={() => removeSection(section.id)}
                      variant="secondary"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  </div>

                  <textarea
                    value={section.description}
                    onChange={(e) => updateSection(section.id, { description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white mb-3"
                    placeholder="Section description"
                  />

                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={section.isOptional}
                        onChange={(e) => updateSection(section.id, { isOptional: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Optional section</span>
                    </label>

                    <Button
                      onClick={() => addItemToSection(section.id)}
                      size="sm"
                      variant="secondary"
                    >
                      + Add Item
                    </Button>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateItem(section.id, item.id, { title: e.target.value })}
                            className="font-medium bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white"
                            placeholder="Item title"
                          />
                          <Button
                            onClick={() => removeItem(section.id, item.id)}
                            variant="secondary"
                            size="sm"
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            Remove
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.isRequired}
                              onChange={(e) => updateItem(section.id, item.id, { 
                                isRequired: e.target.checked,
                                isOptional: !e.target.checked
                              })}
                              className="rounded"
                            />
                            <span className="text-gray-700 dark:text-gray-300">Required</span>
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.requiresPhoto}
                              onChange={(e) => updateItem(section.id, item.id, { requiresPhoto: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-gray-700 dark:text-gray-300">Requires Photo</span>
                          </label>

                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.requiresNotes}
                              onChange={(e) => updateItem(section.id, item.id, { requiresNotes: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-gray-700 dark:text-gray-300">Requires Notes</span>
                          </label>

                          <div>
                            <input
                              type="number"
                              min="1"
                              value={item.estimatedTime}
                              onChange={(e) => updateItem(section.id, item.id, { estimatedTime: parseInt(e.target.value) || 15 })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                              placeholder="Minutes"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {section.items.length === 0 && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm italic text-center py-2">
                        No items in this section yet
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {sections.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8 italic">
                  No sections created yet. Add a section to get started.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editingTemplate ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateTemplateModal;
