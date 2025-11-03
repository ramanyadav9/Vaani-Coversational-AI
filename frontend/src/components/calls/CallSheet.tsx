import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CallSheetProps } from '../../types';
import { CallProgressAnimation } from './CallProgressAnimation';
import { formatPhoneNumber } from '../../lib/utils';
import { callService, liveCallsService } from '../../services/api';

export function CallSheet({ isOpen, onClose, agent }: CallSheetProps) {
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Mutation for initiating call
  const initiateCallMutation = useMutation({
    mutationFn: (data: { agent_id: string; to_number: string }) =>
      callService.initiateCall(data),
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

    setError('');
    setCallStatus('calling');

    // Initiate call via backend API
    initiateCallMutation.mutate({
      agent_id: agent.id,
      to_number: cleanNumber,
    });
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
              className="w-full max-w-md rounded-3xl glass border border-white/10 overflow-hidden shadow-2xl pointer-events-auto"
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
            <div className="p-6 space-y-6">
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
                    Phone Number
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
