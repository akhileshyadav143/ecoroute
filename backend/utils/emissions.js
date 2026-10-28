// grams of CO2 per km
export const EMISSION_FACTORS = {
  PETROL_CAR: 200,
  BIKE: 80,
  EV: 0,
};

export const isValidVehicle = (v) => Object.prototype.hasOwnProperty.call(EMISSION_FACTORS, v);

export const calculateCO2 = (distanceKm, vehicleType = "PETROL_CAR") => {
  const factor = EMISSION_FACTORS[vehicleType] ?? EMISSION_FACTORS.PETROL_CAR;
  return Math.round(distanceKm * factor);
};

// CO2 saved versus driving the same distance in a petrol car
export const calculateSavings = (distanceKm, vehicleType) =>
  Math.max(0, calculateCO2(distanceKm, "PETROL_CAR") - calculateCO2(distanceKm, vehicleType));
