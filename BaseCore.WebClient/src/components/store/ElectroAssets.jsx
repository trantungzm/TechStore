import { useEffect } from 'react';

const ELECTRO_CAROUSEL_INTERVAL = 5000;
const ELECTRO_CAROUSEL_TRANSITION = 2000;

const ElectroAssets = () => {
    useEffect(() => {
        const previousBodyClass = document.body.className;
        document.body.className = 'electro-body';

        return () => {
            document.body.className = previousBodyClass || 'hold-transition sidebar-mini';
        };
    }, []);

    useEffect(() => {
        const reveal = (element) => {
            const delay = element.getAttribute('data-wow-delay');
            if (delay) {
                element.style.animationDelay = delay;
            }
            element.classList.add('animated');
            element.style.visibility = 'visible';
        };

        const getWowElements = (root = document) => {
            const elements = [];
            if (root instanceof Element && root.matches('.wow')) {
                elements.push(root);
            }
            if (root.querySelectorAll) {
                elements.push(...Array.from(root.querySelectorAll('.wow')));
            }
            return elements;
        };

        if (!('IntersectionObserver' in window)) {
            getWowElements().forEach(reveal);

            const mutationObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        getWowElements(node).forEach(reveal);
                    });
                });
            });

            mutationObserver.observe(document.body, { childList: true, subtree: true });
            return () => mutationObserver.disconnect();
        }

        const observedElements = new WeakSet();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    reveal(entry.target);
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
        );

        const observeWowElements = (root = document) => {
            getWowElements(root).forEach((element) => {
                if (observedElements.has(element)) return;
                observedElements.add(element);
                observer.observe(element);
            });
        };

        observeWowElements();

        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    observeWowElements(node);
                });
            });
        });

        mutationObserver.observe(document.body, { childList: true, subtree: true });

        return () => {
            observer.disconnect();
            mutationObserver.disconnect();
        };
    }, []);

    useEffect(() => {
        const carousels = Array.from(document.querySelectorAll('.carousel.slide'));
        const timers = [];
        const transitionTimers = [];
        const cleanupHandlers = [];

        carousels.forEach((carousel) => {
            const items = Array.from(carousel.querySelectorAll('.carousel-item'));
            if (items.length <= 1) return;
            let isTransitioning = false;
            let intervalId = null;

            const setActive = (nextIndex) => {
                if (isTransitioning) return;

                const currentIndex = items.findIndex((item) => item.classList.contains('active'));
                const safeCurrent = currentIndex >= 0 ? currentIndex : 0;
                const safeNext = (nextIndex + items.length) % items.length;
                if (safeCurrent === safeNext) return;

                isTransitioning = true;
                items[safeCurrent]?.classList.remove('active');
                items[safeNext]?.classList.add('active');

                const transitionTimer = window.setTimeout(() => {
                    isTransitioning = false;
                }, ELECTRO_CAROUSEL_TRANSITION);
                transitionTimers.push(transitionTimer);
            };

            const move = (direction) => {
                const currentIndex = items.findIndex((item) => item.classList.contains('active'));
                const safeCurrent = currentIndex >= 0 ? currentIndex : 0;
                setActive(direction === 'prev' ? safeCurrent - 1 : safeCurrent + 1);
            };

            const restartAutoplay = () => {
                if (intervalId) {
                    window.clearInterval(intervalId);
                }
                intervalId = window.setInterval(() => move('next'), ELECTRO_CAROUSEL_INTERVAL);
                timers.push(intervalId);
            };

            restartAutoplay();

            Array.from(carousel.querySelectorAll('[data-bs-slide], [data-slide]')).forEach((control) => {
                const handler = (event) => {
                    event.preventDefault();
                    move(control.getAttribute('data-bs-slide') || control.getAttribute('data-slide'));
                    restartAutoplay();
                };
                control.addEventListener('click', handler);
                cleanupHandlers.push(() => control.removeEventListener('click', handler));
            });
        });

        return () => {
            timers.forEach((timer) => window.clearInterval(timer));
            transitionTimers.forEach((timer) => window.clearTimeout(timer));
            cleanupHandlers.forEach((cleanup) => cleanup());
        };
    }, []);

    return null;
};

export default ElectroAssets;
