"use server";
import { del, list, put } from "@vercel/blob";
import { verifySession } from "../lib/dal";
import prisma from "../lib/utils";
import { mkConfig, generateCsv, asString } from "export-to-csv";
import { getAllBooks } from "../lib/callDB";

export async function downloadCsv() {
  const verify = await verifySession(false);

  if (!verify || verify.role !== "ADMIN")
    return { error: "Errore: non sei autorizzato" };

  const countBooks = await prisma.book.count({});
  const { blobs } = await list({
    prefix: "data",
  });
  const csv = blobs.find((el) => el.pathname.includes("csv"));
  if (blobs.length === 0 || !csv) {
    const data = await callFileUp(countBooks);
    return {
      download: data.downloadUrl,
      filename: data.pathname.split("/")[1],
    };
  }
  const num = csv.pathname.split("/")[1];
  if (!num.startsWith("csv" + countBooks)) {
    await del(csv.url);
    const data = await callFileUp(countBooks);
    return {
      download: data.downloadUrl,
      filename: data.pathname.split("/")[1],
    };
  }
  return { download: csv.downloadUrl, filename: num };
}

const generateCsvBuffer = async (
  data: {
    ID: number;
    CATEGORIA: string;
    TITOLO: string;
    AUTORE?: string | null;
    CASA_EDITRICE?: string | null;
    ANNO_PUBBLICAZIONE?: string | null;
    NOTE?: string | null;
    SCOMPARTO?: string | null;
  }[]
) => {
  const csvConfig = mkConfig({
    useKeysAsHeaders: true,
    useBom: true,
  });

  const csv = generateCsv(csvConfig)(data);
  const csvBuffer = Buffer.from(asString(csv));
  return csvBuffer;
};

const callFileUp = async (countBooks: number) => {
  const url = "/data/csv" + countBooks + ".csv";
  const allBooks = (await getAllBooks(countBooks)).map((el, row) => ({
    ID: row + 1,
    CATEGORIA: el.category.name,
    TITOLO: el.titolo,
    AUTORE: el.autore,
    CASA_EDITRICE: el?.casaEditrice ?? undefined,
    ANNO_PUBBLICAZIONE: el?.annoPubblicazione ?? undefined,
    NOTE: el?.note ?? undefined,
    SCOMPARTO: el.scompartoCase ?? undefined,
  }));
  const csvData = await generateCsvBuffer(allBooks);
  const data = await put(url, csvData, { access: "public" });
  return data;
};

export async function deleteCsv() {
  const { blobs } = await list({
    prefix: "data",
  });
  const csv = blobs.find((el) => el.pathname.includes("csv"));
  if (blobs.length === 0 || !csv) {
    return null;
  }
  await del(csv.url);
}
