export const noteItemButton = (id: string, title: string) => ({
  text: title.slice(0, 30),
  callback_data: `NOTE_OPEN:${id}`
});