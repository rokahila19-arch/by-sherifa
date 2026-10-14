function o(n,t){try{let r=localStorage.getItem(n);return r?JSON.parse(r):t}catch{return t}}function e(n,t){try{localStorage.setItem(n,JSON.stringify(t))}catch{}}export{o as a,e as b};
