### 설치
```shell
npm install korea-administrative-area-geo-json-util
```

### 인스턴스 초기화
```typescript
const koreaAdministrativeAreaGeoJsonUtil = new KoreaAdministrativeAreaGeoJsonUtil(
    admSdGeoJson,
    admSggGeoJson,
    admAllGeoJson,
);
```

### 캐시 초기화
```typescript
koreaAdministrativeAreaGeoJsonUtil.clearCache();
```

### 특정 지역구만 병합된 GeoJSON 조회
```typescript
// geoJsonUtil.mergeAreas(/*행정구역 코드 배열*/);
geoJsonUtil.mergeAreas(['1', '2', '3']);
```

### 대한민국 전체 GeoJSON 조회
```typescript
geoJsonUtil.getKorea();
```
