'use client';

import React from 'react';
import TemplateGallery from '../../components/Templates/TemplateGallery';
import { ChecklistTemplate } from '../../types';

const TemplatesPage = () => {
  const handleSelectTemplate = (template: ChecklistTemplate) => {
    console.log('Selected template:', template);
    // Here you would typically navigate to create a checklist from this template
    // or open a modal to configure the template before creating a checklist
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <TemplateGallery 
          onSelectTemplate={handleSelectTemplate}
          userRole="manager" // Change to 'worker', 'manager', or 'admin' to test different roles
        />
      </div>
    </div>
  );
};

export default TemplatesPage;
