import { Request, Response, NextFunction } from "express";
import JSZip from "jszip";
import shpwrite from "@mapbox/shp-write";

const points = [
  [
    [55.36265521306226, 86.07140064239503],
    [55.36131361772038, 86.07732295989992],
    [55.36049644191051, 86.07803106307985],
    [55.357886244984286, 86.07609987258913],
    [55.35938651939041, 86.06931924819948],
  ],
  [
    [55.34765114917292, 86.07204437255861],
    [55.347675550640204, 86.07481241226196],
    [55.34451543552662, 86.07491970062257],
    [55.34447883039941, 86.07208728790285],
  ],
  [
    [55.35195167558905, 86.04505062103271],
    [55.35446467481295, 86.04685306549072],
    [55.35385473820302, 86.04921340942384],
    [55.351292901834945, 86.04741096496583],
  ],
  [
    [55.356446903904185, 86.08200073242189],
    [55.35863029061768, 86.08401775360109],
    [55.35780086180403, 86.08663558959961],
    [55.35528807433189, 86.08704328536987],
  ],
];

interface ShpWriteFiles {
  shp: { buffer: Buffer };
  shx: { buffer: Buffer };
  dbf: { buffer: Buffer };
}

export const calculatePolygons = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = { points: points };

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

    shpwrite.write([{ id: 0 }], "POLYGON", points, finish);
  } catch (error) {
    next(error);
  }
};
