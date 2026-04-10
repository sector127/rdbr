export interface SessionType {
  id: number;
  courseScheduleId: number;
  name: "online" | "in_person" | "hybrid";
  priceModifier: string;
  availableSeats: number;
  location: string | null;
}
