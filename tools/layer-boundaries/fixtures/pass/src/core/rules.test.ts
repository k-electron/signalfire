import { test } from "vitest";
import fc from "fast-check";
import { test as fcTest } from "@fast-check/vitest";
import { tokens } from "./tokens";

export const rules = { test, fc, fcTest, tokens };
