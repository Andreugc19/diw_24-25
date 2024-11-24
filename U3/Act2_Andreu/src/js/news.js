const iconMenu = document.getElementById('icon-menu');
const mobileNav = document.querySelector('.mobile-nav');
const accessMenuButton = document.getElementById('access-menu-button');
const accessibilityMenu = document.getElementById('accessibility-menu');
const contrastButtons = document.querySelectorAll('.contrast-btn');
const fontSizeSlider = document.getElementById('font-size');
const lineSpacingSlider = document.getElementById('line-spacing');
const wordSpacingSlider = document.getElementById('word-spacing');
const letterSpacingSlider = document.getElementById('letter-spacing');
const resetButton = document.getElementById('reset-btn');

iconMenu.addEventListener('click', () => {
    mobileNav.classList.toggle('hidden');
});

const defaultValues = {
    contrast: '',
    fontSize: '1',
    lineSpacing: '1.73',
    wordSpacing: '0.1',
    letterSpacing: '0',
};

accessMenuButton.addEventListener('click', () => {
    accessibilityMenu.classList.toggle('hidden');
});

contrastButtons.forEach(button => {
    button.addEventListener('click', () => {
        const contrast = button.getAttribute('data-contrast');
        document.body.setAttribute('data-contrast', contrast);
    });
});

fontSizeSlider.addEventListener('input', () => {
    const fontSize = fontSizeSlider.value;
    document.body.style.fontSize = `${fontSize}rem`;
});

lineSpacingSlider.addEventListener('input', () => {
    const lineHeight = lineSpacingSlider.value;
    document.body.style.lineHeight = `${lineHeight}rem`;
});

wordSpacingSlider.addEventListener('input', () => {
    const wordSpacing = wordSpacingSlider.value;
    document.body.style.wordSpacing = `${wordSpacing}rem`;
});

letterSpacingSlider.addEventListener('input', () => {
    const letterSpacing = letterSpacingSlider.value;
    document.body.style.letterSpacing = `${letterSpacing}rem`;
});

resetButton.addEventListener('click', () => {
    document.body.removeAttribute('data-contrast');
    document.body.style.fontSize = `${defaultValues.fontSize}rem`;
    document.body.style.lineHeight = `${defaultValues.lineSpacing}rem`;
    document.body.style.wordSpacing = `${defaultValues.wordSpacing}rem`;
    document.body.style.letterSpacing = `${defaultValues.letterSpacing}rem`;

    fontSizeSlider.value = defaultValues.fontSize;
    lineSpacingSlider.value = defaultValues.lineSpacing;
    wordSpacingSlider.value = defaultValues.wordSpacing;
    letterSpacingSlider.value = defaultValues.letterSpacing;
});