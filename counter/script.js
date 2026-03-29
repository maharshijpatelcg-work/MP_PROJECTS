document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const counterDisplay = document.getElementById('counter-value');
    const incrementBtn = document.getElementById('increment-btn');
    const decrementBtn = document.getElementById('decrement-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    // Bottom Indicator
    const bottomIndicator = document.querySelector('.bottom-indicator');
    const limitDisplay = document.getElementById('limit-display');
    const limitWarning = document.getElementById('limit-warning');
    
    // Settings Elements
    const preventNegativeToggle = document.getElementById('prevent-negative-toggle');
    const maxLimitInput = document.getElementById('max-limit-input');
    
    // Overlay Elements
    const infoOverlay = document.getElementById('info-overlay');
    const settingsOverlay = document.getElementById('settings-overlay');
    const infoBtn = document.getElementById('info-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const closeInfoBtn = document.getElementById('close-info-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');

    // Retrieve state from local storage or set defaults
    let count = parseInt(localStorage.getItem('minCounterValue'), 10) || 0;
    let preventNegative = localStorage.getItem('minCounterPreventNegative') === 'true';
    let maxLimit = localStorage.getItem('minCounterMaxLimit') || '';

    // Initialize UI
    preventNegativeToggle.checked = preventNegative;
    maxLimitInput.value = maxLimit;
    updateDisplay();

    // Event Listeners - Core Counter
    incrementBtn.addEventListener('click', () => {
        if (maxLimit !== '' && count >= parseInt(maxLimit, 10)) {
            triggerAnimation('shake');
            playFeedback();
            return;
        }
        count++;
        updateDisplay();
        triggerAnimation('pop');
        playFeedback();
    });

    decrementBtn.addEventListener('click', () => {
        if (preventNegative && count <= 0) {
           return; 
        }
        count--;
        updateDisplay();
        triggerAnimation('pop');
        playFeedback();
    });

    resetBtn.addEventListener('click', () => {
        count = 0;
        updateDisplay();
        triggerAnimation('pop');
        playFeedback();
    });

    // Event Listeners - Settings
    preventNegativeToggle.addEventListener('change', (e) => {
        preventNegative = e.target.checked;
        saveState();
        if (preventNegative && count < 0) {
            count = 0;
            updateDisplay();
            triggerAnimation('pop');
        }
    });

    maxLimitInput.addEventListener('input', (e) => {
        maxLimit = e.target.value;
        saveState();
        updateDisplay(); // Refresh the limit display at the bottom
    });

    // Event Listeners - Overlays
    infoBtn.addEventListener('click', () => {
        infoOverlay.classList.remove('hidden');
    });

    closeInfoBtn.addEventListener('click', () => {
        infoOverlay.classList.add('hidden');
    });

    settingsBtn.addEventListener('click', () => {
        settingsOverlay.classList.remove('hidden');
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsOverlay.classList.add('hidden');
    });

    // Helper Functions
    function updateDisplay() {
        counterDisplay.textContent = count;
        saveState();
        updateFavicon(count);
        
        // Update Bottom Limit Area
        if (maxLimit !== '') {
            limitDisplay.textContent = maxLimit;
            limitDisplay.classList.remove('hidden');
            
            if (count >= parseInt(maxLimit, 10)) {
                limitWarning.classList.remove('hidden');
                bottomIndicator.classList.add('limit-hit');
            } else {
                limitWarning.classList.add('hidden');
                bottomIndicator.classList.remove('limit-hit');
            }
        } else {
            limitDisplay.classList.add('hidden');
            limitWarning.classList.add('hidden');
            bottomIndicator.classList.remove('limit-hit');
        }
    }

    function saveState() {
        localStorage.setItem('minCounterValue', count);
        localStorage.setItem('minCounterPreventNegative', preventNegative);
        localStorage.setItem('minCounterMaxLimit', maxLimitInput.value);
    }

    function triggerAnimation(animationClass) {
        // Remove existing animation classes to re-trigger
        counterDisplay.classList.remove('pop', 'shake');
        
        // Force reflow
        void counterDisplay.offsetWidth;
        
        // Add new animation class
        counterDisplay.classList.add(animationClass);
        
        // Remove pop class after short duration so it can pop again smoothly
        if(animationClass === 'pop') {
            setTimeout(() => {
                counterDisplay.classList.remove('pop');
            }, 100);
        }
    }

    function playFeedback() {
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    function updateFavicon(number) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        // Draw black background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 32, 32);
        
        // Draw white text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Adjust font size for larger numbers
        let displayStr = number.toString();
        if (displayStr.length > 2) {
            ctx.font = 'bold ' + Math.max(10, 30 - displayStr.length * 4) + 'px Inter, sans-serif';
        }
        
        // Center text on canvas
        ctx.fillText(displayStr, 16, 17);
        
        // Update the link href
        let link = document.getElementById('dynamic-favicon');
        if (link) {
             link.href = canvas.toDataURL('image/png');
        }
    }
});
