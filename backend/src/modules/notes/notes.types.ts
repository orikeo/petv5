export interface CreateNoteDto {
  title: string;
  content?: string;
}

export interface NotesQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  from?: string;
  to?: string;
}