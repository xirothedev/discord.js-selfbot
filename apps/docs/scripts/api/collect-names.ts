import type { Reflection, Signature, TypeNode, TypeParameter } from "./types";

interface ReflectionLike {
  type?: TypeNode;
  children?: Reflection[];
  signatures?: Signature[];
  typeParameters?: TypeParameter[];
  extendedTypes?: TypeNode[];
  implementedTypes?: TypeNode[];
  getSignature?: Signature;
  setSignature?: Signature;
}

class NameCollector {
  collectTypeNode(node: TypeNode | undefined, out: Set<string>): void {
    if (!node) {
      return;
    }

    if (node.type === "reference" && node.name) {
      out.add(node.name);
    }
    for (const type of node.types ?? []) {
      this.collectTypeNode(type, out);
    }
    for (const type of node.typeArguments ?? []) {
      this.collectTypeNode(type, out);
    }
    for (const type of node.elements ?? []) {
      this.collectTypeNode(type, out);
    }
    this.collectTypeNode(node.elementType, out);
    this.collectTypeNode(node.objectType, out);
    this.collectTypeNode(node.indexType, out);
    this.collectTypeNode(node.queryType, out);
    this.collectTypeNode(node.checkType, out);
    this.collectTypeNode(node.extendsType, out);
    this.collectTypeNode(node.trueType, out);
    this.collectTypeNode(node.falseType, out);

    if (node.declaration) {
      this.collectReflectionNames(node.declaration, out);
    }
  }

  collectReflectionNames(reflection: ReflectionLike, out: Set<string>): void {
    this.collectTypeNode(reflection.type, out);

    for (const child of reflection.children ?? []) {
      this.collectReflectionNames(child, out);
    }
    for (const signature of reflection.signatures ?? []) {
      this.collectTypeNode(signature.type, out);
      for (const parameter of signature.parameters ?? []) {
        this.collectTypeNode(parameter.type, out);
      }
      for (const typeParameter of signature.typeParameters ?? []) {
        this.collectTypeNode(typeParameter.type, out);
      }
    }
    for (const typeParameter of reflection.typeParameters ?? []) {
      this.collectTypeNode(typeParameter.type, out);
    }
    for (const type of reflection.extendedTypes ?? []) {
      this.collectTypeNode(type, out);
    }
    for (const type of reflection.implementedTypes ?? []) {
      this.collectTypeNode(type, out);
    }
    if (reflection.getSignature) {
      this.collectReflectionNames(reflection.getSignature, out);
    }
    if (reflection.setSignature) {
      this.collectReflectionNames(reflection.setSignature, out);
    }
  }
}

export function collectReflectionNames(
  reflection: ReflectionLike,
  out: Set<string>
): void {
  new NameCollector().collectReflectionNames(reflection, out);
}
