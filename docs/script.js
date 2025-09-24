document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.getElementById('downloadBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoading = document.querySelector('.btn-loading');
    
    // Download functionality - opens the specified MediaFire link
    downloadBtn.addEventListener('click', function() {
        // Show loading state
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline';
        downloadBtn.disabled = true;
        
        // Simulate preparation time
        setTimeout(() => {
            // Open the specified MediaFire download URL in a new tab
            window.open('https://download1652.mediafire.com/94b03yg636dgjLyHu09Itwt96xYw_gCCme0cuF2PLyGBFiQ1ydJ6AFx50vbF3zR4eJCLfpn8IopcUOLp2cTrDACVobyEEdAQjYPqApBDjH4uVE5z9B3Z7zymy9WJq5OtzoY-sTtqvnHD7-7TbQK_7YCYUFlSllnmChc4kVSnRAE/ht3yxds1pp2z6aq/Ink+Games+Macro.zip', '_blank');
            
            // Show success message
            alert('Opening download page! If the download does not start automatically, please click on the "Download" button on the MediaFire page.');
            
            // Reset button
            if (btnText) btnText.style.display = 'inline';
            if (btnLoading) btnLoading.style.display = 'none';
            downloadBtn.disabled = false;
        }, 1500);
    });
    
    // Add particle effect background
    createParticles();
});

function createParticles() {
    const container = document.querySelector('.container');
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random properties
        const size = Math.random() * 15 + 5;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const animationDuration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        const hue = Math.random() * 360;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDuration = `${animationDuration}s`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.background = `hsla(${hue}, 80%, 60%, 0.3)`;
        
        container.appendChild(particle);
    }
}
