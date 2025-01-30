export interface TollPrice {
    currencyCode: string;
    units: string;
    nanos: number;
  }
  
  export interface TollInfo {
    estimatedPrice: TollPrice[];
  }
  
  export interface RouteResponse {
    routes: Array<{
      legs: Array<{
        travelAdvisory: {
          tollInfo: TollInfo;
        };
      }>;
      distanceMeters: number;
      duration: string;
      travelAdvisory: {
        tollInfo: TollInfo;
      };
    }>;
  }