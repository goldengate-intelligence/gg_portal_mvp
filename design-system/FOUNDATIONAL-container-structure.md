# FOUNDATIONAL STRUCTURE - Container Terminology & Communication Guide

**THIS IS A FOUNDATIONAL DESIGN SYSTEM DOCUMENT**
**DO NOT MODIFY WITHOUT EXPLICIT APPROVAL**

This document defines the standardized terminology for our 3-layer panel system to ensure clear communication during development.

## 3-Layer Panel Structure

Our panels follow a consistent 3-part hierarchical structure:

### Layer 1: PANEL (ExternalPanel)
- **What it is**: The outermost visual framework
- **Purpose**: Provides obsidian visual aesthetic with interactive effects
- **Features**:
  - Obsidian coloring with indigo-themed borders
  - Animated background grid pattern
  - Glow effects on hover
  - Gradient background (black/gray obsidian aesthetic)
  - Border radius and shadow
- **Alternative names**: ExternalPanel, Layer 1

### Layer 2: CONTAINER (InternalContainer)
- **What it is**: The content organization layer
- **Purpose**: Provides layout structure and content flow
- **Features**:
  - Background color: #1F2937
  - Padding (p-4)
  - Full height flex column layout
  - Z-index positioning (z-10)
  - Houses titles and organizes content sections
- **Alternative names**: InternalContainer, Layer 2

### Layer 3: CONTENTBOX (Individual Content Elements)
- **What it is**: Individual content elements/cards within the container
- **Purpose**: Houses specific content items like entity cards, data elements
- **Features**:
  - Individual background styling (varies by content type)
  - Rounded corners
  - Internal padding
  - Contains actual content (text, data, interactive elements)
- **Alternative names**: ContentBox, Layer 3

## Visual Hierarchy

```
┌─────────────────────────────────────┐ ← PANEL (Obsidian aesthetic)
│  ┌─────────────────────────────────┐ │ ← CONTAINER (#1F2937 background)
│  │  TITLE                          │ │
│  │  ┌─────────────────────────────┐ │ │ ← CONTENTBOX (Entity Discovered)
│  │  │  Entity Discovered          │ │ │
│  │  │  Lockheed Martin Corp       │ │ │
│  │  └─────────────────────────────┘ │ │
│  │  ┌─────────────────────────────┐ │ │ ← CONTENTBOX (Analysis Complete)
│  │  │  Analysis Complete          │ │ │
│  │  │  Boeing Defense Division    │ │ │
│  │  └─────────────────────────────┘ │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Communication Examples

**Clear**: "Change the CONTENTBOX background to #223040"
**Clear**: "Add padding to the CONTAINER"
**Clear**: "Modify the PANEL border color to red"
**Clear**: "Update Layer 2 background color"

**Unclear**: "Change the container color"
**Unclear**: "Update the background"
**Unclear**: "Fix the padding on the box"

## Implementation Reference

See `AssetManagement-implementation.tsx` for the complete implementation of this system.

## Usage in Portfolio - Asset Management Panel

The Asset Management panel demonstrates this structure:
- **PANEL (Layer 1)**: Obsidian framework with indigo theme and animated grid
- **CONTAINER (Layer 2)**: #1F2937 background, houses title and content organization
- **CONTENTBOX (Layer 3)**: Two individual entity cards:
  - "Entity Discovered - Lockheed Martin Corp"
  - "Analysis Complete - Boeing Defense Division"