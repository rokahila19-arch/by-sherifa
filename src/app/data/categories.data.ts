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

export const CATEGORIES: Category[] = [
  { slug: 'pulls-sweats', name: 'Pulls & Hoodies oversize', icon: faMitten, image: unsplash('1564557287817-3785e38ec1f5') },
  { slug: 't-shirts', name: 'T-shirts neutres', icon: faShirt, image: unsplash('1581655353564-df123a1eb820') },
  { slug: 'cargos', name: 'Cargos & Joggings', icon: faPersonWalking, image: unsplash('1511794322962-129ddbd0af38') },
  { slug: 'jeans', name: 'Jeans', icon: faScissors, image: unsplash('1715758890151-2c15d5d482aa') },
  { slug: 'robes', name: 'Robes', icon: faPersonDress, image: unsplash('1496747611176-843222e1e57c') },
  { slug: 'tops', name: 'Tops & Chemises', icon: faVest, image: unsplash('1548389995-fbd3151a501f') },
  { slug: 'vestes', name: 'Vestes & Blazers', icon: faVestPatches, image: unsplash('1611312449408-fcece27cdbb7') },
  { slug: 'ensembles', name: 'Ensembles', icon: faLayerGroup, image: unsplash('1759229874914-c1ffdb3ebd0c') },
  { slug: 'chaussures', name: 'Sneakers & Chaussures', icon: faShoePrints, image: unsplash('1597350584914-55bb62285896') },
  { slug: 'accessoires', name: 'Sacs & Accessoires', icon: faBagShopping, image: 'https://cdn.dummyjson.com/product-images/womens-bags/prada-women-bag/1.webp' },
];
