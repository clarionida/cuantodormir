import type { APIRoute } from 'astro';
import { respuestaManifest } from '../../lib/manifest';

export const GET: APIRoute = () => respuestaManifest('pt');
