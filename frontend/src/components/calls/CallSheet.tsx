import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CallSheetProps } from '../../types';
import { CallProgressAnimation } from './CallProgressAnimation';
import { formatPhoneNumber } from '../../lib/utils';
import { callService, liveCallsService } from '../../services/api';
import agentVariablesData from '../../agent-variables.json';

export function CallSheet({ isOpen, onClose, agent }: CallSheetProps) {
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [language, setLanguage] = useState<'English' | 'Hindi'>('English');

  // Find agent's variable requirements from scan data
  const agentVariables = agent
    ? agentVariablesData.agents.find((a: any) => a.agent_id === agent.id)
    : null;

  // Dynamic custom variables state (one field per variable)
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({});

  // Initialize custom variables when agent changes
  useEffect(() => {
    if (agentVariables?.variables) {
      const initialVars: Record<string, string> = {};
      Object.keys(agentVariables.variables).forEach(varName => {
        initialVars[varName] = '';
      });
      setCustomVariables(initialVars);
    } else {
      setCustomVariables({});
    }
  }, [agent?.id]);

  // Helper to check if agent has variables
  const hasVariables = agentVariables && Object.keys(agentVariables.variables || {}).length > 0;

  // Mutation for initiating call
  const initiateCallMutation = useMutation({
    mutationFn: (data: {
      agent_id: string;
      to_number: string;
      language?: string;
      custom_variables?: Record<string, string | number | boolean>;
    }) => callService.initiateCall(data),
    onSuccess: (data) => {
      if (data.success) {
        setCallStatus('connected');
        // Extract conversation_id from data object
        const convId = data.data?.conversation_id || data.conversation_id || null;
        setConversationId(convId);
        toast.success('Call initiated successfully!', {
          description: data.message || `Conversation ID: ${convId || 'N/A'}`,
        });
        // Invalidate live calls to show this call
        queryClient.invalidateQueries({ queryKey: ['liveCalls'] });
      } else {
        setCallStatus('idle');
        toast.error('Failed to initiate call', {
          description: data.error || data.details || 'Unknown error',
        });
      }
    },
    onError: (error: Error) => {
      setCallStatus('idle');
      toast.error('Failed to initiate call', {
        description: error.message,
      });
    },
  });


  const handleCall = () => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    if (cleanNumber.length < 7) {
      setError('Please enter a valid phone number (at least 7 digits)');
      return;
    }

    if (!agent) {
      setError('No agent selected');
      return;
    }

    // Check for required variables
    if (agentVariables?.required_variables) {
      const missingRequired = agentVariables.required_variables.filter(
        (varName: string) => !customVariables[varName] || customVariables[varName].trim() === ''
      );

      if (missingRequired.length > 0) {
        setError(`Please fill in required fields: ${missingRequired.map((v: string) =>
          (agentVariables.variables as Record<string, any>)[v]?.label || v
        ).join(', ')}`);
        return;
      }
    }

    setError('');
    setCallStatus('calling');

    // Build call payload
    const callPayload: any = {
      agent_id: agent.id,
      to_number: cleanNumber,
      language: language,
    };

    // Add custom variables if any are provided
    const filledVariables: Record<string, any> = {};
    Object.entries(customVariables).forEach(([varName, value]) => {
      if (value && value.trim() !== '') {
        filledVariables[varName] = value;
      }
    });

    if (Object.keys(filledVariables).length > 0) {
      callPayload.custom_variables = filledVariables;
    }

    console.log('=== CALL INITIATION DEBUG ===');
    console.log('[CallSheet] Agent:', agent.name);
    console.log('[CallSheet] Agent Variables:', agentVariables?.variable_count || 0);
    console.log('[CallSheet] Required Variables:', agentVariables?.required_variables || []);
    console.log('[CallSheet] Filled Variables:', Object.keys(filledVariables));
    console.log('[CallSheet] Full Call Payload:', JSON.stringify(callPayload, null, 2));
    console.log('==============================');

    // Initiate call via backend API
    initiateCallMutation.mutate(callPayload);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    // Allow up to 15 digits for international numbers
    if (value.length <= 15) {
      setPhoneNumber(value);
      setError('');
    }
  };

  const handleClose = () => {
    // Reset all state
    setPhoneNumber('');
    setCallStatus('idle');
    setError('');
    setConversationId(null);
    setLanguage('English');
    setCustomVariables({});
    onClose();
  };

  // Poll live calls to detect when the call ends
  const { data: liveCalls = [] } = useQuery({
    queryKey: ['liveCalls'],
    queryFn: liveCallsService.getLiveCalls,
    refetchInterval: callStatus === 'connected' ? 1000 : false, // Poll every second when call is active
    enabled: callStatus === 'connected' && !!conversationId, // Only poll when we have an active call
  });

  // Auto-close when call ends (no longer in live calls list)
  useEffect(() => {
    if (callStatus === 'connected' && conversationId && liveCalls.length > 0) {
      const callStillActive = liveCalls.some(call => call.id === conversationId);
      if (!callStillActive) {
        // Call has ended, auto-close the modal
        toast.info('Call ended');
        handleClose();
      }
    }
  }, [liveCalls, conversationId, callStatus]);

  // Invalidate queries when modal closes to ensure fresh data
  useEffect(() => {
    if (!isOpen) {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['liveCalls'] });
    }
  }, [isOpen, queryClient]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container - handles centering */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            {/* Sheet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg rounded-3xl glass border border-white/10 overflow-hidden shadow-2xl pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="call-sheet-title"
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 id="call-sheet-title" className="text-xl font-semibold text-white">
                {callStatus === 'idle' ? 'Initiate Call' : callStatus === 'connected' ? 'Call Active' : callStatus === 'calling' ? 'Calling...' : 'Call Ended'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-white/80" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
              {/* Agent Info */}
              {agent && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center">
                    <span className="text-white font-bold">{agent.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">{agent.name}</div>
                    <div className="text-sm text-white/60">{agent.category}</div>
                  </div>
                </div>
              )}

              {/* Call Progress */}
              {callStatus !== 'idle' && (
                <div className="py-4">
                  <CallProgressAnimation status={callStatus} />
                  <div className="text-center mt-4">
                    {callStatus === 'calling' && (
                      <p className="text-white/80">Connecting...</p>
                    )}
                    {callStatus === 'connected' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-green-400">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <p className="font-medium">Call in Progress</p>
                        </div>
                        <p className="text-sm text-white/60">
                          Monitor your call in the Live Calls tab.
                        </p>
                      </div>
                    )}
                    {callStatus === 'ended' && (
                      <p className="text-white/80">Call Ended</p>
                    )}
                  </div>
                </div>
              )}

              {/* Phone Input */}
              {callStatus === 'idle' && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formatPhoneNumber(phoneNumber)}
                    onChange={handlePhoneChange}
                    placeholder="(555) 123-4567"
                    className={`w-full px-4 py-3 input-glass ${
                      error ? 'border-red-500 shake' : ''
                    }`}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'phone-error' : undefined}
                  />
                  {error && (
                    <p id="phone-error" className="mt-2 text-sm text-red-400" role="alert">
                      {error}
                    </p>
                  )}
                </div>
              )}

              {/* Language Selection (Always shown) */}
              {callStatus === 'idle' && (
                <div className="space-y-4 border-t border-white/10 pt-4">
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-white/60 mb-2">
                      Language
                    </label>
                    <select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'English' | 'Hindi')}
                      className="w-full px-4 py-2.5 input-glass text-sm"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                    <p className="text-xs text-white/40 mt-1">Agent will use its configured voice for this language</p>
                  </div>
                </div>
              )}

              {/* Dynamic Variables Form (Agent-specific) */}
              {callStatus === 'idle' && hasVariables && (
                <div className="space-y-4 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white/80">
                      {agentVariables?.category === 'Banking' ? 'Banking Details' : 'Additional Information'}
                    </h3>
                    {agentVariables?.required_variables && agentVariables.required_variables.length > 0 && (
                      <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                        {agentVariables.required_variables.length} required
                      </span>
                    )}
                  </div>

                  {/* Dynamically render fields based on agent variables */}
                  {agentVariables && Object.entries(agentVariables.variables).map(([varName, varMeta]: [string, any]) => {
                    const isRequired = varMeta.required;
                    const fieldType = varMeta.fieldType;

                    return (
                      <div key={varName}>
                        <label
                          htmlFor={varName}
                          className="block text-sm font-medium text-white/60 mb-2"
                        >
                          {varMeta.label}
                          {isRequired && <span className="text-red-400 ml-1">*</span>}
                        </label>
                        {fieldType === 'textarea' ? (
                          <textarea
                            id={varName}
                            value={customVariables[varName] || ''}
                            onChange={(e) => setCustomVariables({
                              ...customVariables,
                              [varName]: e.target.value
                            })}
                            placeholder={varMeta.placeholder}
                            rows={3}
                            className="w-full px-4 py-2.5 input-glass text-sm resize-none"
                            required={isRequired}
                          />
                        ) : (
                          <input
                            id={varName}
                            type={fieldType}
                            value={customVariables[varName] || ''}
                            onChange={(e) => setCustomVariables({
                              ...customVariables,
                              [varName]: e.target.value
                            })}
                            placeholder={varMeta.placeholder}
                            className="w-full px-4 py-2.5 input-glass text-sm"
                            required={isRequired}
                          />
                        )}
                        {varMeta.source && (
                          <p className="text-xs text-white/30 mt-1">
                            Used in: {varMeta.source.join(', ')}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* No Variables Message */}
              {callStatus === 'idle' && !hasVariables && (
                <div className="text-center py-4 border-t border-white/10">
                  <p className="text-sm text-white/40">
                    This agent doesn't require additional information
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                {callStatus === 'idle' ? (
                  <>
                    <button
                      onClick={handleClose}
                      className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCall}
                      disabled={initiateCallMutation.isPending}
                      className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {initiateCallMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Calling...</span>
                        </>
                      ) : (
                        <>
                          <Phone className="w-4 h-4" />
                          <span>Call Now</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleClose}
                    className="w-full px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all duration-200"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
