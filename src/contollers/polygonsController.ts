import { Request, Response, NextFunction } from "express";
import JSZip from "jszip";
import shpwrite from "@mapbox/shp-write";
import path from "path";
import fs from "fs";
import { clipGeoTiff } from "../utils/clipGeoTiff";
import filterPolygonsInsideMain from "../utils/filterPolygons";
import { ShapeReader } from "shpts";

export async function readshp(): Promise<Polygon[]> {
  const shpPath = path.join(
    __dirname,
    "../../utilFiles/polygons/Polygon wgs84.shp"
  );
  const shxPath = path.join(
    __dirname,
    "../../utilFiles/polygons/Polygon wgs84.shx"
  );

  if (!fs.existsSync(shpPath) || !fs.existsSync(shxPath)) {
    console.log("Файлы не найдены");
    return [];
  }

  const shpBuffer = await fs.readFileSync(shpPath);
  const shxBuffer = await fs.readFileSync(shxPath);

  const reader = await ShapeReader.fromArrayBuffer(
    shpBuffer.buffer,
    shxBuffer.buffer
  );
  const numRecords = reader.recordCount;

  const polygons: Polygon[] = [];

  let passCount = 0;

  for(let index = 0; index< numRecords; index++){
    try{
      const shape = reader.readGeom(index);
      if(shape){
        if (shape.type === 'Null') {
          passCount += 1
          continue;
        }

        const geojson = shape.toGeoJson();
        if(geojson.type === "Polygon"){
          const polygonGeoJson = geojson as GeoJSON.Polygon;
          polygons.push(polygonGeoJson.coordinates[0] as Polygon)
        }
      }
    } catch(error){
      console.log(error)
    }
  }

  console.log("Количество пропусков:", passCount)
  console.log("Посчитано полигонов:", polygons.length)
  return polygons
}

const points: Polygon[] = [
  [
    [55.36265521306226, 86.07140064239503],
    [55.36131361772038, 86.07732295989992],
    [55.36049644191051, 86.07803106307985],
    [55.357886244984286, 86.07609987258913],
    [55.35938651939041, 86.06931924819948],
    [55.36265521306226, 86.07140064239503],
  ],
  [
    [55.34765114917292, 86.07204437255861],
    [55.347675550640204, 86.07481241226196],
    [55.34451543552662, 86.07491970062257],
    [55.34447883039941, 86.07208728790285],
    [55.34765114917292, 86.07204437255861],
  ],
  [
    [55.35195167558905, 86.04505062103271],
    [55.35446467481295, 86.04685306549072],
    [55.35385473820302, 86.04921340942384],
    [55.351292901834945, 86.04741096496583],
    [55.35195167558905, 86.04505062103271],
  ],
  [
    [55.356446903904185, 86.08200073242189],
    [55.35863029061768, 86.08401775360109],
    [55.35780086180403, 86.08663558959961],
    [55.35528807433189, 86.08704328536987],
    [55.356446903904185, 86.08200073242189],
  ],
];

interface ShpWriteFiles {
  shp: { buffer: Buffer };
  shx: { buffer: Buffer };
  dbf: { buffer: Buffer };
}

type Coordinate = [number, number];
type Polygon = Coordinate[];

export const calculatePolygons = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { polygon } = req.body;

    polygon.push(polygon[0]);

    const points = await readshp()

    const correctedPoints: Polygon[] = points.map((polygon) => {
      return polygon.map((coordPair) => {
        return [coordPair[1], coordPair[0]];
      });
    });

    const internalPolygons = filterPolygonsInsideMain(correctedPoints, polygon);
    
    const data = { points: internalPolygons };
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
};

export const downloadPolygons = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { polygon } = req.body;

    const zip = new JSZip();
    function finish(err: any, files: ShpWriteFiles) {
      zip.file("polygon.shp", files.shp.buffer);
      zip.file("polygon.shx", files.shx.buffer);
      zip.file("polygon.dbf", files.dbf.buffer);

      zip
        .generateAsync({ type: "nodebuffer" })
        .then((content) => {
          res.setHeader("Content-Type", "application/zip");
          res.setHeader("Content-Disposition", "attachment; filename=data.zip");
          res.send(content);
        })
        .catch((err) => {
          console.error("Error generating zip:", err);
          res.status(500).send("Error generating zip");
        });
    }

    polygon.push(polygon[0]);
  
    const correctedPolygon: Polygon = (polygon as Polygon).map((polygon) => {
      return [polygon[1], polygon[0]];
    });

    const points = await readshp()
    const internalPolygons = filterPolygonsInsideMain(points, correctedPolygon);

    shpwrite.write([{ id: 0 }], "POLYGON", [internalPolygons], finish);
  } catch (error) {
    next(error);
  }
};

export const downloadNeiroplan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let clippedFilePath: string | null = null;

  try {
    const mapTiff_file = path.join(
      __dirname,
      "../../utilFiles/49c80abb-2404-4eb2-8b42-9405d70c0814.tif"
    );

    const { polygon } = req.body;

    const processedPolygon: Polygon = [];
    polygon.map((cords: number[]) => {
      processedPolygon.push([cords[1], cords[0]]);
    });

    processedPolygon.push(processedPolygon[0]);

    if (!processedPolygon) {
      res.status(404).send("Не найден полигон");
      return;
    }

    if (processedPolygon.length < 3) {
      res.status(403).send("Неверный формат полигона");
      return;
    }

    if (!fs.existsSync(mapTiff_file)) {
      res.status(404).send("Файл не найден на сервере");
      return;
    }

    clippedFilePath = await clipGeoTiff(mapTiff_file, processedPolygon);

    res
      .status(200)
      .sendFile(
        clippedFilePath,
        { headers: { "Content-Type": "image/tiff" } },
        (err) => {
          if (err) {
            console.error("Ошибка при отправке файла:", err);
          }

          if (clippedFilePath) {
            fs.unlink(clippedFilePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error("Ошибка при удалении файла", unlinkErr);
              }
            });
          }
        }
      );
  } catch (error) {
    next(error);
  }
};
