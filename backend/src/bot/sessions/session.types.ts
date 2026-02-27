export type Session = {
  token: string;
  mode?: 'weight' | 'note' | 'notes_list';
  weightPage?: number;
  notesPage?: number;
  pendingWeight?: number;
pendingNote?: string;
 notesList?: {
    id: string;
    title: string;
  }[];
  
notesTotal?: number;
};