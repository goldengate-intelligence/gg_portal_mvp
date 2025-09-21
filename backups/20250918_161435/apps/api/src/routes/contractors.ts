import { Elysia, t } from 'elysia';
import { authMiddleware, requireAuth, requireRole } from '../middleware/auth';
import { contractorService } from '../services/contractors';
import path from 'path';

const contractorsRoutes = new Elysia({ prefix: '/contractors' })
  .use(authMiddleware())
  .use(requireAuth())
  
  // Query contractors with filters
  .get('/', async ({ query }) => {
    try {
      const filters: any = {};
      
      // Parse query parameters
      if (query.search) filters.search = query.search;
      if (query.state) filters.state = query.state.split(',');
      if (query.agency) filters.primaryAgency = query.agency.split(',');
      if (query.industry) filters.industryCluster = query.industry.split(',');
      if (query.lifecycle) filters.lifecycleStage = query.lifecycle.split(',');
      if (query.size) filters.sizeTier = query.size.split(',');
      if (query.minObligated) filters.minTotalObligated = parseFloat(query.minObligated);
      if (query.maxObligated) filters.maxTotalObligated = parseFloat(query.maxObligated);
      if (query.minContracts) filters.minContracts = parseInt(query.minContracts);
      if (query.maxContracts) filters.maxContracts = parseInt(query.maxContracts);
      
      const result = await contractorService.query.queryContractors({
        filters,
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 50,
        sortBy: query.sortBy as any,
        sortOrder: query.sortOrder as 'asc' | 'desc',
      });
      
      return {
        success: true,
        ...result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to query contractors',
      };
    }
  }, {
    query: t.Object({
      search: t.Optional(t.String()),
      state: t.Optional(t.String()),
      agency: t.Optional(t.String()),
      industry: t.Optional(t.String()),
      lifecycle: t.Optional(t.String()),
      size: t.Optional(t.String()),
      minObligated: t.Optional(t.String()),
      maxObligated: t.Optional(t.String()),
      minContracts: t.Optional(t.String()),
      maxContracts: t.Optional(t.String()),
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      sortBy: t.Optional(t.String()),
      sortOrder: t.Optional(t.String()),
    })
  })
  
  // Get contractor by UEI
  .get('/:uei', async ({ params }) => {
    try {
      const contractor = await contractorService.query.getContractorByUei(params.uei);
      
      if (!contractor) {
        return {
          success: false,
          error: 'Contractor not found',
        };
      }
      
      return {
        success: true,
        data: contractor,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get contractor',
      };
    }
  }, {
    params: t.Object({
      uei: t.String(),
    })
  })
  
  // Search contractors
  .get('/search/:term', async ({ params, query }) => {
    try {
      const limit = query.limit ? parseInt(query.limit) : 20;
      const contractors = await contractorService.query.searchContractors(
        params.term,
        limit
      );
      
      return {
        success: true,
        data: contractors,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Search failed',
      };
    }
  }, {
    params: t.Object({
      term: t.String(),
    }),
    query: t.Object({
      limit: t.Optional(t.String()),
    })
  })
  
  // Get top contractors
  .get('/top/:metric', async ({ params, query }) => {
    try {
      const filters: any = {};
      
      // Parse filters
      if (query.state) filters.state = query.state.split(',');
      if (query.agency) filters.primaryAgency = query.agency.split(',');
      if (query.industry) filters.industryCluster = query.industry.split(',');
      
      const contractors = await contractorService.query.getTopContractors({
        metric: params.metric as any,
        limit: query.limit ? parseInt(query.limit) : 10,
        filters,
      });
      
      return {
        success: true,
        data: contractors,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get top contractors',
      };
    }
  }, {
    params: t.Object({
      metric: t.Union([
        t.Literal('totalObligated'),
        t.Literal('totalContracts'),
        t.Literal('agencyDiversity'),
      ]),
    }),
    query: t.Object({
      limit: t.Optional(t.String()),
      state: t.Optional(t.String()),
      agency: t.Optional(t.String()),
      industry: t.Optional(t.String()),
    })
  })
  
  // Get filter options
  .get('/filters/options', async () => {
    try {
      const options = await contractorService.query.getFilterOptions();
      
      return {
        success: true,
        data: options,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get filter options',
      };
    }
  })
  
  // Get statistics
  .get('/stats/summary', async ({ query }) => {
    try {
      const filters: any = {};
      
      // Parse filters
      if (query.state) filters.state = query.state.split(',');
      if (query.agency) filters.primaryAgency = query.agency.split(',');
      if (query.industry) filters.industryCluster = query.industry.split(',');
      
      const stats = await contractorService.query.getStatistics(filters);
      
      return {
        success: true,
        data: stats,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get statistics',
      };
    }
  }, {
    query: t.Object({
      state: t.Optional(t.String()),
      agency: t.Optional(t.String()),
      industry: t.Optional(t.String()),
    })
  })
  
  // Admin routes - require admin role
  .group('/admin', app => app
    .use(requireRole('admin'))
    
    // Import from CSV
    .post('/import/csv', async ({ body }) => {
      try {
        // For production, you'd handle file upload
        // For now, using the sample data path
        const filePath = path.join(
          process.cwd(),
          '..',
          '..',
          'sample_data',
          'contractors.csv'
        );
        
        const result = await contractorService.import.importFromCSV(filePath, {
          truncate: body.truncate,
          batchSize: body.batchSize,
        });
        
        return {
          success: result.success,
          totalProcessed: result.totalProcessed,
          totalErrors: result.totalErrors,
          duration: result.duration,
          error: result.error,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Import failed',
        };
      }
    }, {
      body: t.Object({
        truncate: t.Optional(t.Boolean()),
        batchSize: t.Optional(t.Number()),
      })
    })
    
    // Sync from Snowflake
    .post('/sync/snowflake', async ({ body }) => {
      try {
        const result = await contractorService.sync.syncFromSnowflake({
          fullSync: body.fullSync,
          batchSize: body.batchSize,
          sinceDate: body.sinceDate ? new Date(body.sinceDate) : undefined,
          tableName: body.tableName,
          schemaName: body.schemaName,
        });
        
        return {
          success: result.success,
          recordsSynced: result.recordsSynced,
          duration: result.duration,
          error: result.error,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Sync failed',
        };
      }
    }, {
      body: t.Object({
        fullSync: t.Optional(t.Boolean()),
        batchSize: t.Optional(t.Number()),
        sinceDate: t.Optional(t.String()),
        tableName: t.Optional(t.String()),
        schemaName: t.Optional(t.String()),
      })
    })
  );

export default contractorsRoutes;