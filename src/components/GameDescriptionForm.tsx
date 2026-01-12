'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { toast } from 'react-hot-toast';
import { GAME_FACTORY_ADDRESS, GAME_FACTORY_ABI } from '@/config/wagmi';

import { StepIndicator } from './steps/StepIndicator';
import { DescribeStep } from './steps/DescribeStep';
import { CustomizeStep } from './steps/CustomizeStep';
import { ConnectStep } from './steps/ConnectStep';

interface ModSchemaItem {
    key: string;
    type: 'range' | 'color' | 'boolean';
    label: string;
    defaultValue: number | string | boolean;
    min?: number;
    max?: number;
    step?: number;
}

interface GameData {
    gameName: string;
    genre: string;
    mechanics: string[];
    levelStructure: string;
    mantleAssets: string[];
    difficulty: number;
    visualStyle: string;
    startingScene: string;
    playerActions: string[];
    modSchema?: ModSchemaItem[];
    gameCode: string;
}

interface EvolutionStep {
    id: string;
    timestamp: number;
    userCommand: string;
    aiResponse?: string;
    success: boolean;
}

export function GameDescriptionForm() {
    const { isConnected } = useAccount();

    // Step state
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

    // Data state
    const [description, setDescription] = useState('');
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [modValues, setModValues] = useState<Record<string, any>>({});
    const [connections, setConnections] = useState<Record<string, boolean>>({});
    const [evolutionHistory, setEvolutionHistory] = useState<EvolutionStep[]>([]);

    // Loading states
    const [isGenerating, setIsGenerating] = useState(false);
    const [isEvolving, setIsEvolving] = useState(false);

    // Mint contract
    const {
        data: hash,
        isPending: isMinting,
        writeContract,
        error: mintError
    } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    useEffect(() => {
        if (mintError) {
            toast.error(`Mint Error: ${mintError.message.slice(0, 50)}...`);
        }
    }, [mintError]);

    useEffect(() => {
        if (isConfirmed) {
            toast.success('🎉 Game deployed to Mantle Network!');
        }
    }, [isConfirmed]);

    // ===== API CALL: Generate Game =====
    const generateGame = async (desc: string, previousData?: GameData | null) => {
        try {
            const response = await fetch('/api/generate-game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: desc,
                    previousGameData: previousData || null
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || `API Error: ${response.status}`);
            }

            if (data.isMock) {
                toast("⚠️ Simulation Mode", { style: { background: '#333', color: '#fbbf24' } });
            }

            return data.gameData;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            toast.error(`Failed: ${errorMsg.slice(0, 50)}`);
            throw err;
        }
    };

    // ===== STEP 1: Handle Describe =====
    const handleDescribe = async (desc: string) => {
        setDescription(desc);
        setIsGenerating(true);

        try {
            const game = await generateGame(desc);
            setGameData(game);
            setCurrentStep(2);
            toast.success('✨ Game created!');
        } finally {
            setIsGenerating(false);
        }
    };

    // ===== STEP 2: Handle Evolve =====
    const handleEvolve = async (instruction: string) => {
        if (!gameData) return;

        const stepId = Date.now().toString();

        // Add user command to history
        setEvolutionHistory(prev => [...prev, {
            id: stepId,
            timestamp: Date.now(),
            userCommand: instruction,
            success: false
        }]);

        setIsEvolving(true);

        try {
            const game = await generateGame(instruction, gameData);
            setGameData(game);

            // Update history with success
            setEvolutionHistory(prev => prev.map(step =>
                step.id === stepId
                    ? { ...step, success: true, aiResponse: 'Game updated successfully' }
                    : step
            ));

            toast.success('✨ Game evolved!');
        } catch (error) {
            // Update history with error
            setEvolutionHistory(prev => prev.map(step =>
                step.id === stepId
                    ? { ...step, success: false, aiResponse: error instanceof Error ? error.message : 'Failed to evolve' }
                    : step
            ));

            toast.error('Failed to evolve game');
        } finally {
            setIsEvolving(false);
        }
    };

    // ===== STEP 2: Handle Customize Complete =====
    const handleCustomizeComplete = (mods: Record<string, any>) => {
        setModValues(mods);
        setCurrentStep(3);
    };

    // ===== STEP 3: Handle Deploy =====
    const handleDeploy = (conns: Record<string, boolean>) => {
        if (!gameData || !isConnected) {
            toast.error('Connect wallet to deploy');
            return;
        }

        setConnections(conns);

        const mintData = {
            ...gameData,
            currentModValues: modValues,
            connections: conns
        };

        toast.loading('Deploying...', { id: 'deploy' });

        writeContract({
            address: GAME_FACTORY_ADDRESS,
            abi: GAME_FACTORY_ABI,
            functionName: 'mintGame',
            args: [gameData.gameName, JSON.stringify(mintData)],
        }, {
            onSuccess: () => {
                toast.dismiss('deploy');
                toast.success('Transaction sent!');
            },
            onError: () => {
                toast.dismiss('deploy');
            }
        });
    };

    // ===== Navigation =====
    const goToStep = (step: 1 | 2 | 3) => {
        // Only allow going back, or forward if data exists
        if (step < currentStep) {
            setCurrentStep(step);
        } else if (step === 2 && gameData) {
            setCurrentStep(2);
        } else if (step === 3 && gameData) {
            setCurrentStep(3);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#050505] flex flex-col overflow-hidden">

            {/* Step Indicator */}
            <div className="shrink-0 py-4 border-b border-white/5">
                <StepIndicator
                    currentStep={currentStep}
                    onStepClick={goToStep}
                />
            </div>

            {/* Step Content */}
            <div className="flex-1 flex overflow-hidden">
                <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                        <DescribeStep
                            key="describe"
                            onNext={handleDescribe}
                            isLoading={isGenerating}
                            initialValue={description}
                        />
                    )}

                    {currentStep === 2 && gameData && (
                        <CustomizeStep
                            key="customize"
                            gameData={gameData}
                            onBack={() => setCurrentStep(1)}
                            onNext={handleCustomizeComplete}
                            onEvolve={handleEvolve}
                            isEvolving={isEvolving}
                            evolutionHistory={evolutionHistory}
                        />
                    )}

                    {currentStep === 3 && gameData && (
                        <ConnectStep
                            key="connect"
                            gameName={gameData.gameName}
                            onBack={() => setCurrentStep(2)}
                            onDeploy={handleDeploy}
                            isDeploying={isMinting || isConfirming}
                            isConnected={isConnected}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
