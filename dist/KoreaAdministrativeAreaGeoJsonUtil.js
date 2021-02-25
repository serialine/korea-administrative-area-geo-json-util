"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KoreaAdministrativeAreaGeoJsonUtil = void 0;
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const helpers_1 = require("@turf/helpers");
const memoizedUnionAdministrativeAreaFeature_1 = require("./memoizedUnionAdministrativeAreaFeature");
const GeoUtils_1 = require("./GeoUtils");
const UnionAdministrativeAreaFeatureCache_1 = require("./UnionAdministrativeAreaFeatureCache");
/**
 * 행정구역 GeoJSON 레포지토리
 */
class KoreaAdministrativeAreaGeoJsonUtil {
    constructor(admSdGeoJson, admSggGeoJson, admAllGeoJson) {
        // 행정구역 geojson 캐시 인스턴스
        this.unionAdministrativeAreaFeatureCache = new UnionAdministrativeAreaFeatureCache_1.UnionAdministrativeAreaFeatureCache();
        this.admSdGeoJson = admSdGeoJson;
        this.admSggGeoJson = admSggGeoJson;
        this.admAllGeoJson = admAllGeoJson;
    }
    /**
     * 대한민국 전체 경계 GeoJSON 조회
     */
    getKorea() {
        return rxjs_1.of(this.admAllGeoJson).toPromise();
    }
    /**
     * 주어진 행정구역 목록을 병합한 GeoJSON 조회
     */
    mergeAreas(administrativeAreaCodes) {
        // 행정구역 목록이 비어있을경우 null 반환
        if (administrativeAreaCodes.length === 0)
            return rxjs_1.of(null).toPromise();
        return rxjs_1.of(administrativeAreaCodes)
            .pipe(
        // 행정 구역 code 목록 => 행정구역 GeoJSON 목록 매핑
        operators_1.map((areaCodes) => {
            // 시도 행정구역 GeoJSON 목록 조회
            const sdFeatures = this.admSdGeoJson.features.filter((feature) => areaCodes.includes(feature.properties.adm_cd));
            // 시군구 행정구역 GeoJSON 목록 조회
            const sggFeatures = this.admSggGeoJson.features.filter((feature) => areaCodes.includes(feature.properties.adm_cd));
            // 시도 & 시군구 행정구역 GeoJSON 목록 병합
            return [...sdFeatures, ...sggFeatures];
        }), 
        // 행정구역 GeoJSON 목록 => 병합된 Polygon GeoJSON 변환
        operators_1.concatMap((features) => memoizedUnionAdministrativeAreaFeature_1.memoizedUnionAdministrativeAreaFeature(GeoUtils_1.cloneMultiPolygons(features), this.unionAdministrativeAreaFeatureCache)), 
        // 병합된 Polygon GeoJSON => FeatureCollection GeoJSON 매핑
        operators_1.map((unionedFeature) => unionedFeature === null
            ? unionedFeature
            : helpers_1.featureCollection([unionedFeature])))
            .toPromise();
    }
    clearCache() {
        this.unionAdministrativeAreaFeatureCache.clear();
    }
}
exports.KoreaAdministrativeAreaGeoJsonUtil = KoreaAdministrativeAreaGeoJsonUtil;
