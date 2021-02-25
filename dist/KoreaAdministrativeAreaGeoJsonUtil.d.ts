import { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { AdministrativeAreaFeatureCollection } from "./AdministrativeAreaFeature";
/**
 * 행정구역 GeoJSON 레포지토리
 */
export declare class KoreaAdministrativeAreaGeoJsonUtil {
    private readonly admSdGeoJson;
    private readonly admSggGeoJson;
    private readonly admAllGeoJson;
    private readonly unionAdministrativeAreaFeatureCache;
    constructor(admSdGeoJson: AdministrativeAreaFeatureCollection, admSggGeoJson: AdministrativeAreaFeatureCollection, admAllGeoJson: AdministrativeAreaFeatureCollection);
    /**
     * 대한민국 전체 경계 GeoJSON 조회
     */
    getKorea(): Promise<AdministrativeAreaFeatureCollection>;
    /**
     * 주어진 행정구역 목록을 병합한 GeoJSON 조회
     */
    mergeAreas(administrativeAreaCodes: string[]): Promise<FeatureCollection<Polygon | MultiPolygon> | null>;
    clearCache(): void;
}
