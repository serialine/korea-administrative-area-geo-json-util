"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unionPolygons = void 0;
var martinez = __importStar(require("martinez-polygon-clipping"));
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var helpers_1 = require("@turf/helpers");
var GeoUtils_1 = require("./GeoUtils");
/**
 * 주어진 폴리곤 2개를 병합한 결과를 반환합니다.
 */
var union = function (coordinates1, coordinates2) { return martinez.union(coordinates1, coordinates2); };
/**
 * 주어진 polygon을 union연산을 통해 하나로 병합합니다.
 */
var unionPolygons = function (polygons) {
    // 주어진 polygon이 없을경우 null 반환
    if (polygons.length === 0)
        return rxjs_1.of(null);
    // 주어진 polygon이 1개일 경우 해당 폴리곤을 반환
    if (polygons.length === 1)
        return rxjs_1.of(polygons[0]);
    return rxjs_1.from(polygons).pipe(
    // 폴리곤 => 위경도 배열로 매핑
    operators_1.map(function (_polygon) { return _polygon.geometry.coordinates; }), 
    // 1ms씩 딜레이를 주어 전달 (스레드를 너무 오래 블락하지 않도록)
    operators_1.concatMap(function (value) { return rxjs_1.of(value).pipe(operators_1.delay(1)); }), 
    // 위경도 배열의 배열을 순회하며 하나로 병합
    operators_1.reduce(function (acc, value) { return (acc === undefined ? value : union(acc, value)); }, undefined), 
    // 병합된 위경도 배열을 MultiPolygon Feature혹은 Polygon Feature로 매핑
    operators_1.map(function (unionedCoordinates) {
        return (GeoUtils_1.is3DPosition(unionedCoordinates)
            ? helpers_1.multiPolygon(unionedCoordinates)
            : helpers_1.polygon(unionedCoordinates));
    }));
};
exports.unionPolygons = unionPolygons;
