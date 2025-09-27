import React from 'react';

interface BrainLogoProps {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

export const BrainLogo: React.FC<BrainLogoProps> = ({ 
  width = 48, 
  height = 48, 
  className = "",
  color = "#4299e1"
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Brain outline with detailed structure */}
      <g stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Main brain outline */}
        <path d="M50 80C45 65 55 50 75 45C85 40 95 45 100 50C105 45 115 40 125 45C145 50 155 65 150 80C155 85 160 95 155 105C160 115 155 125 145 130C150 140 145 150 135 155C140 165 130 175 115 170C110 175 105 175 100 170C95 175 90 175 85 170C70 175 60 165 65 155C55 150 50 140 55 130C45 125 40 115 45 105C40 95 45 85 50 80Z"/>
        
        {/* Left hemisphere details */}
        <path d="M55 70C60 65 70 68 75 75"/>
        <path d="M60 85C65 80 75 83 80 90"/>
        <path d="M55 100C60 95 70 98 75 105"/>
        <path d="M60 115C65 110 75 113 80 120"/>
        <path d="M65 130C70 125 80 128 85 135"/>
        <path d="M70 145C75 140 85 143 90 150"/>
        
        {/* Right hemisphere details */}
        <path d="M145 70C140 65 130 68 125 75"/>
        <path d="M140 85C135 80 125 83 120 90"/>
        <path d="M145 100C140 95 130 98 125 105"/>
        <path d="M140 115C135 110 125 113 120 120"/>
        <path d="M135 130C130 125 120 128 115 135"/>
        <path d="M130 145C125 140 115 143 110 150"/>
        
        {/* Central fissure */}
        <path d="M100 50C100 60 100 70 100 80C100 90 100 100 100 110C100 120 100 130 100 140C100 150 100 160 100 170"/>
        
        {/* Frontal lobe details */}
        <path d="M75 60C80 62 85 65 90 68"/>
        <path d="M110 68C115 65 120 62 125 60"/>
        
        {/* Temporal lobe curves */}
        <path d="M65 90C70 95 75 100 80 105"/>
        <path d="M120 105C125 100 130 95 135 90"/>
        
        {/* Occipital lobe details */}
        <path d="M75 140C80 145 85 148 90 150"/>
        <path d="M110 150C115 148 120 145 125 140"/>
        
        {/* Cerebellum indication */}
        <path d="M85 160C90 165 95 168 100 170C105 168 110 165 115 160"/>
        
        {/* Additional neural pathway suggestions */}
        <path d="M70 75C85 78 90 82 95 85"/>
        <path d="M105 85C110 82 115 78 130 75"/>
        <path d="M70 125C85 122 90 118 95 115"/>
        <path d="M105 115C110 118 115 122 130 125"/>
        
        {/* Subtle connection lines */}
        <path d="M80 70C90 75 95 80 100 85"/>
        <path d="M100 85C105 80 110 75 120 70"/>
        <path d="M80 130C90 125 95 120 100 115"/>
        <path d="M100 115C105 120 110 125 120 130"/>
      </g>
      
      {/* Optional inner glow effect */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
};

// Simple icon version for small sizes
export const BrainIcon: React.FC<BrainLogoProps> = ({ 
  width = 24, 
  height = 24, 
  className = "",
  color = "#4299e1"
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M25 40C22.5 32.5 27.5 25 37.5 22.5C42.5 20 47.5 22.5 50 25C52.5 22.5 57.5 20 62.5 22.5C72.5 25 77.5 32.5 75 40C77.5 42.5 80 47.5 77.5 52.5C80 57.5 77.5 62.5 72.5 65C75 70 72.5 75 67.5 77.5C70 82.5 65 87.5 57.5 85C55 87.5 52.5 87.5 50 85C47.5 87.5 45 87.5 42.5 85C35 87.5 30 82.5 32.5 77.5C27.5 75 25 70 27.5 65C22.5 62.5 20 57.5 22.5 52.5C20 47.5 22.5 42.5 25 40Z"/>
      <path d="M50 25C50 30 50 35 50 40C50 45 50 50 50 55C50 60 50 65 50 70C50 75 50 80 50 85" stroke="white" strokeWidth="1" fill="none"/>
    </svg>
  );
};