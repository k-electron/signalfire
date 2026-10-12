# 0002. Seeded generator

Status: accepted
Date: 2026-10-12

## Context

Replay and the Daily Signal need one seed to draw the same sequence in every supported runtime. Core cannot import a generator package. Level content needs a small deterministic generator, not a cryptographic one.

## Decision

Random draws use mulberry32, one 32-bit state word. The seed string is mixed with FNV-1a 32 over UTF-16 code units. Integer picks, weights, shuffles, chances, and labeled forks are the operations in the core-ports-and-rng change.

## Consequences

A later change to this algorithm or the fork encoding needs a new decision record. Logs saved under this generator would not replay after that change. There are no such logs yet.
