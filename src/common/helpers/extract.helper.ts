export const extractCourseName = (courseName: string) => {
  // Remove special characters and split the name into words
  const words = courseName.replace(/[^\w\s]/g, '_').split(/\s+/);

  // Check if 'Course' is present, and if so, extract the word before it
  const courseIndex = words.findIndex((word) => word.toLowerCase() === 'course');

  if (courseIndex !== -1) {
    return words.slice(0, courseIndex).join(' ').toLowerCase(); // Join the words with space
  }

  return words.slice(0, 4).join(' ').toLowerCase(); // Join the first four words with space
};
