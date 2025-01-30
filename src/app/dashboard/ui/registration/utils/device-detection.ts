export const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
  
    // Verificación principal usando userAgent (sigue siendo válida)
    const userAgentCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  
    // Verificación de características táctiles (método moderno)
    const hasTouch = 'ontouchstart' in window || 
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  
    // Verificación del tipo de dispositivo usando mediaQueries (método moderno)
    const isMobileQuery = window.matchMedia('(max-device-width: 812px)').matches ||
      window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  
    // Debe cumplir al menos dos de las tres condiciones
    return [userAgentCheck, hasTouch, isMobileQuery].filter(Boolean).length >= 2;
  };