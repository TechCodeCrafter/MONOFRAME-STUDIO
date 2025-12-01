'use client';

import { useState } from 'react';
import UploadArea from './components/UploadArea';
import ProcessingState from './components/ProcessingState';
import DemoResults from './components/DemoResults';

type DemoStep = 'upload' | 'processing' | 'results';

/**
 * AI Demo Editor Experience
 * Interactive demo showcasing MonoFrame's AI capabilities with smooth transitions
 */
export default function AIDemoPage() {
  const [currentStep, setCurrentStep] = useState<DemoStep>('upload');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTransition = (nextStep: DemoStep) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setCurrentStep(nextStep);
      setIsTransitioning(false);
    }, 300);
  };

  const handleReset = () => {
    handleTransition('upload');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div
        className={`w-full max-w-6xl transition-opacity duration-300 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {currentStep === 'upload' && (
          <UploadArea onUploadComplete={() => handleTransition('processing')} />
        )}
        
        {currentStep === 'processing' && (
          <ProcessingState onProcessingComplete={() => handleTransition('results')} />
        )}
        
        {currentStep === 'results' && (
          <DemoResults onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
