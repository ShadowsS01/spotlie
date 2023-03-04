export function musicTimeFormatter(timeOriginal) {
  const min = Math.floor(timeOriginal / 60);
  const sec = Math.floor(timeOriginal % 60);

  const minFormatted = min.toString().padStart(2, "0");
  const secFormatted = sec.toString().padStart(2, "0");

  return `${minFormatted}:${secFormatted}`;
}
