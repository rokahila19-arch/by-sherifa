import { inject, Injectable } from '@angular/core';
import { Product } from '../models/product';
import { CatalogService } from './catalog.service';
import {
  BUCKET,
  ProductInput,
  ProductRow,
  productToRow,
  rowToProduct,
  SupabaseService,
} from './supabase.service';

export type AdminProduct = Product & { active: boolean };

const MAX_SIDE = 1400;

/** Réduit une photo de téléphone (souvent 3–8 Mo) à ~150–300 Ko avant l'envoi. */
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.82));
  // Safari iOS ne sait pas encoder le WebP : il renvoie du PNG, on passe alors en JPEG.
  const webp = await toBlob('image/webp');
  if (webp?.type === 'image/webp') return webp;
  const jpeg = await toBlob('image/jpeg');
  if (!jpeg) throw new Error('Impossible de lire cette photo.');
  return jpeg;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly supabase = inject(SupabaseService);
  private readonly catalog = inject(CatalogService);

  get session() {
    return this.supabase.session;
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.requireClient().auth.signInWithPassword({ email, password });
    if (error) throw new Error('E-mail ou mot de passe incorrect.');
    if (!(await this.isAdmin())) {
      await this.signOut();
      throw new Error('Ce compte n\'a pas accès à l\'espace gérante.');
    }
  }

  async signOut(): Promise<void> {
    await this.supabase.requireClient().auth.signOut();
  }

  /** Vrai si l'e-mail connecté figure dans la table `admins`. */
  async isAdmin(): Promise<boolean> {
    await this.supabase.ready;
    if (!this.supabase.client || !this.supabase.session()) return false;
    const { data } = await this.supabase.client.from('admins').select('email').limit(1);
    return !!data?.length;
  }

  async list(): Promise<AdminProduct[]> {
    const { data, error } = await this.supabase
      .requireClient()
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as ProductRow[]).map(rowToProduct);
  }

  async get(id: number): Promise<AdminProduct | null> {
    const { data, error } = await this.supabase
      .requireClient()
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToProduct(data as ProductRow) : null;
  }

  async save(input: ProductInput, id?: number): Promise<number> {
    const table = this.supabase.requireClient().from('products');
    const row = productToRow(input);
    const { data, error } = id
      ? await table.update(row).eq('id', id).select('id').single()
      : await table.insert(row).select('id').single();
    if (error) throw error;
    await this.catalog.refresh();
    return (data as { id: number }).id;
  }

  async setActive(id: number, active: boolean): Promise<void> {
    const { error } = await this.supabase.requireClient().from('products').update({ active }).eq('id', id);
    if (error) throw error;
    await this.catalog.refresh();
  }

  async remove(product: AdminProduct): Promise<void> {
    const client = this.supabase.requireClient();
    const { error } = await client.from('products').delete().eq('id', product.id);
    if (error) throw error;
    const paths = product.images.map((url) => this.storagePath(url)).filter((p): p is string => !!p);
    if (paths.length) await client.storage.from(BUCKET).remove(paths);
    await this.catalog.refresh();
  }

  async uploadImage(file: File): Promise<string> {
    const blob = await compressImage(file);
    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `articles/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const storage = this.supabase.requireClient().storage.from(BUCKET);
    const { error } = await storage.upload(path, blob, { contentType: blob.type, cacheControl: '31536000' });
    if (error) throw error;
    return storage.getPublicUrl(path).data.publicUrl;
  }

  /** Supprime une photo du stockage (seulement si elle y a été envoyée par l'admin). */
  async deleteImage(url: string): Promise<void> {
    const path = this.storagePath(url);
    if (path) await this.supabase.requireClient().storage.from(BUCKET).remove([path]);
  }

  private storagePath(url: string): string | null {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const i = url.indexOf(marker);
    return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length));
  }
}
