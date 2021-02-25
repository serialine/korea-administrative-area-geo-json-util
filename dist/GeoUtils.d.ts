import { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from "geojson";
import { Coordinates } from "./Coordinates";
/**
 * Position값의 3차원 배열 여부를 반환합니다.
 */
export declare const is3DPosition: (coordinates: Position[][] | Position[][][]) => coordinates is Position[][][];
/**
 * 주어진 Polygon | MultiPolygon geojson을 deep copy 합니다.
 */
export declare const cloneMultiPolygons: (features: Feature<Polygon | MultiPolygon>[]) => Feature<Polygon | MultiPolygon>[];
/**
 * 주어진 geojson을 포함하는 boundbox의 coordinate 배열을 반환합니다.
 */
export declare const getBboxCoordinates: (geoJson: Feature<Polygon | MultiPolygon | null> | FeatureCollection<Polygon | MultiPolygon | null> | null) => Coordinates[];
/**
 * 주어진 중심점을 기준으로 생성한 원을 포함한 BoundingBox의 Coordinates 배열을 구합니다.
 *
 * @param center 중심 위경도
 * @param radiusInMeter 생성할 원의 반지름 (미터 단위)
 */
export declare const getCircleBboxCoordinates: (center: Coordinates, radiusInMeter: number) => Coordinates[];
