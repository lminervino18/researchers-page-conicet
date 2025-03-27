export const generateColorPalette = () => {
    const colors = [
      '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', 
      '#f1c40f', '#e67e22', '#e74c3c', '#2c3e50', '#16a085', 
      '#27ae60', '#2980b9', '#8e44ad', '#f39c12', '#d35400', 
      '#c0392b', '#7f8c8d', '#2874a6', '#117864', '#8e44ad'
    ];
    return colors;
  };
  
  export const getColorForName = (name: string) => {
    const colors = generateColorPalette();
    const hash = name.split('').reduce((acc, char) => 
      char.charCodeAt(0) + ((acc << 5) - acc), 0);
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  export const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0].toUpperCase())
      .join('')
      .substring(0, 2);
  };