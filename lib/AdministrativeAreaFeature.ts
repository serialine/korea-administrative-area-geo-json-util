import { Feature, MultiPolygon, Polygon } from "geojson";

export type AdministrativeAreaFeature = Feature<
  Polygon | MultiPolygon,
  { adm_nm: string; adm_cd: string }
>;
