export function afterPrayer(time: string, duration: number) {
  const minutes = Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5)) + duration;
  return {time: `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`, nextDay: minutes >= 1440};
}
export function activityCapacity(totalMinutes: number, prayerMinutes: number) {
  return Math.max(0, totalMinutes - prayerMinutes);
}
