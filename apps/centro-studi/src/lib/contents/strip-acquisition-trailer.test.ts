import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  extractContentsAcquisitionTrailer,
  stripContentsAcquisitionTrailer,
} from "@/lib/contents/strip-acquisition-trailer";

describe("stripContentsAcquisitionTrailer", () => {
  it("removes d1d trailer while keeping presentable stub", () => {
    const body = [
      "Scheda di rinvio a fonte ufficiale.",
      "",
      "Fonte: Fondazione ISMU ETS",
      "",
      "---",
      "d1d_natural_key: ismu-rapporti:id:ismu-31-rapporto-2025",
      "d1d_checksum: deadbeef",
      "d1d_auto_publish: false",
    ].join("\n");
    assert.equal(
      stripContentsAcquisitionTrailer(body),
      "Scheda di rinvio a fonte ufficiale.\n\nFonte: Fondazione ISMU ETS",
    );
    assert.ok(
      extractContentsAcquisitionTrailer(body)?.includes("d1d_natural_key:"),
    );
  });

  it("leaves body unchanged when trailer absent", () => {
    assert.equal(
      stripContentsAcquisitionTrailer("Solo testo pubblico."),
      "Solo testo pubblico.",
    );
  });
});
