import { Feature, MultiPolygon, Polygon } from "geojson";
import { defer, Observable, of, zip } from "rxjs";
import { concatMap, map, tap } from "rxjs/operators";
import { AdministrativeAreaFeature } from "./AdministrativeAreaFeature";
import { isNotNil } from "./validation";
import { unionPolygons } from "./unionPolygons";
import { UnionAdministrativeAreaFeatureCache } from "./UnionAdministrativeAreaFeatureCache";

/**
 * 행정구역 geojson 배열을 key로 변환합니다.
 */
const getCacheKey = (features: AdministrativeAreaFeature[]) =>
  features.map((value) => value.properties.adm_cd);

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
export const memoizedUnionAdministrativeAreaFeature = (
  features: AdministrativeAreaFeature[],
  cache: UnionAdministrativeAreaFeatureCache
): Observable<Feature<Polygon | MultiPolygon> | null> => {
  return defer(() => {
    // 행정구역 geojson 배열로부터 cache key를 얻습니다.
    const cacheKey = getCacheKey(features);
    // 기존 캐시에서 우리가 찾는 cache key의 부분집합인 cache key가 있을경우 최대값을 조회합니다.
    const largestSubKey = cache.findLargestSubKey(cacheKey);
    if (largestSubKey !== undefined) {
      // 부분 혹은 전체 캐시되어 있는 경우

      // 기존 캐시 키를 제외한 나머지 키를 얻습니다.
      const remainingKey = cacheKey.filter(
        (value) => !largestSubKey.includes(value)
      );

      // 나머지 키가 없는경우 전체가 캐시되어있는 경우이므로 바로 캐시 값을 반환합니다.
      if (remainingKey.length === 0) {
        return of(cache.get(largestSubKey));
      }

      // 나머지 키가 있는 경우
      // 나머지 키에 대한 폴리곤 병합결과를 얻어 기존 캐시된 폴리곤 병합결과와 병합하고, 이를 반환합니다.
      return zip(
        of(cache.get(largestSubKey)), // 기존 캐시된 부분 폴리곤 병합결과
        memoizedUnionAdministrativeAreaFeature(
          features.filter((feature) =>
            remainingKey.includes(feature.properties.adm_cd)
          ),
          cache
        ) // 나머지 부분 폴리곤 병합 결과
      ).pipe(
        map((value) => value.filter(isNotNil)),
        concatMap((value) => unionPolygons(value)), // 기존 캐시된 폴리곤과 나머지 부분 폴리곤을 병합
        tap((result) => result && cache.set(cacheKey, result)) // 병합결과를 캐시에 저장합니다.
      );
    }

    // 전혀 캐시되어있지 않은 경우
    if (features.length > 2) {
      // 아이템이 2개 이상인 경우
      // 폴리곤 배열을 2분할하고 각 분할된 배열을 병합한 결과를 병합하고 반환합니다.
      return zip(
        memoizedUnionAdministrativeAreaFeature(
          features.slice(0, features.length / 2),
          cache
        ), // 폴리곤 배열을 반으로 나눈 배열을 병합
        memoizedUnionAdministrativeAreaFeature(
          features.slice(features.length / 2),
          cache
        ) // 나머지 폴리곤 배열을 병합
      ).pipe(
        map((value) => value.filter(isNotNil)),
        concatMap((value) => unionPolygons(value)), // 각 결과를 병합
        tap((result) => result && cache.set(cacheKey, result)) // 병합 결과를 캐시에 저장
      );
    }

    // 아이템이 2개 이하인 경우, 병합하고 캐시에 저장하고 반환합니다.
    return unionPolygons(features).pipe(
      tap((result) => result && cache.set(cacheKey, result))
    );
  });
};
