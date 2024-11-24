const menuIcon = document.querySelector('.menu-icon');
const mobileNav = document.querySelector('.mobile-nav');
const contrastButtons = document.querySelectorAll('.contrast-btn');
const fontSizeSlider = document.getElementById('font-size');
const lineSpacingSlider = document.getElementById('line-spacing');
const wordSpacingSlider = document.getElementById('word-spacing');
const letterSpacingSlider = document.getElementById('letter-spacing');
const accessMenuButton = document.querySelector('.access-menu-button');
const accessibilityMenu = document.querySelector('.accessibility-menu');
const resetButton = document.querySelector('.reset-btn');

const defaultValues = {
    contrast: '',
    fontSize: '1', 
    lineHeight: '1.73', 
    wordSapcing: '0.1',
    letterSpacing: '0'
};

menuIcon.addEventListener('click', function() {
    mobileNav.classList.toggle('active');
});

let currentValues = { ...defaultValues };

accessMenuButton.addEventListener('click', function() {
    accessibilityMenu.classList.toggle('visible');
});

contrastButtons.forEach(button => {
    button.addEventListener('click', () => {
        const contrast = button.getAttribute('data-contrast');
        document.body.setAttribute('data-contrast', contrast);
        currentValues.contrast = contrast;  
    });
});

fontSizeSlider.addEventListener('input', () => {
    const fontSize = fontSizeSlider.value;
    document.body.style.fontSize = fontSize + 'rem'; 
    currentValues.fontSize = fontSize; 
});

lineSpacingSlider.addEventListener('input', () => {
    const lineHeight = lineSpacingSlider.value;
    document.body.style.lineHeight = lineHeight + 'rem';
    currentValues.lineHeight = lineHeight; 
});

wordSpacingSlider.addEventListener('input', () => {
    const wordSpacing = wordSpacingSlider.value;
    document.body.style.wordSpacing = wordSpacing + 'rem'; 
    currentValues.wordSpacing = wordSpacing;  
});

letterSpacingSlider.addEventListener('input', () => {
    const letterSpacing = letterSpacingSlider.value;
    document.body.style.letterSpacing = letterSpacing + 'rem'; 
    currentValues.letterSpacing = letterSpacing;  
});

resetButton.addEventListener('click', () => {
    document.body.removeAttribute('data-contrast');
    currentValues.contrast = defaultValues.contrast;

    document.body.style.fontSize = defaultValues.fontSize + 'rem';
    fontSizeSlider.value = defaultValues.fontSize;
    currentValues.fontSize = defaultValues.fontSize;

    document.body.style.lineHeight = defaultValues.lineHeight + 'rem';
    lineSpacingSlider.value = defaultValues.lineHeight;
    currentValues.lineHeight = defaultValues.lineHeight;

    document.body.style.wordSpacing = defaultValues.wordSpacing + 'rem';
    wordSpacingSlider.value = defaultValues.wordSpacing;
    currentValues.wordSpacing = defaultValues.wordSpacing;

    document.body.style.letterSpacing = defaultValues.letterSpacing + 'rem';
    letterSpacingSlider.value = defaultValues.letterSpacing;
    currentValues.letterSpacing = defaultValues.letterSpacing;
});