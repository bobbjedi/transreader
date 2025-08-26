export function scrollToTop(selector: string = '') {
    const element = document.querySelector(selector);
    element?.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
}