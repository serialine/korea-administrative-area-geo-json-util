import LRU from "lru-cache";
import { Feature, MultiPolygon, Polygon } from "geojson";

/**
 * 행정구역 geojson 캐시
 * key: 행정구역 id 배열
 * value: key에 해당하는 행정구역 폴리곤들의 병합 결과
 *
 * 캐시 갯수가 200건이 넘어갈 경우 LRU 알고리즘에 따라 기존 캐시를 제거하여 최대 200건을 유지합니다.
 */
export class UnionAdministrativeAreaFeatureCache {
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
