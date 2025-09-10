import { useEffect } from 'react';

interface TawkChatProps {
  propertyId?: string;
}

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export function TawkChat({ propertyId }: TawkChatProps) {
  useEffect(() => {
    const tawkPropertyId = propertyId || import.meta.env.VITE_TAWK_PROPERTY_ID || '68bfb9dfd4baa0192076a8c8';
    
    // Initialize Tawk.to
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    
    // Create and inject the Tawk.to script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${tawkPropertyId}/1ib1p4oq9`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
    // Add the script to the document
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(script, firstScript);
    
    // Configure Tawk.to appearance and behavior
    window.Tawk_API.onLoad = function() {
      // Customize the widget appearance to match your brand colors
      window.Tawk_API.setAttributes({
        name: 'DealRadar Support',
        email: 'support@dealradar.com'
      }, function(error: any) {
        if (error) {
          console.error('Tawk.to configuration error:', error);
        }
      });
    };
    
    // Handle widget visibility
    window.Tawk_API.onChatMaximized = function() {
      console.log('Chat maximized');
    };
    
    window.Tawk_API.onChatMinimized = function() {
      console.log('Chat minimized');
    };
    
    // Cleanup function
    return () => {
      // Remove the script on component unmount
      const existingScript = document.querySelector(`script[src*="${tawkPropertyId}"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [propertyId]);
  
  return null; // This component doesn't render anything visible - Tawk.to handles the UI
}