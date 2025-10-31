// Form submission handler
document.getElementById('nameForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const guestName = document.getElementById('guestName').value.trim();
    const selectedSide = document.querySelector('input[name="side"]:checked');
    const onlyWeddingCheckbox = document.getElementById('onlyWedding');
    
    if (guestName && selectedSide) {
        const side = selectedSide.value;

        // Create URL with query parameters
        let invitationUrl = `invitation.html?name=${encodeURIComponent(guestName)}&side=${side}`;
        if (onlyWeddingCheckbox && onlyWeddingCheckbox.checked) {
            invitationUrl += `&onlyWedding=true`;
        }
        
        // Add a fade out animation before redirect
        document.querySelector('.form-container').style.animation = 'fadeOut 0.5s ease';
        
        setTimeout(() => {
            window.location.href = invitationUrl;
        }, 500);
    }
});

// Fade out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-30px);
        }
    }
`;
document.head.appendChild(style);

// Add sparkle effect on input focus
const input = document.getElementById('guestName');
input.addEventListener('focus', function() {
    this.parentElement.style.transform = 'scale(1.02)';
    this.parentElement.style.transition = 'transform 0.3s ease';
});

input.addEventListener('blur', function() {
    this.parentElement.style.transform = 'scale(1)';
});

