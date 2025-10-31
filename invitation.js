// Get the guest name from URL query parameter
function getQueryParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Countdown Timer Function
function updateCountdown() {
    // Set the wedding date - November 7, 2025 at 6:00 PM
    const weddingDate = new Date('November 7, 2025 18:00:00').getTime();
    
    // Update countdown every second
    const countdownInterval = setInterval(function() {
        const now = new Date().getTime();
        const distance = weddingDate - now;
        
        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Display the countdown
        document.getElementById('days').textContent = days.toString().padStart(2, '0');
        document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
        
        // If countdown is over
        if (distance < 0) {
            clearInterval(countdownInterval);
            document.querySelector('.countdown-title').textContent = 'The Wedding Day is Here! 🎉';
            document.getElementById('days').textContent = '00';
            document.getElementById('hours').textContent = '00';
            document.getElementById('minutes').textContent = '00';
            document.getElementById('seconds').textContent = '00';
        }
    }, 1000);
}

// Slide Navigation
let currentSlideIndex = 1;
let autoSlideInterval;
let visibleSlides = [];

// Get visible slides based on side
function getVisibleSlides() {
    const guestSide = getQueryParameter('side') || 'bride';
    const onlyWedding = getQueryParameter('onlyWedding') === 'true';
    const allSlides = document.querySelectorAll('.slide');

    if (onlyWedding) {
        // When onlyWedding is requested: show regular slides (respecting data-show-for)
        // but exclude slides explicitly marked to be excluded (data-exclude-on-only-wedding="true").
        visibleSlides = Array.from(allSlides).filter(slide => {
            const showFor = slide.getAttribute('data-show-for');
            const excluded = slide.getAttribute('data-exclude-on-only-wedding') === 'true';
            const matchesSide = !showFor || showFor === guestSide;
            return matchesSide && !excluded;
        });

        // Fallback: if nothing left (unlikely), show at least the announcement/main slide(s)
        if (visibleSlides.length === 0) {
            visibleSlides = Array.from(allSlides).filter(slide => slide.getAttribute('data-wedding') === 'true');
        }

        return visibleSlides;
    }

    visibleSlides = Array.from(allSlides).filter(slide => {
        const showFor = slide.getAttribute('data-show-for');
        return !showFor || showFor === guestSide;
    });
    return visibleSlides;
}

function changeSlide(direction) {
    const visible = getVisibleSlides();
    let newIndex = currentSlideIndex + direction;
    
    if (newIndex > visible.length) {
        newIndex = 1;
    }
    if (newIndex < 1) {
        newIndex = visible.length;
    }
    
    currentSlideIndex = newIndex;
    showSlide(currentSlideIndex);
    resetAutoSlide();
}

function currentSlide(n) {
    currentSlideIndex = n;
    showSlide(currentSlideIndex);
    resetAutoSlide();
}

function showSlide(n) {
    const visible = getVisibleSlides();
    const allSlides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevArrow = document.querySelector('.prev-slide');
    const nextArrow = document.querySelector('.next-slide');
    
    if (n > visible.length) {
        currentSlideIndex = 1;
    }
    if (n < 1) {
        currentSlideIndex = visible.length;
    }
    
    // Hide all slides
    allSlides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Deactivate all dots
    dots.forEach(dot => {
        dot.classList.remove('active');
    });
    
    // Show the current visible slide
    if (visible[currentSlideIndex - 1]) {
        visible[currentSlideIndex - 1].classList.add('active');
    }
    
    // Activate corresponding dot
    if (dots[currentSlideIndex - 1]) {
        dots[currentSlideIndex - 1].classList.add('active');
    }
    
    // Show/Hide navigation arrows based on current slide
    if (prevArrow && nextArrow) {
        // Hide prev arrow on first slide
        if (currentSlideIndex === 1) {
            prevArrow.style.opacity = '0';
            prevArrow.style.pointerEvents = 'none';
        } else {
            prevArrow.style.opacity = '1';
            prevArrow.style.pointerEvents = 'auto';
        }
        
        // Hide next arrow on last slide
        if (currentSlideIndex === visible.length) {
            nextArrow.style.opacity = '0';
            nextArrow.style.pointerEvents = 'none';
        } else {
            nextArrow.style.opacity = '1';
            nextArrow.style.pointerEvents = 'auto';
        }
    }
}

// Auto-slide functionality - always forward
function autoSlide() {
    const visible = getVisibleSlides();
    currentSlideIndex++;
    if (currentSlideIndex > visible.length) {
        currentSlideIndex = 1;
    }
    showSlide(currentSlideIndex);
}

function startAutoSlide() {
    autoSlideInterval = setInterval(autoSlide, 5000); // Change every 5 seconds
}

function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeSlide(1);
    }
});

// Display guest name and customize based on side
window.addEventListener('DOMContentLoaded', function() {
    const guestName = getQueryParameter('name');
    const guestSide = getQueryParameter('side') || 'bride';
    const onlyWedding = getQueryParameter('onlyWedding') === 'true';
    const guestNameElement = document.getElementById('guestName');
    
    if (guestName) {
        guestNameElement.textContent = decodeURIComponent(guestName);
        
        // Add entrance animation to guest name
        setTimeout(() => {
            guestNameElement.style.animation = 'guestNameEntrance 1s ease';
        }, 500);
    } else {
        guestNameElement.textContent = 'Guest';
    }
    
    // Add side-specific styling or content
    if (guestSide === 'bride') {
        document.body.setAttribute('data-side', 'bride');
    } else if (guestSide === 'groom') {
        document.body.setAttribute('data-side', 'groom');
    }
    
    // Hide conditional slides and their dots
    const allSlides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    let visibleSlideCount = 0;
    allSlides.forEach((slide, index) => {
        const showFor = slide.getAttribute('data-show-for');
        // If onlyWedding flag is set, hide slides explicitly excluded for only-wedding (e.g., Mehandi/Haldi)
        if (onlyWedding) {
            const excluded = slide.getAttribute('data-exclude-on-only-wedding') === 'true';
            if (excluded) {
                if (dots[index]) dots[index].style.display = 'none';
                return; // skip counting this slide
            }
        }

        if (showFor && showFor !== guestSide) {
            // Hide this slide's dot
            if (dots[index]) {
                dots[index].style.display = 'none';
            }
        } else {
            visibleSlideCount++;
        }
    });
    
    // Start countdown timer
    updateCountdown();
    
    // Initialize first slide
    showSlide(1);
    
    // Start auto-slide only if there is more than one visible slide
    if (visibleSlides.length > 1) startAutoSlide();

    // If onlyWedding is true, disable some non-essential functions/animations
    if (onlyWedding) {
        // stop sparkles/confetti/music by not starting them (they are started below)
        // hide navigation dots if only one visible
        if (dots.length <= 1) {
            document.querySelectorAll('.slide-dots, .slide-navigation').forEach(el => el && (el.style.display = 'none'));
        }
    }
});

// Add entrance animation
const style = document.createElement('style');
style.textContent = `
    @keyframes guestNameEntrance {
        0% {
            opacity: 0;
            transform: scale(0.5) rotate(-10deg);
        }
        50% {
            transform: scale(1.2) rotate(5deg);
        }
        100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
        }
    }
`;
document.head.appendChild(style);

// Add sparkle effect on card
function createSparkle() {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: #d4af37;
        border-radius: 50%;
        pointer-events: none;
        animation: sparkleFloat 2s ease-out forwards;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        box-shadow: 0 0 10px #d4af37;
    `;
    
    document.querySelector('.invitation-card').appendChild(sparkle);
    
    setTimeout(() => {
        sparkle.remove();
    }, 2000);
}

// Create sparkles periodically
// Only start sparkles when not in 'onlyWedding' mode. We'll read the flag from URL.
if (getQueryParameter('onlyWedding') !== 'true') {
    setInterval(createSparkle, 500);
}

// Sparkle animation
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkleFloat {
        0% {
            opacity: 0;
            transform: translateY(0) scale(0);
        }
        50% {
            opacity: 1;
            transform: translateY(-20px) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-40px) scale(0);
        }
    }
`;
document.head.appendChild(sparkleStyle);

// Add hover effect to detail items
document.querySelectorAll('.detail-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.backgroundColor = 'rgba(212, 175, 55, 0.1)';
        this.style.borderRadius = '15px';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'transparent';
    });
});

// Confetti effect on page load
function createConfetti() {
    const colors = ['#d4af37', '#ffc0cb', '#ffb6c1', '#fff', '#e6d5b8'];
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                opacity: 0.8;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                animation: confettiFall ${3 + Math.random() * 3}s linear forwards;
                z-index: 9999;
                pointer-events: none;
            `;
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 6000);
        }, i * 50);
    }
}

// Confetti animation
const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(100vh) rotate(${Math.random() * 360}deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(confettiStyle);

// Trigger confetti on page load only when not in only-wedding mode
if (getQueryParameter('onlyWedding') !== 'true') {
    setTimeout(createConfetti, 500);
}

// ------------------ Background music control ------------------
// Note: Place your MP3 at ./audio/aaj-sajeya.mp3. I cannot provide copyrighted audio.
document.addEventListener('DOMContentLoaded', function() {
    // Do not auto-play background music when onlyWedding mode is active
    if (getQueryParameter('onlyWedding') === 'true') return;

    const music = document.getElementById('bgMusic');
    if (!music) return;

    // Function to try playing audio
    function tryPlay() {
        music.play().catch(() => {
            // If autoplay fails, try on first click
            document.body.addEventListener('click', function playOnClick() {
                music.play();
                document.body.removeEventListener('click', playOnClick);
            }, { once: true });
        });
    }

    // Try to play as soon as metadata is loaded
    if (music.readyState >= 2) { // HAVE_CURRENT_DATA
        tryPlay();
    } else {
        music.addEventListener('loadeddata', tryPlay);
    }
});

