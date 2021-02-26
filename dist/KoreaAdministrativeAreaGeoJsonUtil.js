"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KoreaAdministrativeAreaGeoJsonUtil = void 0;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var helpers_1 = require("@turf/helpers");
var memoizedUnionAdministrativeAreaFeature_1 = require("./memoizedUnionAdministrativeAreaFeature");
var GeoUtils_1 = require("./GeoUtils");
var UnionAdministrativeAreaFeatureCache_1 = require("./UnionAdministrativeAreaFeatureCache");
/**
 * 행정구역 GeoJSON 레포지토리
 */
var KoreaAdministrativeAreaGeoJsonUtil = /** @class */ (function () {
    function KoreaAdministrativeAreaGeoJsonUtil(admSdGeoJson, admSggGeoJson, admAllGeoJson) {
        // 행정구역 geojson 캐시 인스턴스
        this.unionAdministrativeAreaFeatureCache = new UnionAdministrativeAreaFeatureCache_1.UnionAdministrativeAreaFeatureCache();
        this.admSdGeoJson = admSdGeoJson;
        this.admSggGeoJson = admSggGeoJson;
        this.admAllGeoJson = admAllGeoJson;
    }
    /**
     * 대한민국 전체 경계 GeoJSON 조회
     */
    KoreaAdministrativeAreaGeoJsonUtil.prototype.getKorea = function () {
        return rxjs_1.of(this.admAllGeoJson).toPromise();
    };
    /**
     * 주어진 행정구역 목록을 병합한 GeoJSON 조회
     */
    KoreaAdministrativeAreaGeoJsonUtil.prototype.mergeAreas = function (administrativeAreaCodes) {
        var _this = this;
        // 행정구역 목록이 비어있을경우 null 반환
        if (administrativeAreaCodes.length === 0)
            return rxjs_1.of(null).toPromise();
        return rxjs_1.of(administrativeAreaCodes)
            .pipe(
        // 행정 구역 code 목록 => 행정구역 GeoJSON 목록 매핑
        operators_1.map(function (areaCodes) {
            // 시도 행정구역 GeoJSON 목록 조회
            var sdFeatures = _this.admSdGeoJson.features.filter(function (feature) {
                return areaCodes.includes(feature.properties.adm_cd);
            });
            // 시군구 행정구역 GeoJSON 목록 조회
            var sggFeatures = _this.admSggGeoJson.features.filter(function (feature) {
                return areaCodes.includes(feature.properties.adm_cd);
            });
            // 시도 & 시군구 행정구역 GeoJSON 목록 병합
            return __spreadArrays(sdFeatures, sggFeatures);
        }), 
        // 행정구역 GeoJSON 목록 => 병합된 Polygon GeoJSON 변환
        operators_1.concatMap(function (features) {
            return memoizedUnionAdministrativeAreaFeature_1.memoizedUnionAdministrativeAreaFeature(GeoUtils_1.cloneMultiPolygons(features), _this.unionAdministrativeAreaFeatureCache);
        }), 
        // 병합된 Polygon GeoJSON => FeatureCollection GeoJSON 매핑
        operators_1.map(function (unionedFeature) {
            return unionedFeature === null
                ? unionedFeature
                : helpers_1.featureCollection([unionedFeature]);
        }))
            .toPromise();
    };
    KoreaAdministrativeAreaGeoJsonUtil.prototype.clearCache = function () {
        this.unionAdministrativeAreaFeatureCache.clear();
    };
    return KoreaAdministrativeAreaGeoJsonUtil;
}());
exports.KoreaAdministrativeAreaGeoJsonUtil = KoreaAdministrativeAreaGeoJsonUtil;
