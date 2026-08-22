import assert from "node:assert/strict";
import test from "node:test";
import {
  knowledgeNodeKey,
  knowledgeNodeRelationalHref,
  type KnowledgeNode,
} from "./knowledge";

test("knowledge node key removes only its kind prefix", () => {
  const node: KnowledgeNode = {
    id: "country:IT",
    kind: "country",
    label: "Italia",
    href: "/atlante/italia",
  };

  assert.equal(knowledgeNodeKey(node), "IT");
});

test("relational href is stable and encodes the entity key", () => {
  const node: KnowledgeNode = {
    id: "route:ma-it/example",
    kind: "route",
    label: "Marocco → Italia",
    href: "/atlante/rotte/marocco-italia",
  };

  assert.equal(
    knowledgeNodeRelationalHref(node),
    "/relazioni/route/ma-it%2Fexample",
  );
});
