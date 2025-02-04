import EsImport, { Interface as EsImportInterface } from "./es/Export";
import EsFile from "./es/File";
import EsExport, { Interface as EsExportInterface } from "./es/Import";
import EsRequire, { Interface as EsRequireInterface } from "./es/Require";
import Mapper, { IOptions as IMapperOptions } from "./Mapper";
import TsImport, { Interface as TsImportInterface } from "./ts/Export";
import TsFile from "./ts/File";
import TsExport, { Interface as TsExportInterface } from "./ts/Import";

export type DeclarationInterface =
  | EsRequireInterface
  | EsImportInterface
  | EsExportInterface
  | TsImportInterface
  | TsExportInterface;

export type Declaration = EsImport | EsExport | TsImport | TsExport | EsRequire;

export type File = EsFile | TsFile;

export type IOptions = IMapperOptions;

export default async function* convert({
  ...other
}: IOptions): AsyncIterableIterator<Declaration> {
  const mapper = new Mapper({ ...other });
  yield* mapper.map();
}
