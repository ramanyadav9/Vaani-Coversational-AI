import { useEffect, useState } from 'react';
import { Phone, Info, Sparkles } from 'lucide-react';
import { formatPhoneNumber } from '../../lib/utils';
import type { Agent, AgentVariables } from '../../types';

interface DynamicCallFormProps {
  agent: Agent;
  agentVariables: AgentVariables | null;
  phoneNumber: string;
  onPhoneChange: (value: string) => void;
  customVariables: Record<string, string>;
  onCustomVariablesChange: (variables: Record<string, string>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  error?: string;
  isSubmitting?: boolean;
  autoGenerateOpening?: boolean;
  onAutoGenerateOpeningChange?: (value: boolean) => void;
}

export function DynamicCallForm({
  agent,
  agentVariables,
  phoneNumber,
  onPhoneChange,
  customVariables,
  onCustomVariablesChange,
  onSubmit,
  onCancel,
  error,
  isSubmitting = false,
  autoGenerateOpening: autoGenerateOpeningProp,
  onAutoGenerateOpeningChange,
}: DynamicCallFormProps) {
  // Auto-generate opening message toggle (default: ON)
  // Use controlled prop if provided, otherwise use internal state
  const [internalAutoGenerate, setInternalAutoGenerate] = useState(true);
  const autoGenerateOpening = autoGenerateOpeningProp !== undefined ? autoGenerateOpeningProp : internalAutoGenerate;
  const setAutoGenerateOpening = onAutoGenerateOpeningChange || setInternalAutoGenerate;

  // Check if this agent has opening_message variable
  const hasOpeningMessage = agentVariables?.variables?.opening_message;

  // Filter variables to show only user-input fields
  // EXCLUDE opening_message when auto-generate is enabled
  const userInputFields = agentVariables
    ? Object.entries(agentVariables.variables).filter(
        ([varName, varMeta]) => {
          const isUserInput =
            varMeta.classification === 'user_input_required' ||
            varMeta.classification === 'user_input_optional';

          // If auto-generate is ON, hide opening_message field
          if (autoGenerateOpening && varName === 'opening_message') {
            return false;
          }

          return isUserInput;
        }
      )
    : [];

  // Get webhook-populated fields for info display
  const webhookFields = agentVariables
    ? Object.entries(agentVariables.variables).filter(
        ([_, varMeta]) => varMeta.classification === 'webhook_populated'
      )
    : [];

  // Check if there are any user input fields to display
  const hasVariables = userInputFields.length > 0;

  // Auto-populate opening_message from customer name when auto-generate is enabled
  useEffect(() => {
    if (autoGenerateOpening && hasOpeningMessage) {
      const customerName = customVariables.session_configcustomer_name;
      console.log('[DynamicForm] Auto-generate opening_message:', {
        autoGenerateOpening,
        hasOpeningMessage,
        customerName,
        currentOpeningMessage: customVariables.opening_message,
      });

      if (customerName && customerName.trim()) {
        // Set opening_message to full greeting message for the agent to speak
        const fullGreeting = `Hello ${customerName.trim()}! I am Pusad Urban Bank's virtual assistant. Am I speaking with ${customerName.trim()}?`;
        const newVars = {
          ...customVariables,
          opening_message: fullGreeting,
        };
        console.log('[DynamicForm] Setting opening_message to:', fullGreeting);
        onCustomVariablesChange(newVars);
      } else if (customVariables.opening_message) {
        // Clear opening_message if no customer name is provided
        const { opening_message, ...rest } = customVariables;
        console.log('[DynamicForm] Clearing opening_message (no customer name)');
        onCustomVariablesChange(rest);
      }
    }
  }, [autoGenerateOpening, customVariables.session_configcustomer_name]);

  // Clear opening_message when auto-generate is turned OFF
  useEffect(() => {
    if (!autoGenerateOpening && customVariables.opening_message) {
      const { opening_message, ...rest } = customVariables;
      onCustomVariablesChange(rest);
    }
  }, [autoGenerateOpening]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 15) {
      onPhoneChange(value);
    }
  };

  const handleVariableChange = (varName: string, value: string) => {
    onCustomVariablesChange({
      ...customVariables,
      [varName]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-2">
          Phone Number <span className="text-red-400">*</span>
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
          required
        />
        {error && (
          <p id="phone-error" className="mt-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Auto-Generate Opening Message Toggle (only show if agent has opening_message variable) */}
      {hasOpeningMessage && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
          <div className="flex items-start gap-3">
            <div className="flex items-center h-6">
              <input
                type="checkbox"
                id="auto-generate-opening"
                checked={autoGenerateOpening}
                onChange={(e) => setAutoGenerateOpening(e.target.checked)}
                className="w-4 h-4 rounded bg-white/10 border-white/20 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="auto-generate-opening" className="flex items-center gap-2 text-sm font-medium text-white cursor-pointer">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Use customer name as opening message
              </label>
              <p className="text-xs text-white/60 mt-1">
                {autoGenerateOpening
                  ? 'The customer name you provide will be used as the opening message. The agent will then fetch additional details from the knowledge base/webhook.'
                  : 'You can manually provide the opening message (customer name or custom greeting) for this call.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* User Input Fields (Smart Filtering) */}
      {hasVariables && (
        <div className="space-y-4 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-white/80">
              {agent.category === 'Banking' ? 'Customer Details' : 'Additional Information'}
            </h3>
            {userInputFields.filter(([varName, v]) => {
              // Don't count opening_message as required when auto-generate is ON
              if (autoGenerateOpening && varName === 'opening_message') {
                return false;
              }
              return v.classification === 'user_input_required';
            }).length > 0 && (
              <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                {userInputFields.filter(([varName, v]) => {
                  if (autoGenerateOpening && varName === 'opening_message') {
                    return false;
                  }
                  return v.classification === 'user_input_required';
                }).length} required
              </span>
            )}
          </div>

          {/* Render only user-input fields */}
          {userInputFields.map(([varName, varMeta]) => {
            // Don't require opening_message when auto-generate is ON
            const isRequired = varMeta.classification === 'user_input_required' &&
                              !(autoGenerateOpening && varName === 'opening_message');
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
                    onChange={(e) => handleVariableChange(varName, e.target.value)}
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
                    onChange={(e) => handleVariableChange(varName, e.target.value)}
                    placeholder={varMeta.placeholder}
                    className="w-full px-4 py-2.5 input-glass text-sm"
                    required={isRequired}
                  />
                )}
                {varMeta.classification === 'user_input_optional' && (
                  <p className="text-xs text-white/40 mt-1">Optional field</p>
                )}
              </div>
            );
          })}

          {/* Info box for webhook-populated fields */}
          {webhookFields.length > 0 && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-blue-400 mb-1">
                  {webhookFields.length} field{webhookFields.length > 1 ? 's' : ''} auto-fetched
                </div>
                <div className="text-xs text-blue-400/80">
                  {webhookFields.map(([_, varMeta]) => varMeta.label).join(', ')} will be automatically populated from your records
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Variables - Quick Call UI */}
      {!hasVariables && (
        <div className="text-center py-6 border-t border-white/10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30 mb-3">
            <span className="text-2xl">✨</span>
          </div>
          <h4 className="text-lg font-medium text-white mb-1">Ready to Call</h4>
          <p className="text-sm text-white/60">
            This agent doesn't require additional setup
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Calling...</span>
            </>
          ) : (
            <>
              <Phone className="w-4 h-4" />
              <span>Make Call</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
