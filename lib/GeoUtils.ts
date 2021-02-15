import {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
  Position,
} from "geojson";
import * as turf from "@turf/turf";
import { Coordinates } from "./Coordinates";
import { unionAdministrativeAreaFeatureCache } from "./memoizedUnionAdministrativeAreaFeature";

/**
 * Position값의 3차원 배열 여부를 반환합니다.
 */
export const is3DPosition = (
  coordinates: Position[][] | Position[][][]
): coordinates is Position[][][] => {
  return Array.isArray(coordinates[0][0][0]);
};

let unionAdministrativeAreaFeatureCacheInitCounter = 0;

export const initUnionAdministrativeAreaFeatureCache = () => {
  // eslint-disable-next-line no-plusplus
  unionAdministrativeAreaFeatureCacheInitCounter++;
};

// 캐시 초기화
export const clearUnionAdministrativeAreaFeatureCache = () => {
  // eslint-disable-next-line no-plusplus
  unionAdministrativeAreaFeatureCacheInitCounter--;
  if (unionAdministrativeAreaFeatureCacheInitCounter === 0) {
    unionAdministrativeAreaFeatureCache.clear();
  }
};

/**
 * 주어진 Polygon | MultiPolygon geojson을 deep copy 합니다.
 */
export const cloneMultiPolygons = (
  features: Feature<Polygon | MultiPolygon>[]
): Feature<Polygon | MultiPolygon>[] =>
  features.map((feature) => turf.clone(feature));

/**
 * 주어진 geojson을 포함하는 boundbox의 coordinate 배열을 반환합니다.
 */
export const getBboxCoordinates = (
  geoJson:
    | Feature<Polygon | MultiPolygon | null>
    | FeatureCollection<Polygon | MultiPolygon | null>
    | null
): Coordinates[] => {
  // 주어진 GeoJSON이 없을경우 빈 배열을 반환
  if (geoJson === null) return [];

  // 주어진 GeoJSON의 bounding box를 구함 (위도, 경도가 번갈아가며 놓인 배열)
  return (
    turf
      .bbox(geoJson)
      // bounding box를 순회하며 위도 경도가 한쌍인 이차원 배열로 변환
      .reduce<[number, number][]>((result, value, index, array) => {
        if (index % 2 === 0)
          result.push(array.slice(index, index + 2) as [number, number]);
        return result;
      }, [])
      // 위도, 경도를 Coordinates 매핑
      .map<Coordinates>(([lng, lat]) => ({
        lat,
        lng,
      }))
  );
};

/**
 * 주어진 중심점을 기준으로 생성한 원을 포함한 BoundingBox의 Coordinates 배열을 구합니다.
 *
 * @param center 중심 위경도
 * @param radiusInMeter 생성할 원의 반지름 (미터 단위)
 */
export const getCircleBboxCoordinates = (
  center: Coordinates,
  radiusInMeter: number
): Coordinates[] => {
  const feature = turf.circle([center.lng, center.lat], radiusInMeter, {
    units: "meters",
  });
  return getBboxCoordinates(feature);
};
