// Check if the WebOTP API is available
if ('OTPCredential' in window) {
    const input = document.querySelector('input[autocomplete="one-time-code"]');
    
    // Set up an AbortController to cancel the OTP request if needed
    const ac = new AbortController();
    
    // Start the OTP listener
    navigator.credentials.get({
      otp: { transport: ['sms'] },
      signal: ac.signal
    }).then(otp => {
      input.value = otp.code;
      // Optional: auto-submit the form
      document.querySelector('form').submit();
    }).catch(err => {
      console.log('WebOTP error:', err);
    });
  }