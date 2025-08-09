'use client';

import React, { useState, useEffect } from 'react';
import SettingsManager, { AppSettings } from '../../components/Settings/SettingsManager';

const defaultSettings: AppSettings = {
  general: {
    defaultView: 'list',
    autoSave: true,
    autoSaveInterval: 5,
    confirmBeforeDelete: true,
    showProgressInTitle: true,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  },
  accessibility: {
    enableScreenReader: false,
    enableKeyboardNavigation: true,
    highContrastMode: false,
    reducedMotion: false,
    fontSize: 'medium',
    focusIndicatorSize: 'medium',
    announceProgressUpdates: true,
    enableSoundNotifications: false
  },
  notifications: {
    enableBrowserNotifications: false,
    enableEmailNotifications: false,
    reminderFrequency: 'never',
    deadlineAlerts: true,
    teamUpdates: true,
    templateSharing: true,
    auditLogChanges: false
  },
  export: {
    defaultFormat: 'PDF',
    includeMedia: true,
    includeTimestamps: true,
    includeComments: true,
    includeAuditLog: false,
    compressionLevel: 'medium'
  },
  privacy: {
    shareUsageData: false,
    shareErrorReports: true,
    enableAnalytics: false,
    dataRetentionPeriod: 365,
    requireConsentForTemplateSharing: true
  },
  advanced: {
    enableDeveloperMode: false,
    enableExperimentalFeatures: false,
    maxUndoSteps: 50,
    cacheSize: 100,
    enableDebugMode: false,
    customCSS: ''
  }
};

const SettingsPage = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('preWorkAppSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('preWorkAppSettings', JSON.stringify(newSettings));
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('preWorkAppSettings');
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pre-work-app-settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const importedSettings = JSON.parse(result);
          setSettings(importedSettings);
          localStorage.setItem('preWorkAppSettings', JSON.stringify(importedSettings));
        }
      } catch (error) {
        console.error('Failed to import settings:', error);
        alert('Failed to import settings. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Settings
          </h1>
          <SettingsManager
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetSettings={handleResetSettings}
            onExportSettings={handleExportSettings}
            onImportSettings={handleImportSettings}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
