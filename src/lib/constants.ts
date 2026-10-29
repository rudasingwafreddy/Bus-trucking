// Kigali Geographic Constants & Demo Data

export const KIGALI_CENTER: [number, number] = [-1.9441, 30.0619]; // Kigali, Rwanda
export const DEFAULT_MAP_ZOOM = 13;

// Default demo routes with authentic Kigali road corridors
// Route 101: Nyabugogo -> Kacyiru -> Kigali Heights (Kimihurura) -> Gishushu -> Remera
export const ROUTE_101_COORDINATES: [number, number][] = [
  [-1.9392, 30.0442], // Nyabugogo Terminal
  [-1.9380, 30.0520], // Gitikinyoni approach
  [-1.9405, 30.0650], // Kinamba junction
  [-1.9415, 30.0760], // Kacyiru south
  [-1.9415, 30.0880], // Kacyiru Executive Stop
  [-1.9480, 30.0905], // Ministry of Defence
  [-1.9542, 30.0924], // Kigali Heights / KCC
  [-1.9568, 30.1035], // Gishushu / RDB
  [-1.9590, 30.1110], // Prince House Remera
  [-1.9612, 30.1178], // Remera Bus Park (Gare)
];

// Route 102: Downtown (CBD) -> Kigali Heights -> Gishushu -> Kimironko
export const ROUTE_102_COORDINATES: [number, number][] = [
  [-1.9441, 30.0592], // Downtown Bus Park
  [-1.9470, 30.0690], // Kiyovu / Serena approach
  [-1.9520, 30.0820], // Kimihurura roundabout
  [-1.9542, 30.0924], // Kigali Heights
  [-1.9568, 30.1035], // Gishushu
  [-1.9500, 30.1150], // Kibagabaga junction
  [-1.9398, 30.1265], // Kimironko Bus Park
];

// Route 103: Remera -> Sonatubes -> Kanombe Airport
export const ROUTE_103_COORDINATES: [number, number][] = [
  [-1.9612, 30.1178], // Remera Bus Park
  [-1.9640, 30.1050], // Giporoso
  [-1.9680, 30.0890], // Sonatubes
  [-1.9750, 30.1100], // Kabeza
  [-1.9655, 30.1340], // Kanombe Airport Approach
];

// Route 201: Downtown -> Nyamirambo / Kicukiro
export const ROUTE_201_COORDINATES: [number, number][] = [
  [-1.9441, 30.0592], // Downtown
  [-1.9530, 30.0650], // Muhima
  [-1.9680, 30.0890], // Sonatubes
  [-1.9780, 30.0950], // Rwandex
  [-1.9860, 30.1020], // Kicukiro Centre
];
