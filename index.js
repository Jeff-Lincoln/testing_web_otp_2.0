document.addEventListener('DOMContentLoaded', function() {
  // Check if the WebOTP API is available
  if ('OTPCredential' in window) {
    const input = document.querySelector('input[autocomplete="one-time-code"]');
    
    if (!input) {
      console.error('No input with autocomplete="one-time-code" found');
      return;
    }
    
    // Set up an AbortController to cancel the OTP request if needed
    const ac = new AbortController();
    
    // If the form is submitted manually, abort the OTP request
    const form = input.closest('form');
    if (form) {
      form.addEventListener('submit', () => {
        ac.abort();
      });
    }
    
    // Start the OTP listener
    navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: ac.signal
    }).then(otp => {
      if (otp && otp.code) {
        // Fill the input
        input.value = otp.code;
        
        // Add visual feedback
        input.style.backgroundColor = '#e6f7ff';
        setTimeout(() => {
          input.style.backgroundColor = '';
        }, 1000);
        
        // Trigger input event for any listeners
        input.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Optional: auto-submit the form after a short delay
        if (form) {
          setTimeout(() => {
            form.submit();
          }, 500);
        }
      }
    }).catch(err => {
      // Only log if it's not an abort error
      if (err.name !== 'AbortError') {
        console.log('WebOTP error:', err);
        
        // Fall back to notification monitoring if WebOTP fails
        setupNotificationMonitoring();
      }
    });
  } else {
    // Fall back to notification monitoring if WebOTP is not supported
    setupNotificationMonitoring();
  }
  
  // Helper function to set up notification monitoring as fallback
  function setupNotificationMonitoring() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          navigator.serviceWorker.register('otp-sw.js')
            .then(registration => {
              console.log('OTP Service Worker registered');
              
              // Listen for messages from the service worker
              navigator.serviceWorker.addEventListener('message', event => {
                if (event.data && event.data.type === 'OTP') {
                  const otpCode = event.data.code;
                  const input = document.querySelector('input[autocomplete="one-time-code"]');
                  
                  if (input && otpCode) {
                    // Fill the input
                    input.value = otpCode;
                    
                    // Add visual feedback
                    input.style.backgroundColor = '#e6f7ff';
                    setTimeout(() => {
                      input.style.backgroundColor = '';
                    }, 1000);
                    
                    // Trigger input event
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    // Optional: auto-submit
                    const form = input.closest('form');
                    if (form) {
                      setTimeout(() => {
                        form.submit();
                      }, 500);
                    }
                  }
                }
              });
            })
            .catch(err => console.error('Service Worker registration failed:', err));
        }
      });
    }
    
    // Also set up clipboard monitoring for pasted OTP codes
    document.addEventListener('paste', event => {
      const clipboardData = event.clipboardData || window.clipboardData;
      if (!clipboardData) return;
      
      const pastedText = clipboardData.getData('text');
      const otpMatch = pastedText.match(/\b(\d{6})\b/);
      
      if (otpMatch) {
        const otpCode = otpMatch[1];
        const input = document.querySelector('input[autocomplete="one-time-code"]');
        
        if (input) {
          // Fill the input
          input.value = otpCode;
          
          // Add visual feedback
          input.style.backgroundColor = '#e6f7ff';
          setTimeout(() => {
            input.style.backgroundColor = '';
          }, 1000);
          
          // Trigger input event
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });
  }
});

// // Check if the WebOTP API is available
// if ('OTPCredential' in window) {
//   const input = document.querySelector('input[autocomplete="one-time-code"]');
  
//   // Set up an AbortController to cancel the OTP request if needed
//   const ac = new AbortController();
  
//   // Start the OTP listener
//   navigator.credentials.get({
//     otp: { transport: ['sms'] },
//     signal: ac.signal
//   }).then(otp => {
//     input.value = otp.code;
//     // Optional: auto-submit the form
//     document.querySelector('form').submit();
//   }).catch(err => {
//     console.log('WebOTP error:', err);
//   });
// }


// // if ('OTPCredential' in window) {
// //     window.addEventListener('DOMContentLoaded', e => {
// //       const input = document.querySelector('input[autocomplete="one-time-code"]');
// //       if (!input) return;
// //       const ac = new AbortController();
// //       const form = input.closest('form');
// //       if (form) {
// //         form.addEventListener('submit', e => {
// //           ac.abort();
// //         });
// //       }
// //       navigator.credentials.get({
// //         otp: { transport:['sms'] },
// //         signal: ac.signal
// //       }).then(otp => {
// //         input.value = otp.code;
// //         if (form) form.submit();
// //       }).catch(err => {
// //         console.log(err);
// //       });
// //     });
// //   }