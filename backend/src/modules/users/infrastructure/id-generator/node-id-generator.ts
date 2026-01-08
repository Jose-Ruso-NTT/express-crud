import { randomUUID } from "node:crypto";
import { IdGeneratorPort } from "../../application/ports/id-generator.port";

export class NodeIdGenerator implements IdGeneratorPort {
  generate(): string {
    return randomUUID();
  }
}
