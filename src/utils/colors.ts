export const getContrastText = (hexColor: string | undefined): string => {
    if (!hexColor) return '#172b4d'; // Default dark text for default light background

    // Remove hash
    const hex = hexColor.replace('#', '');

    // Parse r, g, b
    let r = 0, g = 0, b = 0;

    if (hex.length === 3) {
        r = parseInt(hex.substring(0, 1) + hex.substring(0, 1), 16);
        g = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
        b = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else {
        return '#172b4d'; // Fallback
    }

    // YIQ equation
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    return (yiq >= 128) ? '#172b4d' : '#ffffff';
};
