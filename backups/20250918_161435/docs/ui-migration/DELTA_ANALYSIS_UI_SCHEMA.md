# Delta Analysis: UI Implementation vs Database Schema

## Executive Summary

This document analyzes the gaps between the implemented UI features and the existing database schema. The UI has been built with comprehensive functionality across 9 phases, but the current schema is missing critical tables and fields to support many of these features.

## Critical Missing Components

### 1. **Federal Contracting Domain Tables (MISSING ENTIRELY)**

The UI heavily focuses on federal contracting, but the schema lacks these essential tables:

```sql
-- REQUIRED: Contractors table
CREATE TABLE contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    uei VARCHAR(12) NOT NULL UNIQUE, -- Unique Entity Identifier
    cage_code VARCHAR(5),
    duns VARCHAR(9),
    name VARCHAR(255) NOT NULL,
    dba_name VARCHAR(255), -- Doing Business As
    legal_name VARCHAR(255),
    
    -- Location & Contact
    location VARCHAR(255),
    state VARCHAR(2),
    country VARCHAR(100) DEFAULT 'United States',
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Business Details
    industry VARCHAR(100), -- Maps to 16 sectors in UI
    naics_codes JSONB, -- Array of NAICS codes
    ownership_type VARCHAR(50), -- small-business, woman-owned, veteran-owned, etc.
    business_size VARCHAR(50), -- small, medium, large
    employee_count INTEGER,
    annual_revenue DECIMAL(15, 2),
    
    -- Federal Contracting Metrics
    total_contract_value DECIMAL(15, 2),
    active_contracts_count INTEGER,
    past_performance_score INTEGER, -- 0-100
    cpars_rating DECIMAL(3, 2), -- Contractor Performance Assessment
    
    -- Status & Lifecycle
    lifecycle_stage VARCHAR(50), -- emerging, growing, mature, declining
    business_momentum VARCHAR(50), -- accelerating, growing, stable, declining
    status VARCHAR(50) DEFAULT 'active',
    sam_registration_date DATE,
    sam_expiration_date DATE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- REQUIRED: Opportunities table
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    piid VARCHAR(50) NOT NULL, -- Procurement Instrument Identifier
    type VARCHAR(10) CHECK (type IN ('AWD', 'IDV')), -- Award vs IDV
    
    -- Basic Info
    title VARCHAR(500) NOT NULL,
    description TEXT,
    agency VARCHAR(255) NOT NULL,
    sub_agency VARCHAR(255),
    office VARCHAR(255),
    
    -- Financial
    total_value DECIMAL(15, 2),
    base_value DECIMAL(15, 2),
    option_value DECIMAL(15, 2),
    
    -- Dates
    posted_date DATE NOT NULL,
    response_deadline TIMESTAMP,
    start_date DATE,
    end_date DATE,
    
    -- Competition Details
    competition_level VARCHAR(50), -- full-open, small-business, sole-source
    set_aside_type VARCHAR(100),
    place_of_performance VARCHAR(255),
    
    -- Classification
    naics_code VARCHAR(10),
    psc_code VARCHAR(10), -- Product Service Code
    
    -- Risk & Analysis
    risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    ai_summary TEXT,
    key_requirements JSONB, -- Array of requirements
    incumbent VARCHAR(255),
    estimated_competitors INTEGER,
    
    -- Status
    status VARCHAR(50) DEFAULT 'open',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. **Portfolio Management Tables (MISSING)**

The UI has drag-and-drop portfolio management, but schema lacks:

```sql
-- REQUIRED: Portfolios table
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- REQUIRED: Portfolio items table
CREATE TABLE portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id),
    contractor_id UUID NOT NULL REFERENCES contractors(id),
    position INTEGER NOT NULL, -- For drag-drop ordering
    notes TEXT,
    tags JSONB, -- Array of tags
    risk_assessment VARCHAR(20),
    priority VARCHAR(20),
    added_at TIMESTAMP DEFAULT NOW(),
    added_by UUID REFERENCES users(id),
    UNIQUE(portfolio_id, contractor_id)
);

-- REQUIRED: Portfolio shares table
CREATE TABLE portfolio_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id),
    shared_with_user_id UUID REFERENCES users(id),
    shared_with_team_id UUID REFERENCES teams(id),
    permission VARCHAR(20) CHECK (permission IN ('view', 'edit', 'admin')),
    shared_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);
```

### 3. **Analysis & Workflows Tables (PARTIALLY MISSING)**

The UI has 4 analysis types but schema only has basic deployments:

```sql
-- REQUIRED: Analysis runs table
CREATE TABLE analysis_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    contractor_id UUID REFERENCES contractors(id),
    opportunity_id UUID REFERENCES opportunities(id),
    
    -- Analysis Type
    type VARCHAR(50) NOT NULL, -- revenue-analytics, forensic-due-diligence, agency-exposure, market-perception
    
    -- Results
    summary TEXT,
    key_findings JSONB, -- Array of findings
    risk_assessment VARCHAR(20),
    confidence INTEGER, -- 0-100
    
    -- Metrics
    metrics JSONB, -- {score: 87, trend: 'positive', percentile: 92}
    
    -- Parameters & Context
    parameters JSONB, -- Input parameters
    execution_time INTEGER, -- milliseconds
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- REQUIRED: Analysis results table
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_run_id UUID NOT NULL REFERENCES analysis_runs(id),
    section VARCHAR(100), -- overview, findings, metrics, recommendations
    content JSONB,
    visualizations JSONB, -- Chart data
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. **Notes & Collaboration Tables (MISSING)**

The UI has a comprehensive notes system:

```sql
-- REQUIRED: Notes table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Entity references
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- contractor, opportunity, portfolio, analysis
    
    -- Note content
    title VARCHAR(255),
    content TEXT NOT NULL,
    tags JSONB, -- Array of tags
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')),
    is_starred BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- REQUIRED: Note attachments table
CREATE TABLE note_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES notes(id),
    file_name VARCHAR(255),
    file_url TEXT,
    file_size INTEGER,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT NOW()
);
```

### 5. **Search & Filter Saved Queries (MISSING)**

```sql
-- REQUIRED: Saved searches table
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50), -- contractors, opportunities
    filters JSONB NOT NULL, -- All filter criteria
    is_default BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6. **Export & Report Configuration (MISSING)**

```sql
-- REQUIRED: Export jobs table
CREATE TABLE export_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Export details
    entity_type VARCHAR(50),
    format VARCHAR(20), -- pdf, excel, csv, json
    filters JSONB,
    options JSONB, -- includeCharts, includeNotes, etc.
    
    -- Delivery
    delivery_method VARCHAR(50), -- download, email, share_link
    recipients JSONB, -- Array of emails
    share_url TEXT,
    
    -- Schedule
    is_scheduled BOOLEAN DEFAULT false,
    schedule_frequency VARCHAR(50), -- daily, weekly, monthly
    next_run_at TIMESTAMP,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    file_url TEXT,
    file_size INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

### 7. **AI Integration Tables (MISSING)**

```sql
-- REQUIRED: AI conversations table
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    entity_id UUID,
    entity_type VARCHAR(50),
    
    messages JSONB, -- Array of {role, content, timestamp}
    context JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- REQUIRED: AI insights table
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    
    insight_type VARCHAR(100),
    content TEXT,
    confidence_score INTEGER,
    
    -- Feedback
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 8. **User Preferences & Settings (MISSING)**

```sql
-- REQUIRED: User preferences table
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    -- UI Preferences
    default_view_mode VARCHAR(20), -- cards, table
    default_sort_order VARCHAR(50),
    items_per_page INTEGER DEFAULT 20,
    
    -- Notification settings
    email_notifications JSONB,
    in_app_notifications JSONB,
    
    -- Keyboard shortcuts
    custom_shortcuts JSONB,
    
    -- Dashboard configuration
    dashboard_widgets JSONB,
    pinned_searches JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, tenant_id)
);
```

### 9. **Favorites & Bookmarks (MISSING)**

```sql
-- REQUIRED: Favorites table
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    entity_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, entity_id, entity_type)
);
```

## Updates Required to Existing Tables

### 1. **Organizations Table**
Current table is too generic. Need to add federal contracting specific fields:

```sql
ALTER TABLE organizations 
ADD COLUMN uei VARCHAR(12) UNIQUE,
ADD COLUMN cage_code VARCHAR(5),
ADD COLUMN sam_status VARCHAR(50),
ADD COLUMN past_performance_score INTEGER,
ADD COLUMN risk_level VARCHAR(20),
ADD COLUMN total_contract_value DECIMAL(15, 2),
ADD COLUMN business_momentum VARCHAR(50),
ADD COLUMN ownership_type VARCHAR(50);
```

### 2. **Contracts Table**
Need more federal contracting details:

```sql
ALTER TABLE contracts
ADD COLUMN piid VARCHAR(50),
ADD COLUMN idv_piid VARCHAR(50),
ADD COLUMN competition_type VARCHAR(50),
ADD COLUMN set_aside_type VARCHAR(100),
ADD COLUMN naics_code VARCHAR(10),
ADD COLUMN psc_code VARCHAR(10),
ADD COLUMN place_of_performance VARCHAR(255),
ADD COLUMN contracting_agency VARCHAR(255),
ADD COLUMN funding_agency VARCHAR(255);
```

### 3. **Metrics Table**
Need specific federal contracting metrics:

```sql
ALTER TABLE metrics
ADD COLUMN contractor_id UUID REFERENCES contractors(id),
ADD COLUMN opportunity_id UUID REFERENCES opportunities(id),
ADD COLUMN metric_category VARCHAR(50); -- performance, financial, risk, compliance
```

## Missing Indexes for Performance

```sql
-- Contractor searches
CREATE INDEX idx_contractors_uei ON contractors(uei);
CREATE INDEX idx_contractors_name_gin ON contractors USING gin(name gin_trgm_ops);
CREATE INDEX idx_contractors_location ON contractors(state, location);
CREATE INDEX idx_contractors_industry ON contractors(industry);
CREATE INDEX idx_contractors_lifecycle ON contractors(lifecycle_stage);
CREATE INDEX idx_contractors_value ON contractors(total_contract_value);

-- Opportunity searches
CREATE INDEX idx_opportunities_piid ON opportunities(piid);
CREATE INDEX idx_opportunities_agency ON opportunities(agency);
CREATE INDEX idx_opportunities_deadline ON opportunities(response_deadline);
CREATE INDEX idx_opportunities_risk ON opportunities(risk_level);
CREATE INDEX idx_opportunities_type ON opportunities(type);

-- Portfolio performance
CREATE INDEX idx_portfolio_items_position ON portfolio_items(portfolio_id, position);

-- Analysis queries
CREATE INDEX idx_analysis_runs_type_contractor ON analysis_runs(type, contractor_id);
CREATE INDEX idx_analysis_runs_user_status ON analysis_runs(user_id, status);

-- Notes searches
CREATE INDEX idx_notes_entity ON notes(entity_id, entity_type);
CREATE INDEX idx_notes_user_starred ON notes(user_id, is_starred);
CREATE INDEX idx_notes_tags_gin ON notes USING gin(tags);
```

## Data Migration Requirements

1. **Transform Organizations to Contractors**: If organizations table contains contractor data, migrate to new contractors table
2. **Parse Contract Data**: Extract PIID, agency info from existing contracts if stored
3. **Generate Mock Data**: For development, need mock data for:
   - 500+ contractors with realistic federal contracting data
   - 1000+ opportunities (mix of AWDs and IDVs)
   - Sample analysis results
   - Sample AI insights

## API Endpoints Required

Based on UI implementation, these endpoints are needed:

```typescript
// Contractors
GET    /api/contractors
GET    /api/contractors/:id
POST   /api/contractors/search
GET    /api/contractors/:id/opportunities
GET    /api/contractors/:id/analysis

// Opportunities  
GET    /api/opportunities
GET    /api/opportunities/:id
POST   /api/opportunities/search
POST   /api/opportunities/:id/track

// Portfolios
GET    /api/portfolios
POST   /api/portfolios
PUT    /api/portfolios/:id
DELETE /api/portfolios/:id
POST   /api/portfolios/:id/items
PUT    /api/portfolios/:id/items/reorder
DELETE /api/portfolios/:id/items/:itemId

// Analysis
POST   /api/analysis/run
GET    /api/analysis/runs
GET    /api/analysis/runs/:id
GET    /api/analysis/runs/:id/results

// Notes
GET    /api/notes
POST   /api/notes
PUT    /api/notes/:id
DELETE /api/notes/:id

// AI
POST   /api/ai/summary
POST   /api/ai/chat
GET    /api/ai/insights/:entityId

// Exports
POST   /api/exports
GET    /api/exports/:id
POST   /api/exports/schedule

// Search
POST   /api/search/contractors
POST   /api/search/opportunities
POST   /api/search/save
GET    /api/search/saved
```

## Priority Implementation Order

### Phase 1: Core Domain (CRITICAL)
1. Create contractors table
2. Create opportunities table
3. Create portfolios & portfolio_items tables
4. Update organizations table with federal fields

### Phase 2: Collaboration (HIGH)
1. Create notes table
2. Create saved_searches table
3. Create favorites table
4. Create user_preferences table

### Phase 3: Analysis (HIGH)
1. Create analysis_runs table
2. Create analysis_results table
3. Create ai_conversations table
4. Create ai_insights table

### Phase 4: Operations (MEDIUM)
1. Create export_jobs table
2. Add missing indexes
3. Update RLS policies for new tables

## Summary

The current schema is designed for a generic multi-tenant SaaS but lacks the specific domain models for federal contracting intelligence. The UI implementation assumes these domain models exist. Implementing the missing tables and fields is critical for the platform to function as designed.

**Total Missing Tables: 15**
**Total Tables Needing Updates: 3**
**Estimated Implementation Time: 2-3 weeks for complete schema alignment**