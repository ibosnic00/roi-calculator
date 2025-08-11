import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

// Define triggers for different screen sizes
const ANIMATION_TRIGGERS_TABLET = {
    hero: {
        entry: 0,
        exit: 10
    },
    feature1: {
        entry: 350,
        exit: 1200
    },
    feature2: {
        entry: 900,
        exit: 1550
    },
    feature3: {
        entry: 1600,
        exit: 2200
    },
    cta: {
        entry: 2500,
        exit: 3000
    }
};

const ANIMATION_TRIGGERS_DESKTOP = {
    hero: {
        entry: 0,
        exit: 400
    },
    feature1: {
        entry: 400,
        exit: 1000
    },
    feature2: {
        entry: 800,
        exit: 1400
    },
    feature3: {
        entry: 1500,
        exit: 2000
    },
    cta: {
        entry: 2200,
        exit: 3000
    }
};

// Add iPhone triggers
const ANIMATION_TRIGGERS_PHONE = {
    hero: {
        entry: 0,
        exit: 400
    },
    feature1: {
        entry: 400,
        exit: 1000
    },
    feature2: {
        entry: 900,
        exit: 1700
    },
    feature3: {
        entry: 1500,
        exit: 2200
    },
    cta: {
        entry: 2500,
        exit: 3500
    }
};

export function HomePage() {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [animationTriggers, setAnimationTriggers] = useState(ANIMATION_TRIGGERS_DESKTOP);
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            if (width <= 450) { // iPhone 13 Pro Max width and below
                setAnimationTriggers(ANIMATION_TRIGGERS_PHONE);
            } else if (height <= 1360) { // iPad
                setAnimationTriggers(ANIMATION_TRIGGERS_DESKTOP);
            } else {
                setAnimationTriggers(ANIMATION_TRIGGERS_TABLET);
            }
        };

        // Initial check
        handleResize();

        // Add resize listener
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const position = window.scrollY;
            setScrollPosition(position);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const calculateOpacity = (start: number, end: number, includeExit = false) => {
        const entryProgress = Math.min(Math.max((scrollPosition - start) / (end - start), 0), 1);
        if (!includeExit) return entryProgress;

        const exitPoint = end + 200;
        const exitProgress = Math.min(Math.max((scrollPosition - exitPoint) / 300, 0), 1);
        return entryProgress * (1 - exitProgress);
    };

    const calculateTransform = (
        start: number,
        end: number,
        property: 'scale' | 'rotate' | 'translateY',
        featureIndex: 1 | 2 | 3
    ) => {
        const progress = calculateOpacity(start, end, true);
        switch (property) {
            case 'scale':
                switch (featureIndex) {
                    case 1: return 0.8 + (progress * 0.2);
                    case 2: return 1.2 - (progress * 0.2);
                    case 3: return 0.9 + (progress * 0.1);
                }
            case 'rotate':
                switch (featureIndex) {
                    case 1: return 10 - (progress * 10);
                    case 2: return -10 + (progress * 10);
                    case 3: return 5 - (progress * 5);
                }
            case 'translateY':
                switch (featureIndex) {
                    case 1: return 50 - (progress * 50) + (1 - progress) * 30;
                    case 2: return -50 + (progress * 50) + (1 - progress) * 30;
                    case 3: return 30 - (progress * 30) + (1 - progress) * 30;
                }
        }
    };

    return (
        <div className="homepage">
            <section className="hero-section">
                <div 
                    className="hero-content fade-in" 
                    style={{
                        opacity: calculateOpacity(
                            animationTriggers.hero.entry,
                            animationTriggers.hero.exit,
                            true
                        ) 
                    }}
                >
                    <h1>
                        <span className="animate-text">Calculate</span>
                        <span className="animate-text">Compare</span>
                        <span className="animate-text">Invest</span>
                    </h1>
                    <p className="subtitle">Make informed real estate decisions in Croatia</p>
                    <button className="cta-button" onClick={() => navigate('/calculator')}>
                        Start Calculating
                    </button>
                </div>
            </section>

            <section className="features-section">
                <div className="feature-row">
                    <img
                        src="/mockups/iphone-home1-portrait.png"
                        alt="Table View"
                        className="feature-image"
                        style={{
                            opacity: calculateOpacity(
                                animationTriggers.feature1.entry,
                                animationTriggers.feature1.exit,
                                true
                            ),
                            transform: `
                scale(${calculateTransform(
                                animationTriggers.feature1.entry,
                                animationTriggers.feature1.exit,
                                'scale',
                                1
                            )})
                rotate(${calculateTransform(
                                animationTriggers.feature1.entry,
                                animationTriggers.feature1.exit,
                                'rotate',
                                1
                            )}deg)
                translateY(${calculateTransform(
                                animationTriggers.feature1.entry,
                                animationTriggers.feature1.exit,
                                'translateY',
                                1
                            )}px)
              `
                        }}
                    />
                    <div
                        className="feature-text"
                        style={{
                            opacity: calculateOpacity(
                                animationTriggers.feature1.entry,
                                animationTriggers.feature1.exit,
                                true
                            ),
                            transform: `translateY(${calculateTransform(
                                animationTriggers.feature1.entry,
                                animationTriggers.feature1.exit,
                                'translateY',
                                1
                            )}px)`
                        }}
                    >
                        <h2>Detailed Analysis</h2>
                        <p>Compare properties with comprehensive metrics including ROI, maintenance costs, and expected appreciation.</p>
                    </div>
                </div>

                <div className="feature-row reverse">
                    <img
                        src="/mockups/iphone-home2-left.png"
                        alt="Graph View"
                        className="feature-image"
                        style={{
                            opacity: calculateOpacity(
                                animationTriggers.feature2.entry,
                                animationTriggers.feature2.exit,
                                true
                            ),
                            transform: `
                scale(${calculateTransform(
                                animationTriggers.feature2.entry,
                                animationTriggers.feature2.exit,
                                'scale',
                                2
                            )})
                rotate(${calculateTransform(
                                animationTriggers.feature2.entry,
                                animationTriggers.feature2.exit,
                                'rotate',
                                2
                            )}deg)
                translateY(${calculateTransform(
                                animationTriggers.feature2.entry,
                                animationTriggers.feature2.exit,
                                'translateY',
                                2
                            )}px)
              `
                        }}
                    />
                    <div
                        className="feature-text"
                        style={{
                            opacity: calculateOpacity(
                                animationTriggers.feature2.entry,
                                animationTriggers.feature2.exit,
                                true
                            ),
                            transform: `translateY(${calculateTransform(
                                animationTriggers.feature2.entry,
                                animationTriggers.feature2.exit,
                                'translateY',
                                2
                            )}px)`
                        }}
                    >
                        <h2>Visual Insights</h2>
                        <p>Track your investment potential over time with interactive graphs and S&P 500 comparisons.</p>
                    </div>
                </div>

                <div className="feature-row">
                    <img
                        src="/mockups/web-home-front.png"
                        alt="Tile View"
                        className="feature-image1"
                        style={{
                            opacity: calculateOpacity(
                                animationTriggers.feature3.entry,
                                animationTriggers.feature3.exit,
                                true
                            ),
                            transform: `
                scale(${calculateTransform(
                                animationTriggers.feature3.entry,
                                animationTriggers.feature3.exit,
                                'scale',
                                3
                            )})
                rotate(${calculateTransform(
                                animationTriggers.feature3.entry,
                                animationTriggers.feature3.exit,
                                'rotate',
                                3
                            )}deg)
                translateY(${calculateTransform(
                                animationTriggers.feature3.entry,
                                animationTriggers.feature3.exit,
                                'translateY',
                                3
                            )}px)
              `
                        }}
                    />
                    <div
                        className="feature-text"
                        style={{
                            opacity: calculateOpacity(
                                animationTriggers.feature3.entry,
                                animationTriggers.feature3.exit,
                                true
                            ),
                            transform: `translateY(${calculateTransform(
                                animationTriggers.feature3.entry,
                                animationTriggers.feature3.exit,
                                'translateY',
                                3
                            )}px)`
                        }}
                    >
                        <h2>Flexible Views</h2>
                        <p>Switch between table and tile views to analyze your properties in the way that works best for you.</p>
                    </div>
                </div>
            </section>

            <section className="cta-section">
                <div
                    className="cta-content"
                    style={{
                        opacity: calculateOpacity(
                            animationTriggers.cta.entry,
                            animationTriggers.cta.exit,
                            true
                        )
                    }}
                >
                    <h2>Ready to Start?</h2>
                    <p>Begin analyzing your real estate investments today.</p>
                    <button className="cta-button" onClick={() => navigate('/calculator')}>
                        Open Calculator
                    </button>
                </div>
            </section>
        </div>
    );
} 