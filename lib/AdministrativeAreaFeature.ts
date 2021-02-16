import { Feature, FeatureCollection, MultiPolygon, Polygon } from "geojson";

export type AdministrativeAreaFeature = Feature<
  Polygon | MultiPolygon,
  // eslint-disable-next-line camelcase
  { adm_nm: string; adm_cd: string }
>;

export type AdministrativeAreaFeatureCollection = FeatureCollection<
  Polygon | MultiPolygon,
  // eslint-disable-next-line camelcase
  { adm_nm: string; adm_cd: string }
>;
