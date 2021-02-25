import { Feature, MultiPolygon, Polygon } from "geojson";
import { Observable } from "rxjs";
import { AdministrativeAreaFeature } from "./AdministrativeAreaFeature";
import { UnionAdministrativeAreaFeatureCache } from "./UnionAdministrativeAreaFeatureCache";
/**
 * 행정구역 geojson 배열을 인자로 받아
 * 메모아이즈된 폴리곤 병합 결과를 반환합니다.
 *
 * 분할 정복 기법을 사용하여 주어진 인자를 재귀적으로 이등분할하여 계산하고 각 결과를 캐시합니다.
 *
 * ex) 주어진 인자가 [1,2,3,4] 일때
 * [1,2], [3,4], [1,2,3,4] 의 계산결과를 캐시
 *
 * @param features
 */
export declare const memoizedUnionAdministrativeAreaFeature: (features: AdministrativeAreaFeature[], cache: UnionAdministrativeAreaFeatureCache) => Observable<Feature<Polygon | MultiPolygon> | null>;
