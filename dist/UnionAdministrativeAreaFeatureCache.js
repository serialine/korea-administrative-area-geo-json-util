"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnionAdministrativeAreaFeatureCache = void 0;
var lru_cache_1 = __importDefault(require("lru-cache"));
/**
 * 행정구역 geojson 캐시
 * key: 행정구역 id 배열
 * value: key에 해당하는 행정구역 폴리곤들의 병합 결과
 *
 * 캐시 갯수가 200건이 넘어갈 경우 LRU 알고리즘에 따라 기존 캐시를 제거하여 최대 200건을 유지합니다.
 */
var UnionAdministrativeAreaFeatureCache = /** @class */ (function () {
    function UnionAdministrativeAreaFeatureCache() {
        var _this = this;
        this.cache = new lru_cache_1.default(200); // 캐시
        this.keys = [];
        /**
         * 행정구역 id 배열을 key로 사용하기 위해 string으로 serialize 합니다.
         */
        this.serializeKey = function (administrativeAreaIds) {
            return administrativeAreaIds.sort().join(";");
        };
        /**
         * 캐시에 저장합니다.
         * @param key {AdministrativeArea.id} 배열
         * @param feature 폴리곤 병합 결과
         */
        this.set = function (key, feature) {
            var serializedKey = _this.serializeKey(key);
            _this.cache.set(serializedKey, feature);
            _this.keys = _this.cache.keys().map(function (value) { return value.split(";"); });
        };
        /**
         * 캐시를 가져옵니다.
         * @param key {AdministrativeArea.id} 배열
         */
        this.get = function (key) {
            var serializedKey = _this.serializeKey(key);
            return _this.cache.get(serializedKey) || null;
        };
        /**
         * 주어진 key (행정구역 id 배열)의 부분집합이며 동시에 최대 크기인 key를 찾아 반환합니다.
         *
         * ex) 주어진 key가 [1,2,3,4,5] 일때
         * 기존 cache에 [1,2], [2,4,5], [2,3,4,5,6,7,8] 이 key로 저장되어있었다면
         * [2,4,5]를 반환합니다.
         */
        this.findLargestSubKey = function (targetKey) {
            return _this.keys
                .filter(function (key) { return key.length <= targetKey.length; })
                .sort(function (a, b) { return b.length - a.length; })
                .find(function (key) { return key.every(function (value) { return targetKey.includes(value); }); });
        };
        /**
         * 캐시를 초기화합니다.
         */
        this.clear = function () {
            _this.cache.reset();
            _this.keys = [];
        };
    }
    return UnionAdministrativeAreaFeatureCache;
}());
exports.UnionAdministrativeAreaFeatureCache = UnionAdministrativeAreaFeatureCache;
