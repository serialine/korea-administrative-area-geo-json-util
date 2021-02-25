import { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";
export declare type AdministrativeAreaFeature = Feature<Polygon | MultiPolygon, {
    adm_nm: string;
    adm_cd: string;
}>;
export declare type AdministrativeAreaFeatureCollection = FeatureCollection<Polygon | MultiPolygon, {
    adm_nm: string;
    adm_cd: string;
}>;
