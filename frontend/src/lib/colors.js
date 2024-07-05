export function hashStringToColor(str) {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert hash to hex color
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }

    // Ensure the color is readable on both white and black backgrounds
    const hexColor = color.substring(1); // Remove the '#' character
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    const yiq = (r*299 + g*587 + b*114) / 1000;
    return yiq >= 128 ? darkenColor(color) : lightenColor(color);
}

function lightenColor(color) {
  // Lighten the color
  let num = parseInt(color.slice(1), 16);
  num = Math.min(num + 0x303030, 0xFFFFFF);
  return '#' + num.toString(16).padStart(6, '0');
}

function darkenColor(color) {
  // Darken the color
  let num = parseInt(color.slice(1), 16);
  num = Math.max(num - 0x303030, 0x000000);
  return '#' + num.toString(16).padStart(6, '0');
}
