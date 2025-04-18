import * as turf from '@turf/turf';

type Coordinates = [number, number];
type Polygon = Coordinates[];

export default function filterPolygonsInsideMain(polygons: Polygon[], mainPolygon: Polygon): Polygon[] {
    const mainTurfPolygon = turf.polygon([mainPolygon]);
  
    return polygons.filter(polygon => {
      const turfPolygon = turf.polygon([polygon]);

      for (const point of polygon) {
        const turfPoint = turf.point(point);
        if (!turf.booleanPointInPolygon(turfPoint, mainTurfPolygon)) {
          return false; 
        }
      }
  
      return true; 
    });
  }