import { useContext } from 'react';
import { AuthorContext } from '../contexts/AuthorContext';

export function useAuthors() {
  const context = useContext(AuthorContext);

  if (!context) {
    throw new Error('useAuthors must be used within an AuthorProvider');
  }

  return context;
}