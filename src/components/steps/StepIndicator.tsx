'use client';

import { motion } from 'framer-motion';

interface StepIndicatorProps {
    currentStep: 1 | 2 | 3;
    onStepClick?: (step: 1 | 2 | 3) => void;
}

const steps = [
    { number: 1, label: 'Describe', icon: '✏️' },
    { number: 2, label: 'Customize', icon: '🎨' },
    { number: 3, label: 'Connect', icon: '🔗' },
];

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-center gap-2 py-4">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                    {/* Step Circle */}
                    <motion.button
                        onClick={() => onStepClick?.(step.number as 1 | 2 | 3)}
                        disabled={step.number > currentStep}
                        className={`
                            relative flex items-center justify-center w-10 h-10 rounded-full 
                            font-bold text-sm transition-all duration-300
                            ${step.number === currentStep
                                ? 'bg-white text-black scale-110'
                                : step.number < currentStep
                                    ? 'bg-green-500 text-white cursor-pointer hover:scale-105'
                                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                            }
                        `}
                        whileHover={step.number <= currentStep ? { scale: 1.1 } : {}}
                        whileTap={step.number <= currentStep ? { scale: 0.95 } : {}}
                    >
                        {step.number < currentStep ? '✓' : step.number}
                    </motion.button>

                    {/* Step Label */}
                    <span className={`
                        ml-2 text-xs font-medium uppercase tracking-wider
                        ${step.number === currentStep ? 'text-white' : 'text-white/30'}
                    `}>
                        {step.label}
                    </span>

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                        <div className={`
                            w-12 h-0.5 mx-4 rounded-full transition-colors duration-300
                            ${step.number < currentStep ? 'bg-green-500' : 'bg-white/10'}
                        `} />
                    )}
                </div>
            ))}
        </div>
    );
}
