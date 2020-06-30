export class HurrierOrder implements HurrierOrder {}

export interface IHurrierOrder {
  order_id: string;
  promised_delivery_at: string;
  committed_pickup_at: string;
  preparation_time: number;
  timestamp: string;
  model_prediction_lower_bound_minutes: number;
  model_prediction_median_bound_minutes: number;
  model_prediction_upper_bound_minutes: number;
  model_prediction_dispatch_remaining_time: number;
  events: Event[];
  deliveries: Delivery[];
}

export interface Event {
  name: string;
  timestamp: string;
}

export interface Delivery {
  id: number;
  order_id: string;
  timestamp: string;
  primary_delivery: boolean;
  pickup_location: PickupLocation;
  dropoff_location: DropoffLocation;
  courier: Courier;
  courier_events: CourierEvent[];
  estimated_pickup_times: EstimatedPickupTime[];
  estimated_dropoff_times: EstimatedDropoffTime[];
}

export interface PickupLocation {
  latitude: number;
  longitude: number;
}

export interface DropoffLocation {
  latitude: number;
  longitude: number;
}

export interface Courier {
  id: number;
  timestamp: string;
  name: string;
  phone_number: string;
  vehicle_type: string;
  contract_type: string;
  locations: Location[];
  route_actions: RouteAction[];
}

export interface Location {
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface RouteAction {
  type: string;
  delivery_id: number;
  vendor_id: string;
  arriving_at: string;
  leaving_at: string;
  location: Location2;
}

export interface Location2 {
  latitude: number;
  longitude: number;
}

export interface CourierEvent {
  name: string;
  timestamp: string;
}

export interface EstimatedPickupTime {
  arriving_at: string;
  leaving_at: string;
  timestamp: string;
}

export interface EstimatedDropoffTime {
  arriving_at: string;
  leaving_at: string;
  timestamp: string;
}
