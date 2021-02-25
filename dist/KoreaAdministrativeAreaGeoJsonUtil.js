import { of } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import { featureCollection } from "@turf/helpers";
import { memoizedUnionAdministrativeAreaFeature } from "./memoizedUnionAdministrativeAreaFeature";
import { cloneMultiPolygons } from "./GeoUtils";
import { UnionAdministrativeAreaFeatureCache } from "./UnionAdministrativeAreaFeatureCache";
/**
 * 행정구역 GeoJSON 레포지토리
 */
export class KoreaAdministrativeAreaGeoJsonUtil {
    constructor(admSdGeoJson, admSggGeoJson, admAllGeoJson) {
        // 행정구역 geojson 캐시 인스턴스
        this.unionAdministrativeAreaFeatureCache = new UnionAdministrativeAreaFeatureCache();
        this.admSdGeoJson = admSdGeoJson;
        this.admSggGeoJson = admSggGeoJson;
        this.admAllGeoJson = admAllGeoJson;
    }
    /**
     * 대한민국 전체 경계 GeoJSON 조회
     */
    getKorea() {
        return of(this.admAllGeoJson).toPromise();
    }
    /**
     * 주어진 행정구역 목록을 병합한 GeoJSON 조회
     */
    mergeAreas(administrativeAreaCodes) {
        // 행정구역 목록이 비어있을경우 null 반환
        if (administrativeAreaCodes.length === 0)
            return of(null).toPromise();
        return of(administrativeAreaCodes)
            .pipe(
        // 행정 구역 code 목록 => 행정구역 GeoJSON 목록 매핑
        map((areaCodes) => {
            // 시도 행정구역 GeoJSON 목록 조회
            const sdFeatures = this.admSdGeoJson.features.filter((feature) => areaCodes.includes(feature.properties.adm_cd));
            // 시군구 행정구역 GeoJSON 목록 조회
            const sggFeatures = this.admSggGeoJson.features.filter((feature) => areaCodes.includes(feature.properties.adm_cd));
            // 시도 & 시군구 행정구역 GeoJSON 목록 병합
            return [...sdFeatures, ...sggFeatures];
        }), 
        // 행정구역 GeoJSON 목록 => 병합된 Polygon GeoJSON 변환
        concatMap((features) => memoizedUnionAdministrativeAreaFeature(cloneMultiPolygons(features), this.unionAdministrativeAreaFeatureCache)), 
        // 병합된 Polygon GeoJSON => FeatureCollection GeoJSON 매핑
        map((unionedFeature) => unionedFeature === null
            ? unionedFeature
            : featureCollection([unionedFeature])))
            .toPromise();
    }
    clearCache() {
        this.unionAdministrativeAreaFeatureCache.clear();
    }
}
