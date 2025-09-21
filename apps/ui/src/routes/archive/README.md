# HUD Routes Archive

This folder contains archived routes that used the tactical HUD theming. These routes are preserved for reference but are not part of the active platform navigation.

## Archived Routes

### HUD-Themed Pages
- **`portfolio.tsx`** - Portfolio management with HudContractorCard components
- **`company-profile.tsx`** - Heavy HUD usage with TargetReticle, TacticalDisplay, tactical language
- **`identify.tsx`** - Entity identification with HUD styling

## Dependencies
These routes depend on components now archived in `/components/archive/`:
- HudCard, HudContractorCard
- TargetReticle, TacticalDisplay
- Military/tactical theming

## Current Active Routes
The main platform routes that remain active and HUD-free:
- `/platform` - Main dashboard
- `/platform/contractor-detail` - Contractor detail pages
- `/platform/analysis` - Analysis workflows
- `/platform/iceberg-opportunities` - Opportunity discovery

## Purpose
These archived routes serve as a reference for the tactical UI aesthetic if needed in the future, but are separated from the production codebase to maintain clarity.