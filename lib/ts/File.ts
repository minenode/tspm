import { PathLike, readFileSync, writeFileSync } from "fs";
import {
  createPrinter,
  createSourceFile,
  EmitHint,
  ExportDeclaration,
  ImportDeclaration,
  ScriptTarget,
  SourceFile,
  SyntaxKind,
} from "typescript";

import ParseError from "../error/Parse";
import Base, { IDerivedOptions as IBaseOptions } from "../File";
import Export from "./Export";
import Import from "./Import";
import { WriteFileOptions } from "fs";

export type IOptions = IBaseOptions;

export default class File extends Base<Import, Export> {
  private sourceFile: SourceFile | undefined;

  constructor({ ...options }: IOptions) {
    super({ ...options, extension: ".d.ts" });
    this.sourceFile = undefined;
  }

  private get ast(): SourceFile {
    if (this.sourceFile) {
      return this.sourceFile;
    } else {
      const data = readFileSync(this.destination.toString(), "utf-8");
      try {
        return (this.sourceFile = createSourceFile(
          this.destination.toString(),
          data,
          ScriptTarget.Latest
        ));
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new ParseError({ file: this, error, data });
        } else {
          throw error;
        }
      }
    }
  }

  async *imports(): AsyncIterableIterator<Import> {
    const { statements } = await this.ast;
    yield* statements
      .filter(({ kind }) => kind === SyntaxKind.ImportDeclaration)
      .map(
        (n) => new Import({ file: this, declaration: n as ImportDeclaration })
      );
  }

  async *exports(): AsyncIterableIterator<Export> {
    const { statements } = await this.ast;
    yield* statements
      .filter(({ kind }) => kind === SyntaxKind.ExportDeclaration)
      .filter((n) => (n as ExportDeclaration).moduleSpecifier)
      .map(
        (n) => new Export({ file: this, declaration: n as ExportDeclaration })
      );
  }

  write(path?: PathLike | number, options?: WriteFileOptions): void {
    const sourceFile = this.ast;
    const { newLine } = this.options;
    const printer = createPrinter({ newLine });
    const data = printer.printNode(EmitHint.SourceFile, sourceFile, sourceFile);
    writeFileSync(
      path === undefined ? this.destination.toString() : path,
      data,
      options
    );
  }
}
