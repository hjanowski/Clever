// Updated script.js with new identity event format

// Elements
const modal = document.getElementById('demo-modal');
const openModalBtn = document.getElementById('open-demo-modal');
const heroDemoBtn = document.getElementById('hero-demo-btn');
const closeModalBtn = document.querySelector('.close-button');
const demoForm = document.getElementById('demo-form');
const signInBtn = document.getElementById('sign-in-btn');
const statusNotification = document.getElementById('status-notification');
const dropdownToggle = document.querySelector('.dropdown-toggle');
const dropdown = document.querySelector('.dropdown');
const cleverSlidesLink = document.getElementById('clever-slides-link');
const slidesModal = document.getElementById('slides-modal');
const closeSlidesModal = document.getElementById('close-slides-modal');
const learnMoreSlides = document.getElementById('learn-more-slides');

// FIXED: Move all About link related code to DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    // Find the About link in the navigation
    const aboutLink = document.querySelector('a[href="about.html"]');
    console.log('About link found on load:', aboutLink);
    
    // Update active navigation links
    updateActiveNavLinks();
    
    // Only attach event if the About link was found
    if (aboutLink) {
        // FIXED: Remove onclick handler and use addEventListener instead
        // This prevents potential conflicts with other event handlers
        aboutLink.addEventListener('click', function(e) {
            console.log('About link clicked');
            
            // Only send analytics if API is available
            if (apiAvailable) {
                sendNavigationEvent('About Page');
            }
            
            // IMPORTANT: Do not prevent default behavior to allow normal navigation
            // Do not return anything here - addEventListener doesn't use return values
        });
    } else {
        console.error('About link not found in the DOM');
    }
});

// Variables to track state
let apiAvailable = false;
let consentInitialized = false;

// Helper function to show status notification
function showStatus(message, type = 'success') {
    statusNotification.textContent = message;
    statusNotification.className = `status-notification ${type}`;
    statusNotification.style.display = 'block';
    
    setTimeout(() => {
        statusNotification.style.display = 'none';
    }, 3000);
}

// Check if SalesforceInteractions is available
function checkApi() {
    if (typeof window.SalesforceInteractions === 'undefined') {
        console.log('SalesforceInteractions API not available');
        apiAvailable = false;
        return false;
    }
    
    if (typeof window.SalesforceInteractions.sendEvent !== 'function') {
        console.log('SalesforceInteractions.sendEvent is not a function');
        apiAvailable = false;
        return false;
    }
    
    console.log('SalesforceInteractions API is available');
    apiAvailable = true;
    return true;
}

// Initialize consent automatically
function initializeConsent() {
    if (!apiAvailable) return;
    
    window.SalesforceInteractions.init({
        consents: [
            {
                purpose: window.SalesforceInteractions.ConsentPurpose.Tracking,
                provider: "OneTrust",
                status: window.SalesforceInteractions.ConsentStatus.OptIn
            }
        ]
    }).then(res => { 
        consentInitialized = true;
        console.log('Consent initialized successfully');
    }).catch(err => { 
        console.error('Consent initialization error:', err);
    });
}

// Send identity event
function sendIdentity(firstName, lastName, email) {
    if (!apiAvailable) return;
    
    window.SalesforceInteractions.sendEvent({
        user: {
            attributes: {
                eventType: 'identity',
                firstName: firstName,
                lastName: lastName,
                email: email,
                isAnonymous: 1
            }
        }
    }).then(res => {
        console.log('Identity event sent successfully');
    }).catch(err => {
        console.error('Identity event error:', err);
    });
}

// Send identity event with company information and demo request engagement
function sendIdentityWithCompany(firstName, lastName, company, email) {
    if (!apiAvailable) return;
    
    // First event: Identity
    window.SalesforceInteractions.sendEvent({
        user: {
            attributes: {
                eventType: 'identity',
                firstName: firstName,
                lastName: lastName,
                company: company,
                email: email,
                isAnonymous: 0
            }
        }
    }).then(res => {
        console.log('Identity event sent successfully:', res);
    }).catch(err => {
        console.error('Identity event error:', err);
    });
    
    // Second event: Demo Request Engagement
    window.SalesforceInteractions.sendEvent({
        interaction: {
            name: "Request Demo",
            eventType: "RequestDemo2"
        }
    }).then(res => {
        console.log('Demo request engagement event sent successfully:', res);
    }).catch(err => {
        console.error('Demo request engagement event error:', err);
    });
}

// Send navigation event
function sendNavigationEvent(destination) {
    if (!apiAvailable) return;
    
    window.SalesforceInteractions.sendEvent({ 
        interaction: { 
            name: "Page Navigation", 
            eventType: "pageNavigation", 
            destination: destination
        } 
    }).then(res => { 
        console.log('Navigation event sent successfully');
    }).catch(err => { 
        console.error('Navigation event error:', err);
    });
}

// Modal functions
function openModal() {
    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}

// Event listeners
if (openModalBtn) {
    openModalBtn.addEventListener('click', openModal);
}

if (heroDemoBtn) {
    heroDemoBtn.addEventListener('click', openModal);
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Handle sign in click
if (signInBtn) {
    signInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // For demo purposes, we'll just send a test identity event
        sendIdentity('Demo', 'User', 'demo@clever.ai');
        showStatus('Welcome back!');
    });
}

// Handle form submission
if (demoForm) {
    demoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const company = document.getElementById('company').value;
        const email = document.getElementById('email').value;
        
        // Send identity event with company information
        sendIdentityWithCompany(firstName, lastName, company, email);
        
        // Show success message
        showStatus('Demo request submitted successfully!');
        closeModal();
        demoForm.reset();
    });
}

// Dropdown toggle functionality
if (dropdownToggle) {
    // Toggle dropdown on click instead of hover
    dropdownToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from bubbling up
        dropdown.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside - but make sure it's not clicking on a dropdown item
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
    
    // Handle clicks on dropdown items
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // If it's not the Clever Slides link that has its own handler
            if (item.id !== 'clever-slides-link') {
                e.preventDefault();
                
                // Keep dropdown open for a short time to show the click registered
                setTimeout(() => {
                    dropdown.classList.remove('active');
                }, 200);
            }
        });
    });
}

// Specifically for the Clever Slides link
if (cleverSlidesLink) {
    cleverSlidesLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from bubbling up
        slidesModal.style.display = 'flex';
        
        // Close the dropdown after a small delay to allow the click to register visually
        setTimeout(() => {
            dropdown.classList.remove('active');
        }, 100);
    });
}

// Close Clever Slides modal
if (closeSlidesModal) {
    closeSlidesModal.addEventListener('click', () => {
        slidesModal.style.display = 'none';
    });
}

// Handle Learn More button
if (learnMoreSlides) {
    learnMoreSlides.addEventListener('click', () => {
        // For demo purposes, just show a status notification
        showStatus('You\'ll be redirected to Clever Slides details page');
        slidesModal.style.display = 'none';
    });
}

// Close slides modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === slidesModal) {
        slidesModal.style.display = 'none';
    }
});

// Add active class to current navigation item
function updateActiveNavLinks() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href === currentPage || (currentPage === 'index.html' && href === '')) {
            link.classList.add('active');
        } else {
            // Ensure other links don't have active class
            link.classList.remove('active');
        }
    });
}

// Initialize on page load
window.addEventListener('load', () => {
    // Log the base URL for debugging
    console.log('Current pathname:', window.location.pathname);
    
    // Check API availability and initialize consent automatically
    if (checkApi()) {
        initializeConsent();
    } else {
        // Try again after a short delay
        setTimeout(() => {
            if (checkApi()) {
                initializeConsent();
            }
        }, 1000);
    }
    
    // Debug: check if about link is present and configured correctly
    const debugAboutLink = document.querySelector('a[href="about.html"]');
    if (debugAboutLink) {
        console.log('About link found:', debugAboutLink);
        console.log('href attribute:', debugAboutLink.getAttribute('href'));
    } else {
        console.log('About link not found in DOM');
    }
});
