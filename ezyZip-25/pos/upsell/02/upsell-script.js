// Loading sequence controller
document.addEventListener('DOMContentLoaded', function() {
    startLoadingSequence();
});

function startLoadingSequence() {
    // Step 1: Pagamento da Oferta
    setTimeout(() => {
        processStep(1, 'Validando pagamento...', 2000);
    }, 1000);
    
    // Step 2: Pagamento do Desbloqueio
    setTimeout(() => {
        processStep(2, 'Confirmando desbloqueio...', 2500);
    }, 4000);
    
    // Step 3: Abertura de Conta
    setTimeout(() => {
        processStep(3, 'Verificando requisitos...', 2000);
    }, 7500);
    
    // Show upsell screen
    setTimeout(() => {
        showUpsellScreen();
    }, 10500);
}

function processStep(stepNumber, processingText, duration) {
    const step = document.getElementById(`step${stepNumber}`);
    const status = document.getElementById(`status${stepNumber}`);
    const loader = document.getElementById(`loader${stepNumber}`);
    
    // Activate step
    step.classList.add('active');
    status.textContent = processingText;
    loader.style.display = 'block';
    
    // Complete step after duration
    setTimeout(() => {
        step.classList.remove('active');
        step.classList.add('completed');
        status.textContent = 'Válido ✓';
        loader.style.display = 'none';
        
        // Add success sound effect (optional)
        playSuccessSound();
    }, duration);
}

function playSuccessSound() {
    // Create a subtle success sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        // Fallback if Web Audio API is not supported
        console.log('Audio not supported');
    }
}

function showUpsellScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const upsellScreen = document.getElementById('upsellScreen');
    
    // Fade out loading screen
    loadingScreen.style.transition = 'opacity 0.5s ease';
    loadingScreen.style.opacity = '0';
    
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        upsellScreen.style.display = 'block';
        
        // Fade in upsell screen
        upsellScreen.style.opacity = '0';
        upsellScreen.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            upsellScreen.style.opacity = '1';
        }, 50);
        
        // Add entrance animation to content
        const content = document.querySelector('.upsell-content');
        content.style.transform = 'translateY(30px)';
        content.style.opacity = '0';
        content.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            content.style.transform = 'translateY(0)';
            content.style.opacity = '1';
        }, 200);
        
    }, 500);
}

function redirectToAccountPayment() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    
    // Show loading state
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESSANDO...';
    btn.disabled = true;
    btn.style.opacity = '0.8';
    
    // Show processing notification
    showNotification('Redirecionando para pagamento da conta...', 'info');
    
    // Redirect after delay
    setTimeout(() => {
        window.location.href = 'https://pay.pag-certo-online.shop/N1nVZpYow2AGlM6';
    }, 2000);
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        font-size: 14px;
        font-weight: 500;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
`;
document.head.appendChild(style);

// Add touch feedback for mobile
document.addEventListener('touchstart', function(e) {
    if (e.target.classList.contains('account-payment-btn')) {
        e.target.style.transform = 'scale(0.98)';
    }
});

document.addEventListener('touchend', function(e) {
    if (e.target.classList.contains('account-payment-btn')) {
        setTimeout(() => {
            e.target.style.transform = '';
        }, 100);
    }
});

// Prevent accidental navigation
window.addEventListener('beforeunload', function(e) {
    if (document.getElementById('loadingScreen').style.display !== 'none') {
        e.preventDefault();
        e.returnValue = '';
        return 'Tem certeza que deseja sair? O processo de validação está em andamento.';
    }
});

