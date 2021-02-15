import LRU from "lru-cache";
import { Feature, MultiPolygon, Polygon } from "geojson";
import { defer, Observable, of, zip } from "rxjs";
import { concatMap, map, tap } from "rxjs/operators";
import { AdministrativeAreaFeature } from "./AdministrativeAreaFeature";
import { isNotNil } from "./validation";
import { unionPolygons } from "./unionPolygons";

/**
 * 행정구역 geojson 배열을 key로 변환합니다.
 */
const getCacheKey = (features: AdministrativeAreaFeature[]) =>
  features.map((value) => value.properties.adm_cd);

/**
 * 행정구역 geojson 캐시
 * key: 행정구역 id 배열
 * value: key에 해당하는 행정구역 폴리곤들의 병합 결과
 *
 * 캐시 갯수가 200건이 넘어갈 경우 LRU 알고리즘에 따라 기존 캐시를 제거하여 최대 200건을 유지합니다.
 */
class UnionAdministrativeAreaFeatureCache {
  private cache = new LRU<string, Feature<Polygon | MultiPolygon>>(200); // 캐시

  private keys: string[][] = [];

  /**
   * 행정구역 id 배열을 key로 사용하기 위해 string으로 serialize 합니다.
   */
  private serializeKey = (administrativeAreaIds: string[]) =>
    administrativeAreaIds.sort().join(";");

  /**
   * 캐시에 저장합니다.
   * @param key {AdministrativeArea.id} 배열
   * @param feature 폴리곤 병합 결과
   */
  set = (key: string[], feature: Feature<Polygon | MultiPolygon>) => {
    const serializedKey = this.serializeKey(key);
    this.cache.set(serializedKey, feature);
    this.keys = this.cache.keys().map((value) => value.split(";"));
  };

  /**
   * 캐시를 가져옵니다.
   * @param key {AdministrativeArea.id} 배열
   */
  get = (key: string[]): Feature<Polygon | MultiPolygon> | null => {
    const serializedKey = this.serializeKey(key);
    return this.cache.get(serializedKey) || null;
  };

  /**
   * 주어진 key (행정구역 id 배열)의 부분집합이며 동시에 최대 크기인 key를 찾아 반환합니다.
   *
   * ex) 주어진 key가 [1,2,3,4,5] 일때
   * 기존 cache에 [1,2], [2,4,5], [2,3,4,5,6,7,8] 이 key로 저장되어있었다면
   * [2,4,5]를 반환합니다.
   */
  findLargestSubKey = (targetKey: string[]) => {
    return this.keys
      .filter((key) => key.length <= targetKey.length)
      .sort((a, b) => b.length - a.length)
      .find((key) => key.every((value) => targetKey.includes(value)));
  };

  /**
   * 캐시를 초기화합니다.
   */
  clear = () => {
    this.cache.reset();
    this.keys = [];
  };
}

// 행정구역 geojson 캐시 인스턴스
export const unionAdministrativeAreaFeatureCache = new UnionAdministrativeAreaFeatureCache();
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
  features: AdministrativeAreaFeature[]
): Observable<Feature<Polygon | MultiPolygon> | null> => {
  return defer(() => {
    // 행정구역 geojson 배열로부터 cache key를 얻습니다.
    const cacheKey = getCacheKey(features);
    // 기존 캐시에서 우리가 찾는 cache key의 부분집합인 cache key가 있을경우 최대값을 조회합니다.
    const largestSubKey = unionAdministrativeAreaFeatureCache.findLargestSubKey(
      cacheKey
    );
    if (largestSubKey !== undefined) {
      // 부분 혹은 전체 캐시되어 있는 경우

      // 기존 캐시 키를 제외한 나머지 키를 얻습니다.
      const remainingKey = cacheKey.filter(
        (value) => !largestSubKey.includes(value)
      );

      // 나머지 키가 없는경우 전체가 캐시되어있는 경우이므로 바로 캐시 값을 반환합니다.
      if (remainingKey.length === 0) {
        return of(unionAdministrativeAreaFeatureCache.get(largestSubKey));
      }

      // 나머지 키가 있는 경우
      // 나머지 키에 대한 폴리곤 병합결과를 얻어 기존 캐시된 폴리곤 병합결과와 병합하고, 이를 반환합니다.
      return zip(
        of(unionAdministrativeAreaFeatureCache.get(largestSubKey)), // 기존 캐시된 부분 폴리곤 병합결과
        memoizedUnionAdministrativeAreaFeature(
          features.filter((feature) =>
            remainingKey.includes(feature.properties.adm_cd)
          )
        ) // 나머지 부분 폴리곤 병합 결과
      ).pipe(
        map((value) => value.filter(isNotNil)),
        concatMap((value) => unionPolygons(value)), // 기존 캐시된 폴리곤과 나머지 부분 폴리곤을 병합
        tap(
          (result) =>
            result && unionAdministrativeAreaFeatureCache.set(cacheKey, result)
        ) // 병합결과를 캐시에 저장합니다.
      );
    }

    // 전혀 캐시되어있지 않은 경우
    if (features.length > 2) {
      // 아이템이 2개 이상인 경우
      // 폴리곤 배열을 2분할하고 각 분할된 배열을 병합한 결과를 병합하고 반환합니다.
      return zip(
        memoizedUnionAdministrativeAreaFeature(
          features.slice(0, features.length / 2)
        ), // 폴리곤 배열을 반으로 나눈 배열을 병합
        memoizedUnionAdministrativeAreaFeature(
          features.slice(features.length / 2)
        ) // 나머지 폴리곤 배열을 병합
      ).pipe(
        map((value) => value.filter(isNotNil)),
        concatMap((value) => unionPolygons(value)), // 각 결과를 병합
        tap(
          (result) =>
            result && unionAdministrativeAreaFeatureCache.set(cacheKey, result)
        ) // 병합 결과를 캐시에 저장
      );
    }

    // 아이템이 2개 이하인 경우, 병합하고 캐시에 저장하고 반환합니다.
    return unionPolygons(features).pipe(
      tap(
        (result) =>
          result && unionAdministrativeAreaFeatureCache.set(cacheKey, result)
      )
    );
  });
};
