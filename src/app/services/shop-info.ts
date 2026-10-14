export const SHOP = {
  name: 'Stock Chine',
  owner: 'by Cherifa',
  phoneBF: '+226 02 73 93 92',
  phoneCN: '+86 183 3926 7415',
  whatsappBF: '22602739392',
  whatsappCN: '8618339267415',
};

export function whatsappLink(message: string, number = SHOP.whatsappBF): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
