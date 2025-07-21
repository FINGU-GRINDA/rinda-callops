import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TooltipStep {
  id: string;
  title: string;
  description: string;
  position: { top?: string; left?: string; right?: string; bottom?: string };
  highlight?: string;
}

const tooltipSteps: TooltipStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Visual Agent Builder! ✨',
    description: 'Build your AI agent by connecting components visually. Let me show you around.',
    position: { top: '50%', left: '50%' }
  },
  {
    id: 'nodes',
    title: 'Agent Components',
    description: 'These nodes represent different parts of your agent. Click any node to configure it.',
    position: { top: '200px', left: '300px' },
    highlight: '.react-flow__node'
  },
  {
    id: 'library',
    title: 'Add Components',
    description: 'Click here to open the component library. Drag and drop tools onto the canvas.',
    position: { top: '100px', right: '200px' },
    highlight: 'button:contains("Add Component")'
  },
  {
    id: 'connections',
    title: 'Connect Components',
    description: 'Drag from one node\'s output to another\'s input to create connections.',
    position: { top: '250px', left: '500px' }
  },
  {
    id: 'configure',
    title: 'Configure Settings',
    description: 'Click any node to open its configuration panel on the right.',
    position: { top: '200px', right: '420px' }
  },
  {
    id: 'test',
    title: 'Test Your Agent',
    description: 'When ready, click "Test Agent" to try out your AI assistant.',
    position: { top: '100px', right: '350px' },
    highlight: 'button:contains("Test Agent")'
  }
];

interface OnboardingTooltipsProps {
  onComplete: () => void;
}

export default function OnboardingTooltips({ onComplete }: OnboardingTooltipsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < tooltipSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const currentTooltip = tooltipSteps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleSkip}
          />

          {/* Tooltip */}
          <motion.div
            key={currentTooltip.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              ...currentTooltip.position,
              transform: currentTooltip.position.top === '50%' && currentTooltip.position.left === '50%' 
                ? 'translate(-50%, -50%)' 
                : 'none',
              zIndex: 51
            }}
            className="bg-gradient-to-br from-blue-600 to-purple-700 p-6 rounded-2xl shadow-2xl max-w-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <h3 className="text-lg font-semibold text-white">{currentTooltip.title}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-white/70 hover:text-white hover:bg-white/20 -mt-1 -mr-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-white/90 mb-4">{currentTooltip.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {tooltipSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-white/70 hover:text-white hover:bg-white/20"
                >
                  Skip Tour
                </Button>
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="bg-white text-purple-700 hover:bg-white/90"
                >
                  {currentStep === tooltipSteps.length - 1 ? 'Get Started' : 'Next'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Highlight effect */}
          {currentTooltip.highlight && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-49"
              style={{
                boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.5)`,
                // This would need to be dynamically positioned based on the highlighted element
              }}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}