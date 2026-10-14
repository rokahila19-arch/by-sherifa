import {
  faBagShopping,
  faLayerGroup,
  faMitten,
  faPersonDress,
  faPersonWalking,
  faScissors,
  faShirt,
  faShoePrints,
  faVest,
  faVestPatches,
} from '@fortawesome/free-solid-svg-icons';
import { Category } from '../models/product';

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=300&h=300&q=70`;

const TOP = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

/** Palette proposée dans le formulaire d'ajout d'article. */
export const COLOR_PALETTE = [
  { name: 'Noir', hex: '#151515' },
  { name: 'Blanc', hex: '#f7f7f5' },
  { name: 'Beige', hex: '#d9c7a7' },
  { name: 'Gris chiné', hex: '#9a9a9a' },
  { name: 'Crème', hex: '#efe6d2' },
  { name: 'Marron', hex: '#6f4a2f' },
  { name: 'Kaki', hex: '#7a7a4f' },
  { name: 'Bleu marine', hex: '#1f2a44' },
  { name: 'Bleu jean', hex: '#4a6fa5' },
  { name: 'Vert sauge', hex: '#9caf88' },
  { name: 'Rose poudré', hex: '#e9b9c0' },
  { name: 'Rouge', hex: '#c62828' },
];

export const CATEGORIES: Category[] = [
  { slug: 'pulls-sweats', name: 'Pulls & Hoodies oversize', icon: faMitten, image: unsplash('1564557287817-3785e38ec1f5'), sizes: TOP },
  { slug: 't-shirts', name: 'T-shirts neutres', icon: faShirt, image: unsplash('1581655353564-df123a1eb820'), sizes: TOP },
  { slug: 'cargos', name: 'Cargos & Joggings', icon: faPersonWalking, image: unsplash('1511794322962-129ddbd0af38'), sizes: ['S', 'M', 'L', 'XL', 'XXL'] },
  { slug: 'jeans', name: 'Jeans', icon: faScissors, image: unsplash('1715758890151-2c15d5d482aa'), sizes: ['28', '30', '32', '34', '36', '38'] },
  { slug: 'robes', name: 'Robes', icon: faPersonDress, image: unsplash('1496747611176-843222e1e57c'), sizes: TOP },
  { slug: 'tops', name: 'Tops & Chemises', icon: faVest, image: unsplash('1548389995-fbd3151a501f'), sizes: TOP },
  { slug: 'vestes', name: 'Vestes & Blazers', icon: faVestPatches, image: unsplash('1611312449408-fcece27cdbb7'), sizes: TOP },
  { slug: 'ensembles', name: 'Ensembles', icon: faLayerGroup, image: unsplash('1759229874914-c1ffdb3ebd0c'), sizes: TOP },
  { slug: 'chaussures', name: 'Sneakers & Chaussures', icon: faShoePrints, image: unsplash('1597350584914-55bb62285896'), sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'] },
  { slug: 'accessoires', name: 'Sacs & Accessoires', icon: faBagShopping, image: 'https://cdn.dummyjson.com/product-images/womens-bags/prada-women-bag/1.webp' },
];
