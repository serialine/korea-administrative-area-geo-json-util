import { Feature, MultiPolygon, Polygon } from "geojson";
import { Observable } from "rxjs";
/**
 * 주어진 polygon을 union연산을 통해 하나로 병합합니다.
 */
export declare const unionPolygons: (polygons: Feature<Polygon | MultiPolygon>[]) => Observable<Feature<Polygon | MultiPolygon> | null>;
