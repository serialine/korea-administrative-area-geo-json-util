import { Feature, MultiPolygon, Polygon, Position } from "geojson";
import * as martinez from "martinez-polygon-clipping";
import { from, Observable, of } from "rxjs";
import { concatMap, delay, map, reduce } from "rxjs/operators";
import { polygon, multiPolygon } from "@turf/helpers";
import { is3DPosition } from "./GeoUtils";

type PolygonCoordinates = Position[][] | Position[][][];
/**
 * 주어진 폴리곤 2개를 병합한 결과를 반환합니다.
 */
const union = (
  coordinates1: PolygonCoordinates,
  coordinates2: PolygonCoordinates
): PolygonCoordinates => martinez.union(coordinates1, coordinates2);
/**
 * 주어진 polygon을 union연산을 통해 하나로 병합합니다.
 */
export const unionPolygons = (
  polygons: Feature<Polygon | MultiPolygon>[]
): Observable<Feature<Polygon | MultiPolygon> | null> => {
  // 주어진 polygon이 없을경우 null 반환
  if (polygons.length === 0) return of(null);
  // 주어진 polygon이 1개일 경우 해당 폴리곤을 반환
  if (polygons.length === 1) return of(polygons[0]);

  return from(polygons).pipe(
    // 폴리곤 => 위경도 배열로 매핑
    map((_polygon) => _polygon.geometry.coordinates),
    // 1ms씩 딜레이를 주어 전달 (스레드를 너무 오래 블락하지 않도록)
    concatMap((value) => of(value).pipe(delay(1))),
    // 위경도 배열의 배열을 순회하며 하나로 병합
    reduce<PolygonCoordinates>(
      (acc, value) => (acc === undefined ? value : union(acc, value)),
      undefined
    ),
    // 병합된 위경도 배열을 MultiPolygon Feature혹은 Polygon Feature로 매핑
    map(
      (unionedCoordinates) =>
        (is3DPosition(unionedCoordinates!)
          ? multiPolygon(unionedCoordinates)
          : polygon(unionedCoordinates!)) as Feature<Polygon | MultiPolygon>
    )
  );
};
