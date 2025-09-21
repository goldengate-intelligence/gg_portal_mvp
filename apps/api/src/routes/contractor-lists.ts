import { Elysia, t } from 'elysia';
import { ContractorListManager } from '../services/contractor-lists/list-manager';
import { db } from '../db';
import { contractorProfiles, users, userTenants, userOrganizations } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { jwtVerify } from "jose";
import { config } from "../config";

const listManager = new ContractorListManager();

const jwtSecret = new TextEncoder().encode(config.jwt.secret);

const contractorListsRoutes = new Elysia({ prefix: '/contractor-lists' })
  .state('user', null as any)
  .get('/test', () => {
    console.log('🧪 TEST ROUTE CALLED');
    return { success: true, message: 'Contractor lists routes are working' };
  })
  // Add auth as derive instead of beforeHandle
  .derive(async ({ request, store }) => {
    console.log('🔐 DERIVE - Auth check');
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      console.log('🔐 No valid auth header');
      return { user: null };
    }

    const token = authHeader.replace("Bearer ", "");
    
    try {
      const { payload } = await jwtVerify(token, jwtSecret);
      const userId = payload.sub as string;
      
      console.log('🔐 JWT verified, userId:', userId);
      
      // Get user from database
      const result = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.fullName,
          username: users.username,
          role: userTenants.role,
          tenantId: userTenants.tenantId,
          organizationId: userOrganizations.organizationId,
        })
        .from(users)
        .leftJoin(userTenants, eq(users.id, userTenants.userId))
        .leftJoin(userOrganizations, eq(users.id, userOrganizations.userId))
        .where(and(
          eq(users.id, userId),
          eq(users.isActive, true)
        ))
        .limit(1);

      const user = result[0];
      
      if (user) {
        console.log('🔐 User authenticated:', user.email);
        // Return user in context
        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name || user.username || '',
            role: user.role || 'member',
            tenantId: user.tenantId || '',
            organizationId: user.organizationId || null,
          }
        };
      }
    } catch (error) {
      console.log('🔐 JWT verification failed:', error);
    }
    
    return { user: null };
  })
  
  // Get user's favorites (contractors in any list)
  .get('/favorites', async ({ user }) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const favoriteIds = await listManager.getUserFavorites(user.id);
      
      // Get the contractor profiles
      let contractors = [];
      if (favoriteIds.length > 0) {
        contractors = await db
          .select()
          .from(contractorProfiles)
          .where(eq(contractorProfiles.id, favoriteIds[0])); // Start with first ID
        
        // Add remaining IDs if any
        for (let i = 1; i < favoriteIds.length; i++) {
          const moreContractors = await db
            .select()
            .from(contractorProfiles)
            .where(eq(contractorProfiles.id, favoriteIds[i]));
          contractors = [...contractors, ...moreContractors];
        }
      }
      
      return {
        success: true,
        data: {
          contractorIds: favoriteIds,
          contractors,
        },
      };
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch favorites',
      };
    }
  }, {
    detail: {
      summary: 'Get user favorites',
      description: 'Returns all contractors that are in any of the user\'s lists. This endpoint aggregates all contractors across all user lists to provide a unified favorites view.',
      tags: ['contractor-lists'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Successfully retrieved favorites',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      contractorIds: {
                        type: 'array',
                        items: { type: 'string', format: 'uuid' },
                        example: ['262c0a89-9812-4b8e-b869-1aed3df3822c']
                      },
                      contractors: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string', format: 'uuid' },
                            displayName: { type: 'string', example: 'RAYTHEON COMPANY' },
                            totalObligated: { type: 'string', example: '7863687646700.92' },
                            totalContracts: { type: 'number', example: 27552 },
                            primaryAgency: { type: 'string', example: 'Department of Defense' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing authentication token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: { type: 'string', example: 'User not authenticated' }
                }
              }
            }
          }
        }
      }
    },
    response: t.Object({
      success: t.Boolean(),
      data: t.Optional(t.Object({
        contractorIds: t.Array(t.String()),
        contractors: t.Array(t.Any())
      })),
      error: t.Optional(t.String())
    })
  })
  // Get all lists for the current user
  .get('/', async ({ user }) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const lists = await listManager.getUserLists(user.id);
      
      return {
        success: true,
        data: lists,
      };
    } catch (error: any) {
      console.error('Error fetching user lists:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch lists',
      };
    }
  }, {
    detail: {
      summary: 'Get all lists',
      description: 'Returns all contractor lists owned by the authenticated user. Lists are returned sorted by sortOrder and creation date. Each list includes metadata such as item count and total portfolio value.',
      tags: ['contractor-lists'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Successfully retrieved user lists',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid', example: '7f10b7cf-5d70-4f77-bc82-8b7a4a942359' },
                        userId: { type: 'string', format: 'uuid' },
                        name: { type: 'string', example: 'My Portfolio' },
                        description: { type: 'string', example: 'Default contractor portfolio' },
                        isDefault: { type: 'boolean', example: true },
                        isPublic: { type: 'boolean', example: false },
                        color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$', example: '#EAB308' },
                        icon: { type: 'string', example: 'star' },
                        sortOrder: { type: 'number', example: 0 },
                        itemCount: { type: 'number', example: 5 },
                        totalValue: { type: 'string', example: '7863687646700.92' },
                        lastItemAddedAt: { type: 'string', format: 'date-time' },
                        settings: { type: 'object' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized - Invalid or missing authentication token'
        }
      }
    },
    response: t.Object({
      success: t.Boolean(),
      data: t.Optional(t.Array(t.Any())),
      error: t.Optional(t.String())
    })
  })
  
  // Get a specific list with items
  .get('/:listId', async ({ user, params }) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const result = await listManager.getListWithItems(params.listId, user.id);
      
      if (!result) {
        return {
          success: false,
          error: 'List not found or access denied',
        };
      }
      
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('Error fetching list:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch list',
      };
    }
  }, {
    params: t.Object({
      listId: t.String(),
    }),
    detail: {
      summary: 'Get list with items',
      description: 'Returns a specific list with all its contractor items',
      tags: ['contractor-lists'],
      security: [{ bearerAuth: [] }]
    }
  })
  
  // Toggle contractor in default list (favorite/unfavorite)
  .post('/toggle-favorite', async ({ user, body }) => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      if (!body?.contractorProfileId) {
        throw new Error('contractorProfileId is required');
      }
      
      const result = await listManager.toggleInDefaultList(
        body.contractorProfileId,
        user.id
      );
      
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      return {
        success: false,
        error: error.message || 'Failed to toggle favorite',
      };
    }
  }, {
    body: t.Object({
      contractorProfileId: t.String(),
    }),
    detail: {
      summary: 'Toggle favorite',
      description: 'Add or remove a contractor from the user\'s default favorites list',
      tags: ['contractor-lists'],
      security: [{ bearerAuth: [] }]
    }
  })

  // Create a new list
  .post('/', async (context) => {
    try {
      if (!context.user) {
        throw new Error('User not authenticated');
      }
      const list = await listManager.createList(context.user.id, context.body);
      
      return {
        success: true,
        data: list,
      };
    } catch (error: any) {
      console.error('Error creating list:', error);
      return {
        success: false,
        error: error.message || 'Failed to create list',
      };
    }
  }, {
    body: t.Object({
      name: t.String({ minLength: 1, maxLength: 255 }),
      description: t.Optional(t.String()),
      color: t.Optional(t.String({ pattern: '^#[0-9A-Fa-f]{6}$' })),
      icon: t.Optional(t.String()),
      isPublic: t.Optional(t.Boolean()),
    }),
    detail: {
      summary: 'Create new list',
      description: 'Create a new contractor list for organizing contractors. Each user can have multiple lists for different purposes (e.g., "Potential Partners", "Competitors", "Subcontractors").',
      tags: ['contractor-lists'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List successfully created'
        },
        400: {
          description: 'Bad request - Invalid list data'
        },
        401: {
          description: 'Unauthorized'
        }
      }
    }
  })

  // Update a list
  .patch('/:listId', async (context) => {
    try {
      if (!context.user) {
        throw new Error('User not authenticated');
      }
      const list = await listManager.updateList(context.params.listId, context.user.id, context.body);
      
      return {
        success: true,
        data: list,
      };
    } catch (error: any) {
      console.error('Error updating list:', error);
      return {
        success: false,
        error: error.message || 'Failed to update list',
      };
    }
  }, {
    params: t.Object({
      listId: t.String(),
    }),
    body: t.Object({
      name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
      description: t.Optional(t.String()),
      color: t.Optional(t.String({ pattern: '^#[0-9A-Fa-f]{6}$' })),
      icon: t.Optional(t.String()),
      isPublic: t.Optional(t.Boolean()),
      sortOrder: t.Optional(t.Number()),
    }),
    detail: {
      summary: 'Update list',
      description: 'Update an existing contractor list. Only the list owner can update it.',
      tags: ['contractor-lists'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List successfully updated'
        },
        403: {
          description: 'Forbidden - Only list owner can update'
        },
        404: {
          description: 'List not found'
        }
      }
    }
  })

  // Delete a list
  .delete('/:listId', async (context) => {
    try {
      if (!context.user) {
        throw new Error('User not authenticated');
      }
      const success = await listManager.deleteList(context.params.listId, context.user.id);
      
      return {
        success,
        message: success ? 'List deleted successfully' : 'Failed to delete list',
      };
    } catch (error: any) {
      console.error('Error deleting list:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete list',
      };
    }
  }, {
    params: t.Object({
      listId: t.String(),
    }),
    detail: {
      summary: 'Delete list',
      description: 'Delete a contractor list. Only the list owner can delete it. Default lists cannot be deleted.',
      tags: ['contractor-lists'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'List successfully deleted'
        },
        403: {
          description: 'Forbidden - Cannot delete default list or not the owner'
        },
        404: {
          description: 'List not found'
        }
      }
    }
  })

  // Add a contractor to a list
  .post('/:listId/items', async (context) => {
    try {
      if (!context.user) {
        throw new Error('User not authenticated');
      }
      // Verify the contractor profile exists
      const [contractor] = await db
        .select()
        .from(contractorProfiles)
        .where(eq(contractorProfiles.id, context.body.contractorProfileId))
        .limit(1);
      
      if (!contractor) {
        return {
          success: false,
          error: 'Contractor profile not found',
        };
      }
      
      const item = await listManager.addToList(
        context.params.listId,
        context.body.contractorProfileId,
        context.user.id,
        {
          notes: context.body.notes,
          tags: context.body.tags,
          rating: context.body.rating,
          priority: context.body.priority,
        }
      );
      
      return {
        success: true,
        data: item,
      };
    } catch (error: any) {
      console.error('Error adding to list:', error);
      return {
        success: false,
        error: error.message || 'Failed to add to list',
      };
    }
  }, {
    params: t.Object({
      listId: t.String(),
    }),
    body: t.Object({
      contractorProfileId: t.String(),
      notes: t.Optional(t.String()),
      tags: t.Optional(t.Array(t.String())),
      rating: t.Optional(t.Number({ minimum: 1, maximum: 5 })),
      priority: t.Optional(t.Union([
        t.Literal('high'),
        t.Literal('medium'),
        t.Literal('low'),
      ])),
    })
  })

  // Remove a contractor from a list
  .delete('/:listId/items/:contractorProfileId', async (context) => {
    try {
      if (!context.user) {
        throw new Error('User not authenticated');
      }
      const success = await listManager.removeFromList(
        context.params.listId,
        context.params.contractorProfileId,
        context.user.id
      );
      
      return {
        success,
        message: success ? 'Removed from list' : 'Item not found in list',
      };
    } catch (error: any) {
      console.error('Error removing from list:', error);
      return {
        success: false,
        error: error.message || 'Failed to remove from list',
      };
    }
  }, {
    params: t.Object({
      listId: t.String(),
      contractorProfileId: t.String(),
    })
  })

  // Check if contractors are in user's lists
  .post('/check-favorites', async (context) => {
    try {
      if (!context.user) {
        throw new Error('User not authenticated');
      }
      const results: Record<string, { inLists: boolean; listIds: string[] }> = {};
      
      for (const contractorId of context.body.contractorProfileIds) {
        results[contractorId] = await listManager.isInUserLists(contractorId, context.user.id);
      }
      
      return {
        success: true,
        data: results,
      };
    } catch (error: any) {
      console.error('Error checking favorites:', error);
      return {
        success: false,
        error: error.message || 'Failed to check favorites',
      };
    }
  }, {
    body: t.Object({
      contractorProfileIds: t.Array(t.String()),
    })
  })

  // Ensure user has a default list
  .post('/ensure-default', async (context) => {
    try {
      if (!context.user) {
        throw new Error('User not authenticated');
      }
      const defaultList = await listManager.ensureDefaultList(context.user.id);
      
      return {
        success: true,
        data: defaultList,
      };
    } catch (error: any) {
      console.error('Error ensuring default list:', error);
      return {
        success: false,
        error: error.message || 'Failed to ensure default list',
      };
    }
  });

export default contractorListsRoutes;