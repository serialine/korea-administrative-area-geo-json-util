"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCircleBboxCoordinates = exports.getBboxCoordinates = exports.cloneMultiPolygons = exports.is3DPosition = void 0;
const bbox_1 = __importDefault(require("@turf/bbox"));
const clone_1 = __importDefault(require("@turf/clone"));
const circle_1 = __importDefault(require("@turf/circle"));
/**
 * Position값의 3차원 배열 여부를 반환합니다.
 */
const is3DPosition = (coordinates) => {
    return Array.isArray(coordinates[0][0][0]);
};
exports.is3DPosition = is3DPosition;
/**
 * 주어진 Polygon | MultiPolygon geojson을 deep copy 합니다.
 */
const cloneMultiPolygons = (features) => features.map((feature) => clone_1.default(feature));
exports.cloneMultiPolygons = cloneMultiPolygons;
/**
 * 주어진 geojson을 포함하는 boundbox의 coordinate 배열을 반환합니다.
 */
const getBboxCoordinates = (geoJson) => {
    // 주어진 GeoJSON이 없을경우 빈 배열을 반환
    if (geoJson === null)
        return [];
    // 주어진 GeoJSON의 bounding box를 구함 (위도, 경도가 번갈아가며 놓인 배열)
    return (bbox_1.default(geoJson)
        // bounding box를 순회하며 위도 경도가 한쌍인 이차원 배열로 변환
        .reduce((result, value, index, array) => {
        if (index % 2 === 0)
            result.push(array.slice(index, index + 2));
        return result;
    }, [])
        // 위도, 경도를 Coordinates 매핑
        .map(([lng, lat]) => ({
        lat,
        lng,
    })));
};
exports.getBboxCoordinates = getBboxCoordinates;
/**
 * 주어진 중심점을 기준으로 생성한 원을 포함한 BoundingBox의 Coordinates 배열을 구합니다.
 *
 * @param center 중심 위경도
 * @param radiusInMeter 생성할 원의 반지름 (미터 단위)
 */
const getCircleBboxCoordinates = (center, radiusInMeter) => {
    const feature = circle_1.default([center.lng, center.lat], radiusInMeter, {
        units: "meters",
    });
    return exports.getBboxCoordinates(feature);
};
exports.getCircleBboxCoordinates = getCircleBboxCoordinates;
