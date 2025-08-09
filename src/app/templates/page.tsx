'use client';

import React, { useState } from 'react';
import { ChecklistTemplate, TemplateCategory } from '../../types';
import { TEMPLATE_CATEGORIES, PRESET_TEMPLATES } from '../../data/presetChecklists';

const TemplatesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'duration' | 'difficulty'>('name');

  // Get templates for selected category or all templates
  const getFilteredTemplates = () => {
    let templates = selectedCategory 
      ? PRESET_TEMPLATES.filter(template => template.category.id === selectedCategory.id)
      : PRESET_TEMPLATES;

    // Apply search filter
    if (searchTerm) {
      templates = templates.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      templates = templates.filter(template => template.difficulty === difficultyFilter);
    }

    // Apply sorting
    templates.sort((a, b) => {
      switch (sortBy) {
        case 'duration':
          return (a.estimatedDuration || 0) - (b.estimatedDuration || 0);
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return difficultyOrder[a.difficulty || 'medium'] - difficultyOrder[b.difficulty || 'medium'];
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return templates;
  };

  const handleUseTemplate = (template: ChecklistTemplate) => {
    // Show detailed template information
    const itemCount = template.sections.reduce((total, section) => total + section.items.length, 0);
    const message = `✅ Template Selected: ${template.name}

📝 Description: ${template.description}

📊 Details:
• ${template.sections.length} sections
• ${itemCount} total items
• ${template.estimatedDuration} minutes estimated
• Difficulty: ${template.difficulty}
• Tags: ${template.tags.join(', ')}

🔧 Required Skills: ${template.requiredSkills?.join(', ') || 'None specified'}

This template is now ready to use! In a full implementation, this would:
1. Navigate to the checklist creation page
2. Pre-populate with template structure
3. Allow customization before starting
4. Save as a new checklist instance`;

    alert(message);
    
    // Here you would typically navigate to create a checklist from this template
    // For example: router.push(`/checklists/create?template=${template.id}`);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedTemplate(null);
    setSearchTerm('');
  };

  const handleBackToTemplates = () => {
    setSelectedTemplate(null);
  };

  if (selectedTemplate) {
    // Template Detail View
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToTemplates}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to Templates</span>
                </button>
                <div className="h-6 border-l border-gray-300 dark:border-gray-600"></div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTemplate.name}</h1>
              </div>
              <button
                onClick={() => handleUseTemplate(selectedTemplate)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>

        {/* Template Details */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Template Info */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Template Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</span>
                    <p className="text-gray-900 dark:text-white mt-1">{selectedTemplate.description}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</span>
                    <p className="text-gray-900 dark:text-white mt-1">{selectedTemplate.category.name}</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated Duration</span>
                    <p className="text-gray-900 dark:text-white mt-1">{selectedTemplate.estimatedDuration} minutes</p>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Difficulty</span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      selectedTemplate.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      selectedTemplate.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedTemplate.difficulty}
                    </span>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Required Skills</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTemplate.requiredSkills?.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTemplate.tags?.map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Content */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Checklist Items</h3>
                
                <div className="space-y-6">
                  {selectedTemplate.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border-l-4 border-blue-200 dark:border-blue-600 pl-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">{section.title}</h4>
                      <div className="space-y-2">
                        {section.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-500 rounded mt-0.5"></div>
                            <div className="flex-1">
                              <p className="text-gray-900 dark:text-white">{item.title}</p>
                              {item.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                              )}
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {item.tags.map((tag, tagIndex) => (
                                    <span key={tagIndex} className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-xs px-2 py-0.5 rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedCategory) {
    // Category Template List View
    const filteredTemplates = getFilteredTemplates();

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToCategories}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to Categories</span>
                </button>
                <div className="h-6 border-l border-gray-300 dark:border-gray-600"></div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCategory.name}</h1>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value as 'all' | 'easy' | 'medium' | 'hard')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'duration' | 'difficulty')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="name">Sort by Name</option>
                <option value="duration">Sort by Duration</option>
                <option value="difficulty">Sort by Difficulty</option>
              </select>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{template.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    template.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {template.difficulty}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{template.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>{template.sections.length} sections</span>
                  <span>{template.sections.reduce((acc, section) => acc + section.items.length, 0)} items</span>
                  <span>{template.estimatedDuration}m</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {template.requiredSkills?.slice(0, 2).map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded">
                      {skill}
                    </span>
                  ))}
                  {(template.requiredSkills?.length || 0) > 2 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">+{(template.requiredSkills?.length || 0) - 2} more</span>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseTemplate(template);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Use Template
                </button>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Category Grid View
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Templates</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Choose from professional templates or create your own</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATE_CATEGORIES.filter(cat => cat.isActive).map((category) => {
            const categoryTemplates = PRESET_TEMPLATES.filter(template => 
              template.category.id === category.id
            );
            
            return (
              <div
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-2xl">{category.icon}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{categoryTemplates.length} templates</p>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{category.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">View Templates →</span>
                  <div className="flex -space-x-1">
                    {categoryTemplates.slice(0, 3).map((template) => (
                      <div key={template.id} className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white font-medium ${
                        template.difficulty === 'easy' ? 'bg-green-500' :
                        template.difficulty === 'medium' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}>
                        {template.name.charAt(0)}
                      </div>
                    ))}
                    {categoryTemplates.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 text-xs flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium">
                        +{categoryTemplates.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;
