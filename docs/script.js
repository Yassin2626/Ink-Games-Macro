document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    
    // Download functionality - opens the specified URL in a new tab without alert
    downloadBtn.addEventListener('click', function() {
        // Show loading state
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline';
        downloadBtn.disabled = true;
        
        // Simulate preparation time and open new URL
        setTimeout(() => {
            window.open('https://github.com/Yassin2626/Ink-Games-Macro/releases/download/V1.0.0/Marco.Cheat.GUI.zip', '_blank');
            // Reset button
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
            downloadBtn.disabled = false;
        }, 1500);
    });
    
    // Add particle effect background in monochrome grayscale
    createParticles();
});

function createParticles() {
    const container = document.querySelector('.container');
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random properties for particles
        const size = Math.random() * 15 + 5;
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
        particle.style.background = 'hsla(0, 0%, 50%, 0.3)';  // Monochrome grayscale background
        
        container.appendChild(particle);
    }
}
