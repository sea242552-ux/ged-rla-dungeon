const SPEECH_ENABLED = false; // เปลี่ยนเป็น true ใน Phase 2

export function speak(word) {
  if (!SPEECH_ENABLED) return;
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);
}
