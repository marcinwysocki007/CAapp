import { useEffect, useCallback } from 'react';
import { analytics } from '@/lib/analytics';

export function useFormTracking(formName: string) {
  const trackFieldFocus = useCallback((fieldName: string) => {
    analytics.trackFormInteraction(formName, fieldName, 'focus');
  }, [formName]);

  const trackFieldBlur = useCallback((fieldName: string, value?: string) => {
    analytics.trackFormInteraction(formName, fieldName, 'blur', value);
  }, [formName]);

  const trackFieldChange = useCallback((fieldName: string, value?: string) => {
    analytics.trackFormInteraction(formName, fieldName, 'change', value);
  }, [formName]);

  const trackFieldAbandon = useCallback((fieldName: string) => {
    analytics.trackFormInteraction(formName, fieldName, 'abandon');
  }, [formName]);

  const trackFormSubmit = useCallback(() => {
    analytics.trackFormInteraction(formName, 'form', 'submit');
  }, [formName]);

  return {
    trackFieldFocus,
    trackFieldBlur,
    trackFieldChange,
    trackFieldAbandon,
    trackFormSubmit,
  };
}
