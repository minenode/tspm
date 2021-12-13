import { ImportDeclaration } from "estree";

import Declaration, { IOptions as IDeclarationOptions } from "./Declaration";

export type Interface = ImportDeclaration;

export type IOptions = IDeclarationOptions<Interface>;

export default class Import extends Declaration<Interface> {}
