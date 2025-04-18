import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { resolve } from "path";

type Coordinate = [number, number];
type Polygon = Coordinate[];

export async function clipGeoTiff(
  geotiffPath: string,
  polygon: Polygon,
  outputPath?: string
): Promise<string> {
  try {
    execSync("gdalinfo --version");
  } catch (error) {
    throw new Error(
      "GDAL не установлен. Пожалуйста, установите GDAL для использования этой функции."
    );
  }

  const inputFile = resolve(geotiffPath);
  const inputFileWithoutExt =
    inputFile.substring(0, inputFile.lastIndexOf(".")) || inputFile;
  const fileExtension =
    inputFile.substring(inputFile.lastIndexOf(".") + 1, inputFile.length) || "";

  const outputFile = outputPath ? resolve(outputPath) : `${inputFileWithoutExt}_clipped.${fileExtension}`;

  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [polygon],
        },
      },
    ],
  };

  const geojsonPath = `${inputFileWithoutExt}.geojson`;
  fs.writeFileSync(geojsonPath, JSON.stringify(geojson));

  try {
    const command = `gdalwarp -cutline ${geojsonPath} -dstnodata 0 -of GTiff ${inputFile} ${outputFile}`;
    execSync(command);
  } catch (error: any) {
    console.error(`Ошибка при обрезке GeoTIFF: ${error.message}`);
    throw new Error(`Ошибка при обрезке GeoTIFF: ${error.message}`);
  } finally {
    try {
      fs.unlinkSync(geojsonPath);
    } catch (err) {
      console.error(`Ошибка удаления файла: ${err}`);
    }
  }

  return outputFile;
}


