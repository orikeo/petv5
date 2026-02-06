export type Session = {
  token: string;
  mode?: 'weight' | 'note';
  weightPage?: number;
  notesPage?: number;
};