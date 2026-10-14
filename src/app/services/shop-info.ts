export const SHOP = {
  name: 'Stock Chine',
  owner: 'by Cherifa',
  phoneBF: '+226 57 49 77 71',
  /** Numéro Orange Money (paiements). */
  orangeMoney: '+226 57 49 77 71',
  phoneCN: '+86 183 3926 7415',
  whatsappBF: '22657497771',
  whatsappCN: '8618339267415',
};

export function whatsappLink(message: string, number = SHOP.whatsappBF): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
