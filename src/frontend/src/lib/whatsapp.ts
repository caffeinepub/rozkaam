export function openWhatsAppChat(phone: string): void {
  const url = `https://wa.me/91${phone}`;
  window.open(url, '_blank');
}
