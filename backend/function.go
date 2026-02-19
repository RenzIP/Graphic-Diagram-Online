// Package p is the Google Cloud Functions Gen 2 entry point for GraDiOl API.
// This file MUST be at the module root (next to go.mod) for GCF to discover it.
package p

import (
	// Blank-import the gcf package to trigger its init() which registers
	// the Cloud Function via functions.HTTP("GraDiOlAPI", handler).
	_ "github.com/renzip/GraDiOl/gcf"
)
