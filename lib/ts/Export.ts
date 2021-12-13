import { ExportDeclaration } from "typescript";

import Declaration, { IOptions as IDeclarationOptions } from "./Declaration";

export type Interface = ExportDeclaration;

export type IOptions = IDeclarationOptions<Interface>;

export default class Export extends Declaration<Interface> {}
