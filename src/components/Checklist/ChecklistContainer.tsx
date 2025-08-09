"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { ChecklistContainerProps, PreWorkChecklist, ChecklistItem, ChecklistSection as ChecklistSectionType, ExportData, ComplianceReport } from '../../types';
import { CLEANING_PREWORK_TEMPLATE, calculateProgress } from '../../data/presetChecklists';
import ChecklistSection from './ChecklistSection';
import ProgressBar from './ProgressBar';
import EnhancedProgressBar from '../Progress/EnhancedProgressBar';
import ComplianceChecker from '../Compliance/ComplianceChecker';
import PDFExport from '../Export/PDFExport';
import MediaCapture from '../Media/MediaCapture';
import AddItemForm from './AddItemForm';
import AddSectionForm from './AddSectionForm';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

const ChecklistContainer: React.FC<ChecklistContainerProps> = ({ 
  initialChecklist, 
  onSave, 
  onExport 
}) => {
  const [checklist, setChecklist] = useState<PreWorkChecklist>(
    initialChecklist || CLEANING_PREWORK_TEMPLATE
  );
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportData, setExportData] = useState<string>('');
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [showEnhancedProgress, setShowEnhancedProgress] = useState(true);
  const [showComplianceDetails, setShowComplianceDetails] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');

  // Auto-save to localStorage
  useEffect(() => {
    const saveToStorage = () => {
      try {
        localStorage.setItem('prework-checklist', JSON.stringify(checklist));
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    };

    const timeoutId = setTimeout(saveToStorage, 1000); // Debounced save
    return () => clearTimeout(timeoutId);
  }, [checklist]);

  // Load from localStorage on mount
  useEffect(() => {
    if (!initialChecklist) {
      try {
        const saved = localStorage.getItem('prework-checklist');
        if (saved) {
          const parsedChecklist = JSON.parse(saved);
          setChecklist(parsedChecklist);
        }
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
      }
    }
  }, [initialChecklist]);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateChecklist = useCallback((updates: Partial<PreWorkChecklist>) => {
    setChecklist(prev => {
      const updated = { ...prev, ...updates, lastModified: new Date() };
      
      // Recalculate progress and completion status
      const progress = calculateProgress(updated);
      updated.progress = progress.percentage;
      updated.isCompleted = progress.percentage === 100;
      
      if (onSave) {
        onSave(updated);
      }
      
      return updated;
    });
  }, [onSave]);

  const handleToggleSection = useCallback((sectionId: string) => {
    const updatedSections = checklist.sections.map(section =>
      section.id === sectionId
        ? { ...section, isCollapsed: !section.isCollapsed }
        : section
    );
    updateChecklist({ sections: updatedSections });
  }, [checklist.sections, updateChecklist]);

  const handleUpdateItem = useCallback((sectionId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    const updatedSections = checklist.sections.map(section => {
      if (section.id === sectionId) {
        const updatedItems = section.items.map(item =>
          item.id === itemId ? { ...item, ...updates } : item
        );
        const completedCount = updatedItems.filter(item => item.isCompleted).length;
        return {
          ...section,
          items: updatedItems,
          completedCount,
        };
      }
      return section;
    });
    updateChecklist({ sections: updatedSections });
  }, [checklist.sections, updateChecklist]);

  const handleToggleComplete = useCallback((sectionId: string, itemId: string) => {
    const section = checklist.sections.find(s => s.id === sectionId);
    const item = section?.items.find(i => i.id === itemId);
    
    if (item) {
      const updates: Partial<ChecklistItem> = {
        isCompleted: !item.isCompleted,
        completedAt: !item.isCompleted ? new Date() : undefined
      };
      handleUpdateItem(sectionId, itemId, updates);
    }
  }, [checklist.sections, handleUpdateItem]);

  // Generate unique ID for new items/sections
  const generateId = () => `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleAddSection = useCallback((newSection: Omit<ChecklistSectionType, 'id'>) => {
    const sectionWithId: ChecklistSectionType = {
      ...newSection,
      id: generateId()
    };
    
    const updatedSections = [...checklist.sections, sectionWithId].sort((a, b) => a.order - b.order);
    updateChecklist({ sections: updatedSections });
  }, [checklist.sections, updateChecklist]);

  const handleAddItem = useCallback((sectionId: string, newItem: Omit<ChecklistItem, 'id'>) => {
    const itemWithId: ChecklistItem = {
      ...newItem,
      id: generateId()
    };

    const updatedSections = checklist.sections.map(section => {
      if (section.id === sectionId) {
        const updatedItems = [...section.items, itemWithId];
        return {
          ...section,
          items: updatedItems,
          totalCount: updatedItems.length
        };
      }
      return section;
    });
    
    updateChecklist({ sections: updatedSections });
  }, [checklist.sections, updateChecklist]);

  const openAddItemModal = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);
    setIsAddItemModalOpen(true);
  }, []);

  const handleAddItemSubmit = useCallback((item: Omit<ChecklistItem, 'id'>) => {
    if (selectedSectionId) {
      handleAddItem(selectedSectionId, item);
    }
  }, [selectedSectionId, handleAddItem]);

  const handleReset = () => {
    const resetChecklist = {
      ...CLEANING_PREWORK_TEMPLATE,
      id: `checklist-${Date.now()}`,
      createdAt: new Date(),
      lastModified: new Date()
    };
    setChecklist(resetChecklist);
    scrollToTop();
  };

  const handleExport = () => {
    const exportData: ExportData = {
      checklist,
      exportedAt: new Date(),
      version: '1.0.0',
      exportedBy: 'current_user', // TODO: Replace with actual user ID
      format: 'json',
      includeImages: true,
      includeNotes: true,
      includeTimestamps: true
    };
    
    const jsonData = JSON.stringify(exportData, null, 2);
    setExportData(jsonData);
    setIsExportModalOpen(true);
    
    if (onExport) {
      onExport(exportData);
    }
  };

  // Enhanced export handler for PDF/Email/Link formats
  const handleAdvancedExport = useCallback((format: 'pdf' | 'email' | 'web_link', options: any) => {
    console.log(`Exporting as ${format}:`, options);
    
    // In a real implementation, this would handle different export formats
    if (format === 'pdf') {
      // Generate PDF
      alert('PDF export would be implemented here');
    } else if (format === 'email') {
      // Send email
      alert('Email export would be implemented here');
    } else if (format === 'web_link') {
      // Generate shareable link
      alert('Web link generation would be implemented here');
    }
    
    if (onExport) {
      const exportDataObj: ExportData = {
        checklist,
        exportedAt: new Date(),
        format: 'json',
        version: '1.0',
        exportedBy: 'current_user',
        includeImages: true,
        includeNotes: true,
        includeTimestamps: true
      };
      onExport(exportDataObj);
    }
  }, [checklist, onExport]);

  const downloadJson = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prework-checklist-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportData);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const progress = calculateProgress(checklist);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {checklist.title}
            </h1>
            <p className="text-gray-600 mt-2">
              {checklist.description}
            </p>
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              <span>Created: {new Date(checklist.createdAt).toLocaleDateString()}</span>
              <span>Modified: {new Date(checklist.lastModified).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <Button 
              variant="success" 
              onClick={() => setIsAddSectionModalOpen(true)}
              size="sm"
            >
              + Add Section
            </Button>
            <Button variant="outline" onClick={scrollToTop}>
              ↑ Top
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="primary" onClick={handleExport}>
              Export JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Overall Progress
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEnhancedProgress(!showEnhancedProgress)}
          >
            {showEnhancedProgress ? 'Simple View' : 'Enhanced View'}
          </Button>
        </div>
        
        {showEnhancedProgress ? (
          <EnhancedProgressBar 
            progress={progress} 
            checklist={checklist}
            compliance={complianceReport || undefined}
            showDetails={true}
            onComplianceClick={() => setShowComplianceDetails(true)}
          />
        ) : (
          <ProgressBar progress={progress} />
        )}
      </div>

      {/* Compliance & Export Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Compliance Status
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComplianceDetails(!showComplianceDetails)}
            >
              {showComplianceDetails ? 'Hide Details' : 'View Details'}
            </Button>
          </div>
          
          <ComplianceChecker
            checklist={checklist}
            onComplianceUpdate={setComplianceReport}
            autoCheck={true}
            showDetails={showComplianceDetails}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Export & Share
          </h3>
          <div className="space-y-3">
            <PDFExport
              checklist={checklist}
              exportData={exportData ? JSON.parse(exportData) : undefined}
              onExport={handleAdvancedExport}
            />
            <Button
              variant="outline"
              onClick={handleExport}
              className="w-full"
            >
              Export as JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="space-y-6">
        {checklist.sections.map((section) => (
          <ChecklistSection
            key={section.id}
            section={section}
            onToggleSection={handleToggleSection}
            onUpdateItem={handleUpdateItem}
            onToggleComplete={handleToggleComplete}
            onAddItem={openAddItemModal}
          />
        ))}
      </div>

      {/* Completion Banner */}
      {checklist.isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-16 h-16 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">
            🎉 Checklist Complete!
          </h3>
          <p className="text-green-700">
            All tasks have been completed successfully. Great work!
          </p>
          {checklist.completedAt && (
            <p className="text-green-600 text-sm mt-2">
              Completed on: {new Date(checklist.completedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Export Modal */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Checklist Data"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Your checklist data has been exported as JSON. You can download it or copy to clipboard.
          </p>
          
          <div className="flex space-x-3">
            <Button variant="primary" onClick={downloadJson}>
              Download JSON
            </Button>
            <Button variant="outline" onClick={copyToClipboard}>
              Copy to Clipboard
            </Button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JSON Data:
            </label>
            <textarea
              value={exportData}
              readOnly
              className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm"
            />
          </div>
        </div>
      </Modal>

      {/* GitHub Integration Badge */}
      <div className="fixed bottom-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('https://github.com', '_blank')}
          className="shadow-lg"
        >
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
          </svg>
          GitHub
        </Button>
      </div>

      {/* Custom Forms */}
      <AddSectionForm
        isOpen={isAddSectionModalOpen}
        onClose={() => setIsAddSectionModalOpen(false)}
        onAddSection={handleAddSection}
      />

      <AddItemForm
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAddItem={handleAddItemSubmit}
        sectionId={selectedSectionId}
      />
    </div>
  );
};

export default ChecklistContainer;