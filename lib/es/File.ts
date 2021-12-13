import { Node, Program } from "estree";
import { readFileSync, writeFileSync, PathLike, WriteFileOptions } from "fs";
import { ModuleKind } from "typescript";

import ParseError from "../error/Parse";
import Export from "./Export";
import Import from "./Import";
import isExportNamedDeclaration from "./isExportNamedDeclaration";
import isImportDeclaration from "./isImportDeclaration";
import isRequireCallExpression from "./isRequireCallExpression";
import {
  attachComments,
  Comment,
  generate,
  parse,
  Token,
  traverse,
} from "./parser";
import Require from "./Require";
import Base, { IDerivedOptions as IBaseOptions } from "../File";

export type IOptions = IBaseOptions;

export default class File extends Base<Import | Require, Export> {
  private program: Program | undefined;

  constructor({ ...options }: IOptions) {
    super({ ...options, extension: ".js" });
    this.program = undefined;
  }

  private get ast(): Program {
    if (this.program) {
      return this.program;
    }

    const data = readFileSync(this.destination.toString(), "utf8");
    try {
      const comments: Comment[] = [];
      const tokens: Token[] = [];
      const program = parse(data, {
        allowHashBang: true,
        ranges: true,
        onComment: comments,
        onToken: tokens,
        sourceType:
          this.options.module === ModuleKind.ES2015 ? "module" : "script", // TODO: this seems wrong
        ecmaVersion: 2020,
        // plugins,
      });
      if (!program) {
        throw new ParseError({
          file: this,
          error: new Error("Parse error"),
          data,
        });
      }
      attachComments(program as any, comments as any, tokens as any);
      this.program = program as any;
      return this.program as any; // TODO: fix this type-cast
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new ParseError({ file: this, error, data });
      } else {
        throw error;
      }
    }
  }

  async *imports(): AsyncIterableIterator<Import | Require> {
    const ast = this.ast;

    yield* ast.body
      .filter(isImportDeclaration)
      .map((declaration) => new Import({ file: this, declaration }));

    const requires: Array<Require> = [];
    traverse(ast, {
      enter: (declaration: Node) => {
        if (isRequireCallExpression(declaration)) {
          requires.push(new Require({ file: this, declaration }));
        }
      },
    });
    yield* requires;
  }

  async *exports(): AsyncIterableIterator<Export> {
    const { body } = await this.ast;
    yield* body
      .filter(isExportNamedDeclaration)
      .map((declaration) => new Export({ file: this, declaration }));
  }

  write(path?: PathLike | number, options?: WriteFileOptions): void {
    const ast = this.ast;
    const data = generate(ast, { comment: true });
    writeFileSync(
      path === undefined ? this.destination.toString() : path,
      data,
      options
    );
  }
}
