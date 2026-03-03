import { apiFetch } from "./api";

export interface Usuario {
  id_user: number;
  name_user: string;
  email_user: string;
  matricula_user: number | null;
  id_rol: number;
  rol: string;
  division?: string;
  planta?: string;
  edificio?: string;
}

export interface UsuarioCreate {
  name_user: string;
  email_user: string;
  pass_user: string;
  matricula_user: number;
  id_rol: number;
  id_division?: number;
  planta_profe?: string;
  id_building?: number;
}

export interface UsuarioUpdate {
  name_user?: string;
  email_user?: string;
  matricula_user?: number;
  id_rol?: number;
}

export function getUsuarios() {
  return apiFetch("/usuarios");
}

export function createProfesor(data: UsuarioCreate) {
  return apiFetch("/register-profesor", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateUsuario(id: number, data: UsuarioUpdate) {
  return apiFetch(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteUsuario(id: number) {
  return apiFetch(`/usuarios/${id}`, {
    method: "DELETE",
  });
}

export function getDivisiones() {
  return apiFetch("/divisiones");
}

export function getEdificiosList() {
  return apiFetch("/edificios-list");
}
