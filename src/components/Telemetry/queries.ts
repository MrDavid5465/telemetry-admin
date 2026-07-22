import gql from "graphql-tag"

export const TELEMETRY_SUB = gql`
  subscription telemetry {
    telemetry {
      simStatus
      simon
      car
      track
      driver

      gLat
      gLon
      gVert
      pitch
      roll

      speed
      rpm
      maxRpm
      gear
      throttle
      brake
      clutch
      steering
      abs
      brakeBias

      fuel
      fuelCapacity
      turboBoost

      tyres {
        temp
        pressure
        slipRatio
        wear
        brakeTemp
      }

      airTemp
      trackTemp

      lap
      position
      numCars
      courseFlag
      lapIsValid
      inPit
      currentLapSeconds
      lastLapSeconds
    }
  }
`;

export const TELEMETRY_SNAPSHOT = gql`
  query TelemetrySnapshot {
    telemetrySnapshot {
      simStatus
      car
    }
  }
`;

const dispatcher = {
  telemetry: TELEMETRY_SUB
}
export default dispatcher