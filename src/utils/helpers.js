export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://via.placeholder.com/300x200';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `http://localhost:8000${imageUrl}`;
}; 