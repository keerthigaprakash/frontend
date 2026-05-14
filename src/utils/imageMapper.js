// util/imageMapper.js
import { SOCKET_URL } from '../config';
import flower1 from '../assets/flower1.jpg';
import pl1 from '../assets/pl1.jpg';
import pl2 from '../assets/pl2.jpg';
import pl3 from '../assets/pl3.jpg';
import pl4 from '../assets/pl4.jpg';
import pl5 from '../assets/pl5.jpg';
import pl6 from '../assets/pl6.jpg';
import pl7 from '../assets/pl7.jpg';
import pl8 from '../assets/pl8.jpg';
import pl9 from '../assets/pl9.jpg';
import pl10 from '../assets/pl10.jpg';
import pl11 from '../assets/pl11.jpg';
import cake1 from '../assets/cake1.jpg';
import cake2 from '../assets/cake2.jpg';
import gift1 from '../assets/gift1.jpg';
import c1 from '../assets/c1.jpg';
import c2 from '../assets/c2.jpg';
import ch1 from '../assets/ch1.jpg';
import ch2 from '../assets/ch2.jpg';
import f2 from '../assets/f2.jpg';
import f3 from '../assets/f3.jpg';
import f4 from '../assets/f4.jpg';
import f5 from '../assets/f5.jpg';
import t1 from '../assets/t1.jpg';
import t2 from '../assets/t2.jpg';
import plant from '../assets/plant.avif';
import same from '../assets/same.avif';
import International from '../assets/International.avif';
import sc1 from '../assets/sc1.jpg';
import sc2 from '../assets/sc2.avif';
import sc3 from '../assets/sc3.avif';
import img from '../assets/img.avif';
import cakeHome from '../assets/cake-home.avif';

const imageMap = {
  flower1,
  cake1,
  cake2,
  gift1,
  c1,
  c2,
  ch1,
  ch2,
  f2,
  f3,
  f4,
  f5,
  t1,
  t2,
  plant,
  same,
  International,
  sc1,
  sc2,
  sc3,
  img,
  cakeHome,
  pl1,
  pl2,
  pl3,
  pl4,
  pl5,
  pl6,
  pl7,
  pl8,
  pl9,
  pl10,
  pl11
};

/**
 * Returns the imported image asset for a given key string.
 * Supports both local keys (e.g. 'cake1') and external URLs.
 */
export const getProductImage = (imageKey) => {
  if (!imageKey) return 'https://via.placeholder.com/300x200?text=Product';

  // If it's a full URL (external), return it as is
  if (imageKey.startsWith('http')) {
    return imageKey;
  }

  // If it's an uploaded file (starts with /uploads), prepend the backend URL
  if (imageKey.startsWith('/uploads')) {
    return `${SOCKET_URL}${imageKey}`;
  }

  // Handle data URIs or base64
  if (imageKey.startsWith('data:')) {
    return imageKey;
  }

  // Strip extension for local asset mapping (e.g. 'cake1.jpg' -> 'cake1')
  const key = imageKey.split('.')[0];

  return imageMap[key] || 'https://via.placeholder.com/300x200?text=Product';
};

export default imageMap;
