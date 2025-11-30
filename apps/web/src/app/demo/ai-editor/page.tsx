'use client';

import { useState } from 'react';
import UploadArea from './components/UploadArea';
import ProcessingState from './components/ProcessingState';
import DemoResults from './components/DemoResults';

type DemoStep = 'upload' | 'processing' | 'results';

/**
 * AI Demo Editor Experience
 * Interactive demo showcasing MonoFrame's AI capabilities
 */
export default function AIDemoPage() {
  const [currentStep, setCurrentStep] = useState<DemoStep>('upload');

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="w-full max-w-6xl">
        {currentStep === 'upload' && (
          <UploadArea onUploadComplete={() => setCurrentStep('processing')} />
        )}
        
        {currentStep === 'processing' && (
          <ProcessingState onProcessingComplete={() => setCurrentStep('results')} />
        )}
        
        {currentStep === 'results' && (
          <DemoResults onReset={() => setCurrentStep('upload')} />
        )}
      </div>
    </div>
  );
}

