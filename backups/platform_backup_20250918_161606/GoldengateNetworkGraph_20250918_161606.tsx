import React, { useEffect, useRef, useState, useCallback } from 'react';

interface NetworkNode {
  id: string;
  label: string;
  type: 'prime' | 'sub' | 'hybrid' | 'agency';
  value: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  revenue: number;
  contracts: number;
}

interface GoldengateNetworkGraphProps {
  title?: string;
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  height?: number;
  liveIndicator?: boolean;
  liveText?: string;
  selectedNode?: string;
  onNodeClick?: (nodeId: string) => void;
}

export function GoldengateNetworkGraph({
  title,
  nodes,
  edges,
  height = 400,
  liveIndicator = false,
  liveText = 'LIVE',
  selectedNode,
  onNodeClick,
}: GoldengateNetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  // Hover disabled
  // const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const hoveredNode = null;
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const nodesRef = useRef<NetworkNode[]>([]);
  const originalPositions = useRef(new Map<string, {x: number, y: number}>());
  
  const animate = useCallback(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas with dark background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Disable physics to prevent position override
    // if (!isDragging) {
    //   updatePhysics(nodesRef.current, edges);
    // }

    // Draw edges with dynamic sizing
    const totalNodeCount = nodesRef.current.length;
    edges.forEach(edge => {
      const sourceNode = nodesRef.current.find(n => n.id === edge.source);
      const targetNode = nodesRef.current.find(n => n.id === edge.target);

      if (sourceNode && targetNode) {
        drawAnimatedEdge(ctx, sourceNode, targetNode, edge, hoveredNode, Date.now(), totalNodeCount);
      }
    });

    // Draw nodes with dynamic sizing
    nodesRef.current.forEach((node, index) => {
      const isHovered = node.id === hoveredNode;
      const isSelected = node.id === selectedNode;
      const isDragged = node.id === draggedNode;
      drawEnhancedNode(ctx, node, isHovered, isSelected, isDragged, Date.now(), totalNodeCount);
    });
    
    // Tooltips disabled
    /*
    if (hoveredNode) {
      const node = nodesRef.current.find(n => n.id === hoveredNode);
      if (node) {
        const connections = edges.filter(e => e.source === hoveredNode || e.target === hoveredNode).length;
        drawTooltip(ctx, node, connections, edges, hoveredNode);
      }
    }
    */
    
    animationRef.current = requestAnimationFrame(animate);
  }, [nodes, edges, hoveredNode, selectedNode, isDragging, draggedNode]);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2; // Higher resolution
    canvas.height = rect.height * 2;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(2, 2); // Scale for retina displays
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    
    // Initialize node positions - use actual display dimensions
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    nodesRef.current = initializeNodePositions(nodes, edges, displayWidth, displayHeight);
    console.log('Canvas dimensions:', displayWidth, 'x', displayHeight);
    console.log('Initialized nodes with positions:', nodesRef.current.map(n => ({ id: n.id, x: n.x, y: n.y })));
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes, edges, animate]);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - rect.left);
      const y = (e.clientY - rect.top);
      
      if (isDragging && draggedNode) {
        const node = nodesRef.current.find(n => n.id === draggedNode);
        if (node) {
          node.fx = x;
          node.fy = y;
          node.x = x;
          node.y = y;
        }
      } else {
        const clickedNode = nodesRef.current.find(node => {
          const dx = x - (node.x || 0);
          const dy = y - (node.y || 0);
          const distance = Math.sqrt(dx * dx + dy * dy);
          const sizeFactor = node.type === 'hybrid' ? 1.5 : 1;
          const radius = Math.max(20, Math.min(40, Math.sqrt(node.value / 1000000) * 3)) * sizeFactor;
          return distance < radius;
        });
        
        // Hover disabled
        // setHoveredNode(clickedNode?.id || null);
        canvas.style.cursor = 'default';
      }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      const x = (e.clientX - rect.left);
      const y = (e.clientY - rect.top);
      
      const clickedNode = nodesRef.current.find(node => {
        const dx = x - (node.x || 0);
        const dy = y - (node.y || 0);
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Match the radius calculation from drawEnhancedNode
        const sizeFactor = node.type === 'hybrid' ? 1.5 : 1;
        const radius = Math.max(20, Math.min(40, Math.sqrt(node.value / 1000000) * 3)) * sizeFactor;
        return distance < radius;
      });
      
      if (clickedNode) {
        setIsDragging(true);
        setDraggedNode(clickedNode.id);
        clickedNode.fx = clickedNode.x;
        clickedNode.fy = clickedNode.y;
      }
    };
    
    const handleMouseUp = () => {
      if (draggedNode) {
        const node = nodesRef.current.find(n => n.id === draggedNode);
        if (node) {
          node.fx = null;
          node.fy = null;
        }
      }
      setIsDragging(false);
      setDraggedNode(null);
    };
    
    const handleClick = (e: MouseEvent) => {
      const x = (e.clientX - rect.left);
      const y = (e.clientY - rect.top);
      
      const clickedNode = nodesRef.current.find(node => {
        const dx = x - (node.x || 0);
        const dy = y - (node.y || 0);
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Match the radius calculation from drawEnhancedNode
        const sizeFactor = node.type === 'hybrid' ? 1.5 : 1;
        const radius = Math.max(20, Math.min(40, Math.sqrt(node.value / 1000000) * 3)) * sizeFactor;
        return distance < radius;
      });
      
      if (clickedNode && onNodeClick && !isDragging) {
        onNodeClick(clickedNode.id);
      }
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    canvas.addEventListener('click', handleClick);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
      canvas.removeEventListener('click', handleClick);
    };
  }, [isDragging, draggedNode, onNodeClick]);
  
  function initializeNodePositions(nodes: NetworkNode[], edges: NetworkEdge[], width: number, height: number): NetworkNode[] {
    console.log('Initializing nodes:', nodes, 'Canvas size:', width, 'x', height);
    const centerX = width / 2;
    const centerY = height / 2;
    // Moderate spacing for better visual balance
    const radiusX = width * 0.35;  // Use reasonable width
    const radiusY = height * 0.32; // Use reasonable height
    
    // Separate nodes by type
    const mainNode = nodes.find(n => n.type === 'hybrid');
    const agencyNodes = nodes.filter(n => n.type === 'agency');
    const primeNodes = nodes.filter(n => n.type === 'prime');
    const subNodes = nodes.filter(n => n.type === 'sub');

    return nodes.map((node) => {
      let x, y;

      if (node.type === 'hybrid') {
        // Place main node at center
        x = centerX;
        y = centerY;
      } else if (node.type === 'agency') {
        // Place agencies at the top
        const agencyIndex = agencyNodes.indexOf(node);
        const angle = Math.PI / 2; // Directly at top
        x = centerX;
        y = centerY - radiusY * 0.8; // Moderate distance up
      } else if (node.type === 'prime') {
        // Place prime contractors on the left side - VERY far out
        const primeIndex = primeNodes.indexOf(node);
        const totalPrimes = primeNodes.length;

        if (totalPrimes === 1) {
          // Single prime - left side
          x = centerX - radiusX * 0.85;
          y = centerY;
        } else if (totalPrimes === 2) {
          // Two primes - diagonal positioning on left
          x = centerX - radiusX * 0.8;
          y = centerY + (primeIndex === 0 ? -radiusY * 0.5 : radiusY * 0.5);
        } else {
          // Multiple primes - dynamic spacing based on count
          const nodeCount = nodes.length;
          let verticalSpacing = 80; // Default moderate spacing
          if (nodeCount > 10) {
            verticalSpacing = 60; // Tighter for many nodes
          } else if (nodeCount > 8) {
            verticalSpacing = 70;
          }
          const totalHeight = verticalSpacing * (totalPrimes - 1);
          const startY = centerY - totalHeight / 2;
          x = centerX - radiusX * 0.8;
          y = startY + primeIndex * verticalSpacing;
        }
      } else if (node.type === 'sub') {
        // Place sub contractors on the right side - VERY far out
        const subIndex = subNodes.indexOf(node);
        const totalSubs = subNodes.length;

        if (totalSubs === 1) {
          // Single sub - right side
          x = centerX + radiusX * 0.85;
          y = centerY;
        } else if (totalSubs === 2) {
          // Two subs - diagonal positioning on right
          x = centerX + radiusX * 0.8;
          y = centerY + (subIndex === 0 ? -radiusY * 0.5 : radiusY * 0.5);
        } else if (totalSubs === 3) {
          // Three subs - dynamic spacing based on total nodes
          const nodeCount = nodes.length;
          let verticalSpacing = 80;
          if (nodeCount > 10) {
            verticalSpacing = 60;
          } else if (nodeCount > 8) {
            verticalSpacing = 70;
          }
          const positions = [
            { x: centerX + radiusX * 0.8, y: centerY - verticalSpacing },
            { x: centerX + radiusX * 0.8, y: centerY },
            { x: centerX + radiusX * 0.8, y: centerY + verticalSpacing }
          ];
          x = positions[subIndex].x;
          y = positions[subIndex].y;
        } else {
          // Multiple subs - dynamic spacing based on total nodes
          const nodeCount = nodes.length;
          let verticalSpacing = 70;
          if (nodeCount > 10) {
            verticalSpacing = 55;
          } else if (nodeCount > 8) {
            verticalSpacing = 65;
          }
          const totalHeight = verticalSpacing * (totalSubs - 1);
          const startY = centerY - totalHeight / 2;
          x = centerX + radiusX * 0.8;
          y = startY + subIndex * verticalSpacing;
        }
      } else {
        // Fallback for any other type
        x = centerX + (Math.random() - 0.5) * radius;
        y = centerY + (Math.random() - 0.5) * radius;
      }
      
      return {
        ...node,
        x,
        y,
        vx: 0,
        vy: 0
        // Remove fx/fy to allow physics-based movement with spring constraints
      };
    });
  }
  
  function updatePhysics(nodes: NetworkNode[], edges: NetworkEdge[]) {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const alpha = 0.08; // Increased for more noticeable movement
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Store original positions for gentle constraint
    if (originalPositions.current.size === 0) {
      nodes.forEach(node => {
        originalPositions.current.set(node.id, { x: node.x, y: node.y });
      });
    }
    
    // Apply forces
    nodes.forEach((node, i) => {
      // Temporarily allow movement for gentle physics
      const originalPos = originalPositions.current.get(node.id);
      if (!originalPos) return;
      
      let fx = 0;
      let fy = 0;
      
      // Moderate spring force back to original position (allows more movement)
      const springStrength = 0.65;
      const dx_spring = originalPos.x - node.x!;
      const dy_spring = originalPos.y - node.y!;
      fx += dx_spring * springStrength;
      fy += dy_spring * springStrength;
      
      // Very weak repulsion between nodes for subtle movement
      nodes.forEach((other, j) => {
        if (i !== j) {
          const dx = node.x! - other.x!;
          const dy = node.y! - other.y!;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          // Weak repulsion for subtle but visible movement
          const strength = 100; // Increased for more motion
          const force = strength / (distance * distance);
          fx += (dx / distance) * force;
          fy += (dy / distance) * force;
        }
      });
      
      // Attraction along edges
      edges.forEach(edge => {
        let other: NetworkNode | undefined;
        if (edge.source === node.id) {
          other = nodes.find(n => n.id === edge.target);
        } else if (edge.target === node.id) {
          other = nodes.find(n => n.id === edge.source);
        }
        
        if (other) {
          const dx = other.x! - node.x!;
          const dy = other.y! - node.y!;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          // Calculate ideal distance based on node values
          const sourceRadius = 15 + (60 - 15) * (Math.log10(Math.max(1, node.value / 1000000) + 1) / Math.log10(10000 + 1));
          const targetRadius = 15 + (60 - 15) * (Math.log10(Math.max(1, other.value / 1000000) + 1) / Math.log10(10000 + 1));
          const idealDistance = sourceRadius + targetRadius + 80; // Dynamic spacing based on node sizes
          const strength = 0.01 * (edge.weight / 50); // Much weaker than before
          const force = strength * (distance - idealDistance);
          fx += (dx / distance) * force;
          fy += (dy / distance) * force;
        }
      });
      
      // Centering force
      fx += (centerX - node.x!) * 0.01;
      fy += (centerY - node.y!) * 0.01;
      
      // Apply forces with moderate damping for subtle movement
      node.vx = (node.vx || 0) * 0.85 + fx * alpha;
      node.vy = (node.vy || 0) * 0.85 + fy * alpha;
      
      // Update position
      node.x! += node.vx!;
      node.y! += node.vy!;
      
      // Constrain movement to small range around original position for subtle motion
      const maxDrift = 15; // Increased for more noticeable movement
      const dx = node.x! - originalPos.x;
      const dy = node.y! - originalPos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > maxDrift) {
        node.x = originalPos.x + (dx / distance) * maxDrift;
        node.y = originalPos.y + (dy / distance) * maxDrift;
      }
      
      // Keep nodes within canvas bounds
      const margin = 40;
      node.x = Math.max(margin, Math.min(rect.width - margin, node.x!));
      node.y = Math.max(margin, Math.min(rect.height - margin, node.y!));
    });
  }
  
  function drawAnimatedGrid(ctx: CanvasRenderingContext2D, width: number, height: number, time: number) {
    const offset = time % 100;
    
    // Draw scanlines
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.02)'; // Gold accent
    ctx.lineWidth = 0.5;
    
    // Animated vertical lines
    for (let x = -offset; x < width + 100; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Static horizontal lines
    for (let y = 0; y < height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Add subtle gradient overlay
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.01)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  function drawAnimatedEdge(ctx: CanvasRenderingContext2D, source: NetworkNode, target: NetworkNode, edge: NetworkEdge, hoveredNode: string | null, time: number, totalNodes: number = 5) {
    // Simple color based on money flow direction
    let edgeColor: string;
    if (source.type === 'hybrid') {
      // Money going out from contractor (to subs) - RED
      edgeColor = '#FF4C4C';
    } else if (target.type === 'hybrid') {
      // Money coming in to contractor (from agencies/primes) - GREEN
      edgeColor = '#38E54D';
    } else {
      // Edge between non-contractor nodes
      edgeColor = '#666666';
    }

    // Calculate edge properties
    const dx = target.x! - source.x!;
    const dy = target.y! - source.y!;
    const angle = Math.atan2(dy, dx);

    // Calculate node radii (matching drawEnhancedNode) with dynamic sizing
    let dynamicBaseRadius = 48; // Larger default size
    if (totalNodes > 10) {
      dynamicBaseRadius = 35;
    } else if (totalNodes > 8) {
      dynamicBaseRadius = 38;
    } else if (totalNodes > 6) {
      dynamicBaseRadius = 42;
    } else if (totalNodes > 4) {
      dynamicBaseRadius = 45;
    }

    const sourceSizeFactor = source.type === 'hybrid' ? 0.8 : 1.0;
    const targetSizeFactor = target.type === 'hybrid' ? 0.8 : 1.0;
    const sourceRadius = dynamicBaseRadius * sourceSizeFactor;
    const targetRadius = dynamicBaseRadius * targetSizeFactor;

    // Calculate start and end points at circle borders
    const startX = source.x! + sourceRadius * Math.cos(angle);
    const startY = source.y! + sourceRadius * Math.sin(angle);
    const endX = target.x! - targetRadius * Math.cos(angle);
    const endY = target.y! - targetRadius * Math.sin(angle);

    // Uniform line width
    const width = 2;

    // Draw simple solid line (stop before arrow)
    const lineEndX = endX - 10 * Math.cos(angle); // Stop 10px before the circle edge for arrow
    const lineEndY = endY - 10 * Math.sin(angle);

    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.8; // Slight transparency
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(lineEndX, lineEndY);
    ctx.stroke();
    ctx.globalAlpha = 1.0; // Reset alpha
    
    // Draw arrow slightly before the edge touches the circle
    const arrowOffset = 5; // Move arrow back from edge
    const arrowX = endX - arrowOffset * Math.cos(angle);
    const arrowY = endY - arrowOffset * Math.sin(angle);
    const arrowLength = 10;
    const arrowAngle = Math.PI / 6;

    ctx.save();
    ctx.fillStyle = edgeColor;
    ctx.strokeStyle = edgeColor;
    ctx.lineWidth = 2;

    // Draw arrowhead as filled triangle
    ctx.beginPath();
    ctx.moveTo(arrowX + arrowOffset * Math.cos(angle), arrowY + arrowOffset * Math.sin(angle)); // Tip at edge
    ctx.lineTo(
      arrowX - arrowLength * Math.cos(angle - arrowAngle),
      arrowY - arrowLength * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
      arrowX - arrowLength * Math.cos(angle + arrowAngle),
      arrowY - arrowLength * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();

    // Add outline for better visibility
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();
  }
  
  function drawEnhancedNode(ctx: CanvasRenderingContext2D, node: NetworkNode, isHovered: boolean, isSelected: boolean, isDragged: boolean, time: number, totalNodes: number = 5) {
    // Ensure coordinates are valid
    if (!node.x || !node.y) {
      console.warn('Missing node coordinates:', node);
      return;
    }

    // Dynamic bubble sizes based on total number of nodes
    // More nodes = smaller bubbles to prevent overlap
    let dynamicBaseRadius = 48; // Larger default size
    if (totalNodes > 10) {
      dynamicBaseRadius = 35; // Smaller for many nodes
    } else if (totalNodes > 8) {
      dynamicBaseRadius = 38; // Smaller for 9-10 nodes
    } else if (totalNodes > 6) {
      dynamicBaseRadius = 42; // Medium for 7-8 nodes
    } else if (totalNodes > 4) {
      dynamicBaseRadius = 45; // Slightly smaller for 5-6 nodes
    } // else keep at 48 for 4 or fewer nodes

    const sizeFactor = node.type === 'hybrid' ? 0.8 : 1.0;
    const baseRadius = dynamicBaseRadius * sizeFactor;
    const radius = baseRadius;

    // Simple solid colors based on type
    let fillColor: string;
    let borderColor: string;

    if (node.type === 'agency') {
      // Agencies - Lavender
      fillColor = '#9B7EBD';
      borderColor = '#B999D1';
    } else if (node.type === 'prime') {
      // Primes - Blue
      fillColor = '#5BC0EB';
      borderColor = '#7DD0F0';
    } else if (node.type === 'hybrid') {
      // Entity - Gold
      fillColor = '#D2AC38';
      borderColor = '#E5C04A';
    } else {
      // Subs - Red
      fillColor = '#FF4C4C';
      borderColor = '#FF6B6B';
    }
    
    // Glow effects disabled
    /*
    if (isSelected || isHovered || isDragged) {
      const pulse = Math.sin(time / 200) * 0.3 + 0.7;
      const glowRadius = radius + (isHovered ? 15 : 10) * pulse;

      const glowGradient = ctx.createRadialGradient(node.x!, node.y!, radius, node.x!, node.y!, glowRadius);
      glowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      glowGradient.addColorStop(0.5, glowColor);
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, glowRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
    */
    
    // Draw simple filled circle with solid color
    ctx.save();

    // Add subtle shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillStyle = fillColor;
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    // Reset shadow for border
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    
    // Draw company name and value inside the bubble
    ctx.save();

    // Set text color to panel color for names
    const nameColor = '#04070a'; // Default panel color
    const valueColor = '#6B7280'; // Gray-500 for dollar amounts
    ctx.fillStyle = nameColor;
    ctx.font = node.type === 'hybrid' ? 'bold 12px system-ui, -apple-system, sans-serif' : 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Truncate label if too long for the bubble
    const maxLength = node.type === 'hybrid' ? 15 : 12;
    const label = node.label.length > maxLength ? node.label.substring(0, maxLength - 2) + '..' : node.label;

    // Format value
    let formattedValue = '';
    if (node.type !== 'hybrid' && node.value) {
      if (node.value >= 1e9) {
        // Billions - no decimals
        formattedValue = `$${Math.round(node.value / 1e9)}B`;
      } else if (node.value >= 100e6) {
        // Hundreds of millions - no decimals
        formattedValue = `$${Math.round(node.value / 1e6)}M`;
      } else if (node.value >= 1e6) {
        // Millions - round to nearest hundredth if needed
        const millions = node.value / 1e6;
        if (millions % 1 === 0) {
          formattedValue = `$${Math.round(millions)}M`;
        } else {
          formattedValue = `$${millions.toFixed(2).replace(/\.?0+$/, '')}M`;
        }
      } else if (node.value >= 1e3) {
        formattedValue = `$${Math.round(node.value / 1e3)}K`;
      } else {
        formattedValue = `$${Math.round(node.value)}`;
      }
    }

    // Draw label and value
    if (formattedValue) {
      // Draw name slightly above center
      ctx.fillText(label, node.x, node.y - 6);
      // Draw value slightly below center
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = nameColor;
      ctx.fillText(formattedValue, node.x, node.y + 8);
    } else {
      // Just draw the label centered
      ctx.fillText(label, node.x, node.y);
    }

    ctx.restore();
    
    // Show full name on hover below the node if truncated
    if (isHovered && node.label.length > maxLength) {
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 3;
      ctx.fillText(node.label, node.x, node.y + radius + 25);
      ctx.restore();
    }
  }
  
  // Tooltip function disabled
  /*
  function drawTooltip(ctx: CanvasRenderingContext2D, node: NetworkNode, connections: number, edges: NetworkEdge[], nodeId: string) {
    const x = node.x! + 50;
    const y = node.y! - 30;
    const width = 200;
    const height = 80;

    // Calculate total revenue through this node
    const totalRevenue = edges
      .filter(e => e.source === nodeId || e.target === nodeId)
      .reduce((sum, e) => sum + e.revenue, 0);

    // Draw tooltip background with rounded corners
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.strokeStyle = '#00D9FF';
    ctx.lineWidth = 1;
    ctx.beginPath();

    // Manual rounded rectangle for browser compatibility
    const radius = 5;
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();

    // Draw tooltip content
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(node.label, x + 10, y + 20);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '9px sans-serif';
    ctx.fillText(`Connections: ${connections}`, x + 10, y + 40);
    ctx.fillText(`Total Revenue: $${(totalRevenue / 1e6).toFixed(1)}M`, x + 10, y + 55);
    ctx.fillText(`Type: ${node.type}`, x + 10, y + 70);
  }
  */
  
  return (
    <div className="relative w-full h-full">
      {/* Live Indicator */}
      {liveIndicator && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,136,0.5)]" />
          <span className="text-[10px] text-green-400 tracking-wider font-light" style={{ fontFamily: 'Genos, sans-serif' }}>
            {liveText}
          </span>
        </div>
      )}
      
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-lg"
        style={{
          background: 'rgba(0, 0, 0, 0.2)',
          height: typeof height === 'number' ? `${height}px` : height,
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      />
    </div>
  );
}