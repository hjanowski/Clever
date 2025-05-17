// Elements
const modal = document.getElementById('demo-modal');
const openModalBtn = document.getElementById('open-demo-btn');
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
const aboutLink = document.querySelector('a[href="about.html"]');

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

// Get UTM parameters from URL
function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        campaignName: params.get('utm_campaign') || 'direct_traffic',
        campaignSource: params.get('utm_source') || 'direct',
        campaignContent: params.get('utm_content') || 'none',
        custom1: params.get('utm_term') || 'custom1',
        custom2: params.get('utm_medium') || 'custom2',
        custom3: params.get('utm_id') || 3
    };
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
        consents: [{ 
            provider: "CampaignAttribution", 
            purpose: "Tracking", 
            status: "Opt In" 
        }] 
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
                isAnonymous: 0 
            } 
        } 
    }).then(res => {
        console.log('Identity event sent successfully');
    }).catch(err => {
        console.error('Identity event error:', err);
    });
}

// Send identity event with company information
function sendIdentityWithCompany(firstName, lastName, company, email) {
    if (!apiAvailable) return;
    
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
        console.log('Identity event with company info sent successfully');
    }).catch(err => {
        console.error('Identity event error:', err);
    });
}

// Send campaign event with UTM parameters
function sendCampaignEvent() {
    if (!apiAvailable) return;
    
    const utmParams = getUTMParams();
    
    window.SalesforceInteractions.sendEvent({ 
        interaction: { 
            name: "Campaigns Events", 
            eventType: "campaignsEvents", 
            campaignName: utmParams.campaignName, 
            campaignSource: utmParams.campaignSource, 
            campaignContent: utmParams.campaignContent, 
            custom1: utmParams.custom1, 
            custom2: utmParams.custom2, 
            custom3: utmParams.custom3 
        } 
    }).then(res => { 
        console.log('Campaign event sent successfully');
    }).catch(err => { 
        console.error('Campaign event error:', err);
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
        
        // Send campaign event with UTM parameters
        sendCampaignEvent();
        
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

// Handle About link click - MODIFIED: Just track analytics, don't prevent default behavior
if (aboutLink) {
    aboutLink.addEventListener('click', () => {
        // Only send analytics, no preventDefault() to allow normal navigation
        sendNavigationEvent('About Page');
    });
}

// Add active class to current navigation item
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href === currentPage || (currentPage === 'index.html' && href === '')) {
            link.classList.add('active');
        }
    });
});

// Initialize on page load
window.addEventListener('load', () => {
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
});
