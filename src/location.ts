export const coordinates: Record<string, [number, number]> = {
  Rabat: [34.0209, -6.8416],
  Casablanca: [33.5731, -7.5898],
  Marrakech: [31.6295, -7.9811],
  Fès: [34.0331, -5.0003],
  Tanger: [35.7595, -5.834],
  Agadir: [30.4278, -9.5981],
  Salé: [34.0531, -6.7985],
  Meknès: [33.8935, -5.5473],
  Oujda: [34.6814, -1.9086],
  Kénitra: [34.261, -6.5802],
  Tétouan: [35.5785, -5.3684],
  Safi: [32.2994, -9.2372],
  "El Jadida": [33.2316, -8.5007],
  "Béni Mellal": [32.3373, -6.3498],
  Nador: [35.1686, -2.9276],
  Taza: [34.2133, -4.01],
  Settat: [33.001, -7.6166],
  Khouribga: [32.8811, -6.9063],
  Mohammedia: [33.6861, -7.383],
  "Al Hoceïma": [35.2517, -3.9372],
  Larache: [35.1932, -6.1557],
  "Ksar El Kébir": [35.0004, -5.9034],
  Essaouira: [31.5085, -9.7595],
  Ouarzazate: [30.9189, -6.8934],
  Errachidia: [31.9314, -4.4244],
  Ifrane: [33.5228, -5.1109],
  Azrou: [33.4344, -5.2213],
  Chefchaouen: [35.1688, -5.2636],
  Taroudant: [30.4703, -8.8769],
  Tiznit: [29.6974, -9.7316],
  Guelmim: [28.987, -10.0574],
  Laâyoune: [27.1536, -13.2033],
  Dakhla: [23.6848, -15.957],
  "Tan-Tan": [28.438, -11.1032],
  "Sidi Kacem": [34.2215, -5.7075],
  "Sidi Slimane": [34.2646, -5.9256],
  "El Kelaâ des Sraghna": [32.0592, -7.4006],
  Berkane: [34.92, -2.32],
  Saïdia: [35.0833, -2.2333],
};
export const cities = Object.keys(coordinates);
export function nearestCity(latitude: number, longitude: number) {
  const rad = (v: number) => (v * Math.PI) / 180;
  return cities
    .map((city) => {
      const [lat, lon] = coordinates[city];
      const a =
        Math.sin(rad(lat - latitude) / 2) ** 2 +
        Math.cos(rad(latitude)) *
          Math.cos(rad(lat)) *
          Math.sin(rad(lon - longitude) / 2) ** 2;
      return {
        city,
        distance:
          6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a))),
      };
    })
    .sort((a, b) => a.distance - b.distance)[0];
}
