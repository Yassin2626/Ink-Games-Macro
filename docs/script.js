document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    
    // Download functionality
    downloadBtn.addEventListener('click', function() {
        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        downloadBtn.disabled = true;
        
        // Simulate preparation time
        setTimeout(() => {
            // Redirect to MediaFire download URL
            window.open('https://www.mediafire.com/file/ht3yxds1pp2z6aq/Ink_Games_Macro.zip/file', '_blank');
            
            // Show success message
            alert('Opening download page! If the download does not start automatically, please click on the "Download" button on the MediaFire page.');
            
            // Reset button
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            downloadBtn.disabled = false;
        }, 2000);
    });
    
    // Add subtle animations to feature cards on hover
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add particle effect background (simplified version)
    createParticles();
});

function createParticles() {
    const container = document.querySelector('.container');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random properties
        const size = Math.random() * 10 + 2;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const animationDuration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDuration = `${animationDuration}s`;
        particle.style.animationDelay = `${delay}s`;
        
        container.appendChild(particle);
    }
}

// Add CSS for particles dynamically
const style = document.createElement('style');
style.textContent = `
    .particle {
        position: absolute;
        background: rgba(106, 17, 203, 0.5);
        border-radius: 50%;
        pointer-events: none;
        z-index: -1;
        animation: float 15s infinite ease-in-out;
        box-shadow: 0 0 10px rgba(106, 17, 203, 0.5);
    }
    
    @keyframes float {
        0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translate(calc((100vw - 100%) * (Math.random() > 0.5 ? 1 : -1)), calc((100vh - 100%) * (Math.random() > 0.5 ? 1 : -1))) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
